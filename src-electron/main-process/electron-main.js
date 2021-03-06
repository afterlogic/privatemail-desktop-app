import { app, BrowserWindow, ipcMain, session } from 'electron'
import _ from 'lodash'
import moment from 'moment'

import typesUtils from './../../src/utils/types.js'
import webApi from './webApi.js'
import appUpdates from './appUpdates.js'
import tray from './tray.js'

import mainManager from './main/manager.js'
import mainDbManager from './main/db-manager.js'

import mailManager from './mail/manager.js'
import accountsDbManager from './mail/accounts-db-manager.js'
import foldersDbManager from './mail/folders-db-manager.js'
import messagesDbManager from './mail/messages-db-manager.js'

import openpgpManager from './openpgp/manager.js'

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
    focusable: true,
  })

  // doesn't work on Mac
  // Check this ELECTRON_FORCE_WINDOW_MENU_BAR on Linux
  if (process.env.PROD) {
    mainWindow.removeMenu()
  }

  mainWindow.loadURL(process.env.APP_URL)

  oDbConnect = new sqlite3.Database(dbFullPath, (oError) => {
    if (oError === null) {
      mainDbManager.init(oDbConnect, version, mainWindow).then(
        () => {
          accountsDbManager.init(oDbConnect)
          foldersDbManager.init(oDbConnect)
          messagesDbManager.init(oDbConnect)
          contactsDbManager.init(oDbConnect)
        },
        () => {}
      )
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

  appUpdates.start(version)
  tray.create(mainWindow)
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

ipcMain.on('app-move-on-top', (oEvent) => {
  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.show()
    mainWindow.focus()
  }
})

ipcMain.on('db-remove-all', (oEvent) => {
  if (oDbConnect && oDbConnect.open) {
    oDbConnect.close(function (oDbCloseError) {
      if (oDbCloseError === null) {
        oDbConnect = null
        mainDbManager.init(oDbConnect)
        accountsDbManager.init(oDbConnect)
        foldersDbManager.init(oDbConnect)
        messagesDbManager.init(oDbConnect)
        contactsDbManager.init(oDbConnect)
        const fs = require('fs')

        fs.unlink(dbFullPath, (oUnlinkError) => {
          if (!oUnlinkError) {
            oDbConnect = new sqlite3.Database(dbFullPath, (oDbConnectError) => {
              if (oDbConnectError === null) {
                mainDbManager.init(oDbConnect, version, mainWindow)
                accountsDbManager.init(oDbConnect)
                foldersDbManager.init(oDbConnect)
                messagesDbManager.init(oDbConnect)
                contactsDbManager.init(oDbConnect)
                oEvent.sender.send('db-remove-all', { bRemoved: true })
              } else {
                oEvent.sender.send('db-remove-all', { sError: 'DB error: cannot connect' })
              }
            })
          } else {
            oEvent.sender.send('db-remove-all', { sError: 'DB error: cannot be removed' })
          }
        })
      } else {
        oEvent.sender.send('db-remove-all', { sError: 'DB error: cannot be closed' })
      }
    })
  } else {
    oEvent.sender.send('db-remove-all', { sError: 'DB error: no db connection' })
  }
})

ipcMain.on('core-get-appdata', (oEvent, { sApiHost, sAuthToken }) => {
  webApi.sendRequest({
    sApiHost,
    sAuthToken,
    sModule: 'Core',
    sMethod: 'GetAppData',
    oParameters: {},
    fCallback: (oResult, oError) => {
      oEvent.sender.send('core-get-appdata', { oResult, oError })
      if (oResult && oResult['Mail'] && typesUtils.isNonEmptyArray(oResult['Mail'].Accounts)) {
        accountsDbManager.setAccounts(oResult['Mail'].Accounts).then (
          () => {
            accountsDbManager.getAccounts().then (
              (aAccounts) => {
                oEvent.sender.send('mail-get-accounts', { aAccounts })
              },
              (oResult) => {
                oEvent.sender.send('mail-get-accounts', oResult)
              }
            )
          }
        )
      } else {
        accountsDbManager.getAccounts().then (
          (aAccounts) => {
            oEvent.sender.send('mail-get-accounts', { aAccounts })
          },
          (oResult) => {
            oEvent.sender.send('mail-get-accounts', oResult)
          }
        )
      }
    },
  })
})

ipcMain.on('core-verify-security-key', (oEvent, { sApiHost, sLogin, sPassword }) => {
  let iStartedTime = moment().unix()
  let verifyWindow = new BrowserWindow({
    width: 400,
    height: 400,
    frame: false,
  })
  let sUrl = sApiHost + '/?verify-security-key&login=' + sLogin + '&password=' + sPassword
  verifyWindow.loadURL(sUrl, {'extraHeaders' : 'pragma: no-cache\n'})
  verifyWindow.webContents.on('devtools-opened', () => { verifyWindow.webContents.closeDevTools() })
  let bEventAlreadySent = false

  let iInterval = setInterval(() => {
    if (verifyWindow) {
      verifyWindow.webContents.executeJavaScript('window.Attestation')
        .then(oAttestation => {
          console.log('oAttestation', oAttestation)
          let iNowTime = moment().unix()
          let iDiff = iNowTime - iStartedTime
          if (!oAttestation && iDiff > 5 * 60) { // in 5 minutes stop waiting for answer
            oAttestation = {
              error: {
                message: 'Unknown error',
              }
            }
          }
          if (oAttestation) {
            oEvent.sender.send('core-verify-security-key', { oAttestation })
            bEventAlreadySent = true
            clearInterval(iInterval)
            verifyWindow.close()
          }
        })
        .catch((oErr) => {
          console.log('oErr', oErr)
          let oAttestation = {
            error: {
              message: 'Unknown error',
            }
          }
          oEvent.sender.send('core-verify-security-key', { oAttestation })
          bEventAlreadySent = true
          clearInterval(iInterval)
          verifyWindow.close()
        })
    }
  }, 1000)
  verifyWindow.on('closed', function () {
    clearInterval(iInterval)
    verifyWindow = null
    if (!bEventAlreadySent) {
      let oAttestation = {
        error: {
          message: 'Unknown error',
        }
      }
      oEvent.sender.send('core-verify-security-key', { oAttestation })
    }
  })
})

ipcMain.on('core-send-web-api-request', (oEvent, { iRequestId, sApiHost, sAuthToken, sModule, sMethod, oParameters }) => {
  webApi.sendRequest({
    sApiHost,
    sAuthToken,
    sModule,
    sMethod,
    oParameters,
    fCallback: (oResult, oError) => {
      oEvent.sender.send('core-send-web-api-request', { iRequestId, oResult, oError })
    },
  })
})

mainManager.initSubscriptions()
mailManager.initSubscriptions()
openpgpManager.initSubscriptions()
contactsManager.initSubscriptions()
