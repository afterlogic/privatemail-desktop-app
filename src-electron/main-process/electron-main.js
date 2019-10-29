import { app, BrowserWindow, ipcMain } from 'electron'
import _ from 'lodash'

import foldersDbManager from './db-managers/folders.js'
import foldersManager from './managers/folders.js'
import messagesDbManager from './db-managers/messages.js'
import contactsDbManager from './db-managers/contacts.js'

import contactsManager from './managers/contacts.js'

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

const sqlite3 = require('sqlite3').verbose()

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

  oDbConnect = new sqlite3.Database('privatemail.db', (oError) => {
    if (oError === null) {
      foldersDbManager.init(oDbConnect)
      messagesDbManager.init(oDbConnect)
      contactsDbManager.init(oDbConnect)
    }
  })

  mainWindow.on('closed', () => {
    if (oDbConnect) {
      oDbConnect.close()
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

ipcMain.on('db-remove-all', () => {
  if (oDbConnect) {
    oDbConnect.close(function (oDbCloseError) {
      if (oDbCloseError === null) {
        oDbConnect = null
        foldersDbManager.init(oDbConnect)
        messagesDbManager.init(oDbConnect)
        contactsDbManager.init(oDbConnect)
        const fs = require('fs')
        const sPath = './privatemail.db'

        fs.unlink(sPath, (oUnlinkError) => {
          if (!oUnlinkError) {
            oDbConnect = new sqlite3.Database('privatemail.db', (oDbCOnnectError) => {
              if (oDbCOnnectError === null) {
                foldersDbManager.init(oDbConnect)
                messagesDbManager.init(oDbConnect)
                contactsDbManager.init(oDbConnect)
              }
            })
          }
        })
      }
    })
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

ipcMain.on('db-get-messages', (oEvent, { iAccountId, sFolderFullName, aUids }) => {
  messagesDbManager.getMessages({ iAccountId, sFolderFullName, aUids }).then(
    (aMessages) => {
      oEvent.sender.send('db-get-messages', { iAccountId, sFolderFullName, aUids, aMessages })
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

contactsManager.initSubscriptions()
