import { ipcRenderer } from 'electron'
import store from 'src/store'
import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import notification from '../../utils/notification'

export function asyncGetStorages ({ state, commit, getters, dispatch }) {
  ipcRenderer.send('files-get-storages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })
  ipcRenderer.once('files-get-storages', (event, {storageList, oError}) => {
    if (storageList) {
      commit('setStorageList', storageList)
      commit('setCurrentStorage', storageList[0])
      const path = {
        path: '',
        name: storageList[0].DisplayName
      }
      commit('changeCurrentPath', { index: -1, path, lastStorage: true })
    }
  })
}
export function setCurrentStorage ({ state, commit, getters, dispatch }, { currentStorage }) {
  store.commit('files/setCurrentStorage', currentStorage)
}
export function updateExtendedProps ({ state, commit, getters, dispatch }, { type, path, name, paranoidKey, callback } ) {
  const parameters = {
    Type: type,
    Path: path,
    Name: name,
    ExtendedProps: {}
  }
  parameters.ExtendedProps[paranoidKey.key] = paranoidKey.value
  webApi.sendRequest({
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    sModule: 'Files',
    sMethod: 'UpdateExtendedProps',
    oParameters: parameters,
    fCallback: (res, error) => {
      if (res) {
        dispatch('getFiles', {
          currentStorage: type,
          path,
        })
        callback(type, path, name)
      } else {
        notification.showError(error)
      }
    },
  })
}

export function getFiles ({ state, commit, getters, dispatch }, { currentStorage, path, pattern = ''}) {
  dispatch('changeCurrentFile', { currentFile: null })
    commit('setLoadingStatus', { status: true })
    commit('setCurrentPattern', { pattern })
    const parameters = {
      Type: currentStorage,
      Path: path,
      Pattern: pattern,
      PathRequired: false
    }
    webApi.sendRequest({
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sModule: 'Files',
      sMethod: 'GetFiles',
      oParameters: parameters,
      fCallback: (files, error) => {
        if (_.isArray(files?.Items)) {
          commit('setCheckedItems', { checkedItems: [] })
          const currentPath = getters['getCurrentPath']
          const storage = getters['getCurrentStorage']
          const currentPattern = getters['getCurrentPattern']
          if (currentStorage === storage.Type && path === currentPath && currentPattern === pattern) {
            commit('setCurrentFiles', { files: files.Items })
            commit('setLoadingStatus', { status: false })
          }
        }
        if (files?.Quota) {
          commit('setFilesQuota', { quota: files.Quota })
        }
      },
    })
}
export function changeCurrentFile ({ state, commit, getters, dispatch }, { currentFile }) {
  commit('setCurrentFile', { currentFile })
}
export function createFolder ({ state, commit, getters, dispatch }, { type, path, folderName }) {
  ipcRenderer.send('files-create-folder', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    type,
    path,
    folderName
  })

  ipcRenderer.once('files-create-folder', (event, { result, oError }) => {
    if (result) {
      dispatch('getFiles', { currentStorage: type, path })
    }
  })
}
export function changeCurrentPaths ({ state, commit, getters, dispatch }, { path, lastStorage = false }) {
  const currentPaths = getters['getCurrentPaths']
  let index = currentPaths.findIndex( elem => {
   return  elem?.path === path?.path
  })
  commit('setCurrentPath', { path: path.path })
  commit('changeCurrentPath', { index, path, lastStorage })
}
export function changeCheckedItems ({ state, commit, getters, dispatch }, { checkedItems }) {
  commit('setCheckedItems', { checkedItems })
}
export function removeFiles ({ state, commit, getters, dispatch }, { type, path, items }) {
  commit('removeCheckedFiles', { checkedFiles: items })
  ipcRenderer.send('files-remove-items', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    type,
    path,
    items
  })

  ipcRenderer.once('files-remove-items', (event, { result, oError }) => {
    if (oError) {
      notification.showError(oError)
    }
  })
}
export function renameItem ({ state, commit, getters, dispatch }, { type, path, name, newName, isLink, isFolder }) {
  commit('setLoadingStatus', { status: true })
  ipcRenderer.send('files-rename-item', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    type,
    path,
    name,
    newName,
    isLink,
    isFolder
  })

  ipcRenderer.once('files-rename-item', (event, { result, oError }) => {
    if (result) {
      dispatch('getFiles', {
        currentStorage: type,
        path: path
      })
    } else {
      commit('setLoadingStatus', { status: false })
    }
  })
}
export function copyFiles ({ state, commit, getters, dispatch }, { fromType, fromPath, isCut, files }) {
  commit('setCopiedFiles', { fromType, fromPath, isCut, files })
}
export function pastFiles ({ state, commit, getters, dispatch }, { toType, toPath }) {
  commit('setLoadingStatus', { status: true })
  const copiedFiles = getters['getCopiedFiles']
  ipcRenderer.send('files-past-files', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    toType,
    toPath,
    copiedFiles
  })

  ipcRenderer.once('files-past-files', (event, { result, oError }) => {
    if (!oError) {
      dispatch('getFiles', {
        currentStorage: toType,
        path: toPath
      })
      commit('setCopiedFiles', {
        fromType: null,
        fromPath: null,
        isCUt: false,
        files: []
      })
    } else {
      commit('setLoadingStatus', { status: false })
    }
  })
}
export function saveFilesAsTempFiles ({ state, commit, getters, dispatch }, { files }) {
  return new Promise((resolve) => {
    ipcRenderer.send('files-save-temp', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      files
    })

    ipcRenderer.once('files-save-temp', (event, { result, oError }) => {
      resolve(result)
    })
  })
}
export function updateShare ({ state, commit, getters, dispatch }, { storage, path, id, isDir, shares }) {
  return new Promise((resolve) => {
    ipcRenderer.send('files-update-share', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      storage,
      path,
      id,
      isDir,
      shares
    })

    ipcRenderer.once('files-update-share', (event, { result, oError }) => {
      if (result) {
        notification.showReport('Sharing status updated')
        dispatch('getFiles', {
          currentStorage: storage,
          path: path
        })
      } else {
        notification.showError('Unknown error')
      }
      resolve(result)
    })
  })
}
export function getHistory ({ state, commit, getters, dispatch }, { resourceType, resourceId, offset, limit }) {
  return new Promise((resolve) => {
    ipcRenderer.send('files-get-history', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      resourceType,
      resourceId,
      offset,
      limit
    })

    ipcRenderer.once('files-get-history', (event, { result, oError }) => {
      resolve(result)
    })
  })
}
export function clearHistory ({ state, commit, getters, dispatch }, { resourceType, resourceId }) {
  return new Promise((resolve) => {
    ipcRenderer.send('files-clear-history', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      resourceType,
      resourceId,
    })

    ipcRenderer.once('files-clear-history', (event, { result, oError }) => {
      if (result) {
        notification.showReport('Activity history has been cleared')
      }
      resolve(result)
    })
  })
}
export function createPublicLink ({ state, commit, getters, dispatch }, parameters) {
  return new Promise((resolve) => {
    const oParameters = {
      Type: parameters.type,
      Path: parameters.path,
      Name: parameters.name,
      Size: parameters.size,
      IsFolder: parameters.isFolder,
      RecipientEmail: parameters.recipientEmail,
      PgpEncryptionMode: parameters.pgpEncryptionMode,
      LifetimeHrs: parameters.lifetimeHrs
    }
    if (parameters?.password) {
      oParameters.Password = parameters.password
    }
    webApi.sendRequest({
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sModule: 'OpenPgpFilesWebclient',
      sMethod: 'CreatePublicLink',
      oParameters,
      fCallback: (result, error) => {
        resolve(result)
      },
    })
  })
}
export function removeLink ({ state, commit, getters, dispatch }, { type, path, name }) {
  return new Promise((resolve) => {
    const oParameters = {
      Type: type,
      Path: path,
      Name: name
    }
    webApi.sendRequest({
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sModule: 'Files',
      sMethod: 'DeletePublicLink',
      oParameters,
      fCallback: (result, error) => {
        resolve(result)
      },
    })
  })
}
export function checkUrl ({ state, commit, getters, dispatch }, { url }) {
  return new Promise( (resolve => {
    const oParameters = {
      Url: url
    }
    webApi.sendRequest({
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sModule: 'Files',
      sMethod: 'CheckUrl',
      oParameters,
      fCallback: (result, error) => {
        resolve(result)
      },
    })
  }))
}
export function createLink ({ state, commit, getters, dispatch }, { type, path, link, name }) {
  return new Promise( (resolve => {
    const oParameters = {
      Type: type,
      Path: path,
      Link: link,
      Name: name
    }
    webApi.sendRequest({
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sModule: 'Files',
      sMethod: 'CreateLink',
      oParameters,
      fCallback: (result, error) => {
        resolve(result)
      }
    })
  }))
}
export function saveAttachmentsToFile ({ state, commit, getters, dispatch }, { attachments }) {
  return new Promise( resolve => {
    const accountId = store.getters['mail/getCurrentAccountId']
    const oParameters = {
      AccountID: accountId,
      Attachments: attachments
    }
    console.log(oParameters, 'oParameters')
    webApi.sendRequest({
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sModule: 'MailSaveAttachmentsToFilesPlugin',
      sMethod: 'Save',
      oParameters,
      fCallback: (result, error) => {
        if (result) {
          resolve(result)
        } else {
          notification.showError(error)
        }
      },
    })
  })
}
