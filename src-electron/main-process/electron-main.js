import { app, BrowserWindow, ipcMain, session } from 'electron'
import _ from 'lodash'

import mainManager from './main/manager.js'
import mainDbManager from './main/db-manager.js'

import foldersManager from './mail/folders-manager.js'
import foldersDbManager from './mail/folders-db-manager.js'
import messagesDbManager from './mail/messages-db-manager.js'

import contactsManager from './contacts/manager.js'
import contactsDbManager from './contacts/db-manager.js'

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false
  }

  const childProcess = require('child_process')
  const path = require('path')

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawn = function(command, args) {
    let spawnedProcess, error

    try {
      spawnedProcess = childProcess.spawn(command, args, {
        detached: true
      })
    } catch (error) {}

    return spawnedProcess
  }

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args)
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-updated':
    case '--squirrel-install':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit()
      return true
  }
}

handleSquirrelEvent()

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

const sqlite3 = require('sqlite3').verbose()
const dbFullPath = app.getPath('userData') + '/privatemail.db'
import { version } from '../../package.json'

let mainWindow
let oDbConnect = null

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(process.env.APP_URL)

  oDbConnect = new sqlite3.Database(dbFullPath, (oError) => {
    if (oError === null) {
      mainDbManager.init(oDbConnect, version).then(function () {
        foldersDbManager.init(oDbConnect)
        messagesDbManager.init(oDbConnect)
        contactsDbManager.init(oDbConnect)
      })
    }
  })

  mainWindow.on('closed', () => {
    if (oDbConnect && oDbConnect.open) {
      oDbConnect.close(function (oError) {
        // callback is needed to prevent SQLITE_BUSY error being displayed
      })
    }
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('init', (oEvent, { sApiHost, sAuthToken }) => {
  const oCookie = { url: sApiHost, name: 'AuthToken', value: sAuthToken }
  session.defaultSession.cookies.set(oCookie)
})

ipcMain.on('logout', (oEvent, { sApiHost }) => {
  session.defaultSession.cookies.remove(sApiHost, 'AuthToken')
})

ipcMain.on('db-remove-all', (oEvent) => {
  if (oDbConnect && oDbConnect.open) {
    oDbConnect.close(function (oDbCloseError) {
      if (oDbCloseError === null) {
        oDbConnect = null
        mainDbManager.init(oDbConnect)
        foldersDbManager.init(oDbConnect)
        messagesDbManager.init(oDbConnect)
        contactsDbManager.init(oDbConnect)
        const fs = require('fs')

        fs.unlink(dbFullPath, (oUnlinkError) => {
          if (!oUnlinkError) {
            oDbConnect = new sqlite3.Database(dbFullPath, (oDbCOnnectError) => {
              if (oDbCOnnectError === null) {
                mainDbManager.init(oDbConnect)
                foldersDbManager.init(oDbConnect)
                messagesDbManager.init(oDbConnect)
                contactsDbManager.init(oDbConnect)
                oEvent.sender.send('db-remove-all', { bRemoved: true })
              } else {
                oEvent.sender.send('db-remove-all', { sError: 'DB error' })
              }
            })
          } else {
            oEvent.sender.send('db-remove-all', { sError: 'DB error' })
          }
        })
      } else {
        oEvent.sender.send('db-remove-all', { sError: 'DB error' })
      }
    })
  } else {
    oEvent.sender.send('db-remove-all', { sError: 'DB error' })
  }
})

ipcMain.on('db-get-folders', (oEvent, iAccountId) => {
  foldersDbManager.getFolders(iAccountId).then(
    (oFolderList) => {
      oEvent.sender.send('db-get-folders', oFolderList)
    },
    (oResult) => {
      oEvent.sender.send('db-get-folders', null)
      oEvent.sender.send('notification', oResult)
    }
  )
})

ipcMain.on('db-set-folders', (oEvent, oFolderList) => {
  foldersDbManager.setFolders({
    iAccountId: oFolderList.AccountId,
    oFolderList: {
      AccountId: oFolderList.AccountId,
      Namespace: oFolderList.Namespace,
      Count: oFolderList.Count,
      Tree: oFolderList.Tree,
    },
  }).then(
    () => {},
    (oResult) => {
      oEvent.sender.send('notification', oResult)
    }
  )
})

ipcMain.on('db-get-messagesinfo', (oEvent, { iAccountId, sFolderFullName }) => {
  foldersDbManager.getMessagesInfo({ iAccountId, sFolderFullName }).then(
    (oMessagesInfo) => {
      oEvent.sender.send('db-get-messagesinfo', { iAccountId, sFolderFullName, oMessagesInfo })
    },
    (oResult) => {
      oEvent.sender.send('db-get-messagesinfo', { iAccountId, sFolderFullName, oMessagesInfo: null })
      oEvent.sender.send('notification', oResult)
    }
  )
})

ipcMain.on('db-set-messagesinfo', (oEvent, { iAccountId, sFolderFullName, oMessagesInfo }) => {
  foldersDbManager.setMessagesInfo({ iAccountId, sFolderFullName, oMessagesInfo }).then(
    () => {
      foldersDbManager.getFolders(iAccountId).then(
        (oFolderList) => {
          let oFolder = foldersManager.getFolder(oFolderList, sFolderFullName)
          if (oFolder) {
            delete oFolder.HasChanges
          }
          foldersDbManager.setFolders({iAccountId, oFolderList}).then(
            () => {},
            (oResult) => {
              oEvent.sender.send('notification', oResult)
            }
          )
        },
        (oResult) => {
          oEvent.sender.send('notification', oResult)
        }
      )
    },
    (oResult) => {
      oEvent.sender.send('notification', oResult)
    }
  )
})

ipcMain.on('db-get-messages', (oEvent, { iAccountId, sFolderFullName, aUids, sSearch, sFilter }) => {
  messagesDbManager.getMessages({ iAccountId, sFolderFullName, aUids, sSearch, sFilter }).then(
    ({ aMessages, oAdvancedSearch }) => {
      oEvent.sender.send('db-get-messages', { iAccountId, sFolderFullName, aUids, sSearch, oAdvancedSearch, sFilter, aMessages })
    },
    (oResult) => {
      oEvent.sender.send('notification', oResult)
    }
  )
})

ipcMain.on('db-set-messages', (oEvent, { iAccountId, aMessages }) => {
  messagesDbManager.setMessages({ iAccountId, aMessages }).then(
    () => {
    },
    (oResult) => {
      oEvent.sender.send('notification', oResult)
    }
  )
})

mainManager.initSubscriptions()
contactsManager.initSubscriptions()
