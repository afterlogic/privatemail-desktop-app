import { ipcRenderer } from 'electron'
import store from 'src/store'
import _ from 'lodash'
import webApi from 'src/utils/webApi.js'

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

export function getFiles ({ state, commit, getters, dispatch }, { currentStorage, path, pattern = ''}) {
  dispatch('changeCurrentFile', { currentFile: null })
    commit('setLoadingStatus', { status: true })
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
          let currentPath = getters['getCurrentPath']
          let storage = getters['getCurrentStorage']
          if (currentStorage === storage.Type && path === currentPath) {
            commit('setCurrentFiles', { files: files.Items })
            commit('setLoadingStatus', { status: false })
          }
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
  commit('setLoadingStatus', { status: true })
  ipcRenderer.send('files-remove-items', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    type,
    path,
    items
  })

  ipcRenderer.once('files-remove-items', (event, { result, oError }) => {
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
export function copyFiles ({ state, commit, getters, dispatch }, { fromType, fromPath, files }) {
  commit('setCopiedFiles', { fromType, fromPath, files })
}
