import { ipcMain } from 'electron'
import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

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
    ipcMain.on('files-create-folder', (oEvent, {sApiHost, sAuthToken, type, path, folderName}) => {
      const oParameters = {
        Type: type,
        Path: path,
        FolderName: folderName,
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: 'CreateFolder',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-create-folder', { result })
          } else {
            oEvent.sender.send('files-create-folder', { error })
          }
        },
      })
    })
    ipcMain.on('files-remove-items', (oEvent, {sApiHost, sAuthToken, type, path, items}) => {
      const oParameters = {
        Type: type,
        Path: path,
        Items: items,
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: 'Delete',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-remove-items', { result })
          } else {
            oEvent.sender.send('files-remove-items', { error })
          }
        },
      })
    })
    ipcMain.on('files-rename-item', (oEvent, { sApiHost, sAuthToken, type, path, name, newName, isLink, isFolder }) => {
      const oParameters = {
        Type: type,
        Path: path,
        Name: name,
        NewName: newName,
        IsLink: isLink,
        IsFolder: isFolder
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: 'Rename',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-rename-item', { result })
          } else {
            oEvent.sender.send('files-rename-item', { error })
          }
        },
      })
    })
    ipcMain.on('files-past-files', (oEvent, { sApiHost, sAuthToken, toType, toPath, copiedFiles }) => {
      const oParameters = {
        FromType: copiedFiles.fromType,
        ToType: toType,
        FromPath: copiedFiles.fromPath,
        ToPath: toPath,
        Files: copiedFiles.files
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: copiedFiles.isCut ? 'Move' : 'Copy',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-past-files', { result })
          } else {
            oEvent.sender.send('files-past-files', { error })
          }
        },
      })
    })
    ipcMain.on('files-save-temp', (oEvent, { sApiHost, sAuthToken, files }) => {
      const oParameters = {
        Files: files
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Files',
        sMethod: 'SaveFilesAsTempFiles',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-save-temp', { result })
          } else {
            oEvent.sender.send('files-save-temp', { error })
          }
        },
      })
    })
  }
}
