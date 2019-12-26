import { ipcMain } from 'electron'

import mainDbManager from './db-manager.js'

export default {
  initSubscriptions: function () {
    ipcMain.on('main-get-user-data', (oEvent) => {
      mainDbManager.getUserData().then(
        (oUserData) => {
          oEvent.sender.send('main-get-user-data', oUserData)
        },
        (oError) => {
          oEvent.sender.send('main-get-user-data', { oError })
        }
      )
    })

    ipcMain.on('main-save-user-data', (oEvent, oUserData) => {
      mainDbManager.saveUserData(oUserData)
    })
  },
}
