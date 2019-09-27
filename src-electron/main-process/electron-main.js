import { app, BrowserWindow, ipcMain } from 'electron'
import _ from 'lodash'
import foldersDbManager from './db-managers/folders.js'
import foldersManager from './managers/folders.js'

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
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

foldersDbManager.init()

ipcMain.on('db-get-folders', (oEvent, iAccountId) => {
  foldersDbManager.getFolders(iAccountId).then(
    (oFolderList) => {
      oEvent.sender.send('db-get-folders', oFolderList)
    },
    (oResult) => {
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

ipcMain.on('db-get-messages-info', (oEvent, { iAccountId, sFolderFullName }) => {
  foldersDbManager.getMessagesInfo({ iAccountId, sFolderFullName }).then(
    (oMessagesInfo) => {
      oEvent.sender.send('db-get-messages-info', oMessagesInfo)
    },
    (oResult) => {
      oEvent.sender.send('notification', oResult)
    }
  )
})

ipcMain.on('db-set-messages-info', (oEvent, { iAccountId, sFolderFullName, oMessagesInfo }) => {
  foldersDbManager.setMessagesInfo({ iAccountId, sFolderFullName, oMessagesInfo }).then(
    () => {
      foldersDbManager.getFolders(iAccountId).then(
        (oFolderList) => {
          let oFolder = foldersManager.getFolder(oFolderList, sFolderFullName)
          delete oFolder.HasChanges
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
