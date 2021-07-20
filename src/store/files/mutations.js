import typesUtils from 'src/utils/types.js'

export function setStorageList (state, storageList) {
  state.storageList = typesUtils.pArray(storageList)
}
export function setCurrentStorage (state, currentStorage) {
  state.currentFileStorage = typesUtils.pObject(currentStorage)
}
