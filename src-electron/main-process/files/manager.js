import { ipcMain } from 'electron'
import _ from 'lodash'
import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'
import store from "../../../src/store";

export default {
  initSubscriptions: function () {
    ipcMain.on('files-get-storages', (oEvent, {sApiHost, sAuthToken}) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: 'GetStorages',
        oParameters: {},
        fCallback: (storageList, error) => {
          if (typesUtils.isNonEmptyArray(storageList)) {
            oEvent.sender.send('files-get-storages', { storageList })
          } else {
            oEvent.sender.send('files-get-storages', { error })
          }
        },
      })
    })
    ipcMain.on('files-get-files', (oEvent, {sApiHost, sAuthToken, type, path, pattern, pathRequired}) => {
      const parameters = {
        Type: type,
        Path: path,
        Pattern: pattern,
        PathRequired: pathRequired
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: 'GetFiles',
        oParameters: parameters,
        fCallback: (files, error) => {
          console.log(files, 'files')
         /* if (typesUtils.isNonEmptyArray(storageList)) {
            oEvent.sender.send('files-get-storages', { storageList })
          } else {
            oEvent.sender.send('files-get-storages', { error })
          }*/
        },
      })
    })
  }
}
