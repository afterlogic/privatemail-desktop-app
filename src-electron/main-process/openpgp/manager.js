import { ipcMain } from 'electron'
import _ from 'lodash'

import webApi from '../webApi.js'

export default {
  initSubscriptions: function () {
    ipcMain.on('openpgp-create-self-destruc-public-link', (oEvent, { sSubject, sData, sRecipientEmail, sEncryptionBasedMode, iLifetimeHrs, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'OpenPgpFilesWebclient',
        sMethod: 'CreateSelfDestrucPublicLink',
        oParameters: {
          'Subject': sSubject,
          'Data': sData,
          'RecipientEmail': sRecipientEmail,
          'PgpEncryptionMode': sEncryptionBasedMode,
          'LifetimeHrs': iLifetimeHrs,
        },
        fCallback: (oResult, oError) => {
          oEvent.sender.send('openpgp-create-self-destruc-public-link', { oResult, oError })
        },
      })
    })

    ipcMain.on('openpgp-save-settings', (oEvent, { sApiHost, sAuthToken, bEnableModule, bRememberPassphrase }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'OpenPgpWebclient',
        sMethod: 'UpdateSettings',
        oParameters: {
          EnableModule: bEnableModule,
          RememberPassphrase: bRememberPassphrase,
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('openpgp-save-settings', { bResult, oError })
        },
      })
    })

  },
}
