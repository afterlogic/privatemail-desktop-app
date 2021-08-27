import { ipcMain } from 'electron'
import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'
import axios from "axios";

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
    ipcMain.on('files-update-share', (oEvent, { sApiHost, sAuthToken, storage, path, id, isDir, shares }) => {
      const oParameters = {
        Storage: storage,
        Path: path,
        Id: id,
        IsDir: isDir,
        Shares: shares
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'SharedFiles',
        sMethod: 'UpdateShare',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-update-share', { result })
          } else {
            oEvent.sender.send('files-update-share', { error })
          }
        },
      })
    })
    ipcMain.on('files-get-history', (oEvent, { sApiHost, sAuthToken, resourceType, resourceId, offset, limit }) => {
      const oParameters = {
        ResourceType: resourceType,
        ResourceId: resourceId,
        Offset: offset,
        Limit: limit
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'ActivityHistory',
        sMethod: 'GetList',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-get-history', { result })
          } else {
            oEvent.sender.send('files-get-history', { error })
          }
        },
      })
    })
    ipcMain.on('files-clear-history', (oEvent, { sApiHost, sAuthToken, resourceType, resourceId }) => {
      const oParameters = {
        ResourceType: resourceType,
        ResourceId: resourceId,
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'ActivityHistory',
        sMethod: 'Delete',
        oParameters,
        fCallback: (result, error) => {
          if (result) {
            oEvent.sender.send('files-clear-history', { result })
          } else {
            oEvent.sender.send('files-clear-history', { error })
          }
        },
      })
    })
    ipcMain.on('files-decrypt-chunk', (oEvent, {sAuthToken, chunkLink, oFormData}) => {
       const config = {
         method: 'get',
         url: chunkLink,
         headers: {
           'Authorization': 'Bearer ' + sAuthToken
           // 'Authorization': 'Bearer ' . sAuthToken
         },
         maxRedirects: 0
       };

       axios(config)
         .then( res => {

         })
         .catch(err => {
           axios.get(err.response.headers.location, {
             responseType: 'arraybuffer'
           })
           .then( res => {
             oEvent.sender.send('files-decrypt-chunk', { res })
           })
           .catch(err => {
             oEvent.sender.send('files-decrypt-chunk', { err })
           });

         });





      // let oHeaders = {
      //   //'Content-Type': 'multipart/form-data',
      //   'Authorization': 'Bearer ' + sAuthToken
      // }

      // axios.get(chunkLink,{
      //   headers: oHeaders
      // }).then( res => {
      //   oEvent.sender.send('files-decrypt-chunk', { res })
      // }).catch( err => {
      //   oEvent.sender.send('files-decrypt-chunk', { err, chunkLink })
      // })

      // axios.get('https://private-maildefault.sfo2.digitaloceanspaces.com/dodev%40privatemail.com/.encrypted/3.jpg?response-content-type=image%2Fjpeg&response-content-disposition=attachment%3B%20filename%3D%223.jpg%22&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=EGKBKR7Y5KLQ2H2BUJRL%2F20210827%2Fsfo2%2Fs3%2Faws4_request&X-Amz-Date=20210827T145630Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=bac22cb2ef4ed8c946bca5745281886b98e9c68e87acb514157ee89956cd962c',{
      //   // headers: oHeaders,
      //   responseType: 'arraybuffer'
      // }).then( res => {
      //   console.log(res)
      //   oEvent.sender.send('files-decrypt-chunk', { res })
      // }).catch( err => {
      //   oEvent.sender.send('files-decrypt-chunk', { err, chunkLink })
      // })
    })
  }
}
