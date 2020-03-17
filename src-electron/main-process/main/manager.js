import { ipcMain } from 'electron'

import typesUtils from '../../../src/utils/types.js'

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

    ipcMain.on('main-get-host', (oEvent, { sEmail }) => {
      const https = require('https')
      let aData = []

      https.get('https://torguard.tv/pm/autodiscover.php?email=' + sEmail, (oResponse) => {
        oResponse.on('data', (sData) => {
          aData.push(sData)
        })
        oResponse.on('end', () => {
          let sData = aData.join('')
          let oData = typesUtils.pStringToJson(sData) || {}
          oEvent.sender.send('main-get-host', oData)
        })

      }).on('error', (oError) => {
        oEvent.sender.send('main-get-host', { url: '', error: oError.message })
      })
    })
  },
}
