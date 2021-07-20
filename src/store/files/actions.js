import { ipcRenderer } from 'electron'
import store from 'src/store'
import typesUtils from 'src/utils/types'

export function asyncGetStorages () {
  ipcRenderer.send('files-get-storages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })

  ipcRenderer.once('files-get-storages', (event, { storageList, oError }) => {
    console.log(storageList, 'storageList')
    store.commit('files/setStorageList', storageList)
    //store.commit('files/setCurrentStorage', storageList[0])
  })
}

export function setCurrentStorage ({ state, commit, getters, dispatch }, { currentStorage }) {
  store.commit('files/setCurrentStorage', currentStorage)
}

export function getFiles ({ state, commit, getters, dispatch }, { currentStorage, path }) {
  ipcRenderer.send('files-get-files', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    Type: currentStorage.Type,
    Path: path,
    Pattern: '',
    PathRequired: false,
  })

  ipcRenderer.once('files-get-files', (event, { files, oError }) => {
    console.log(files, 'files')
    //store.commit('files/setCurrentStorage', storageList[0])
  })
}
