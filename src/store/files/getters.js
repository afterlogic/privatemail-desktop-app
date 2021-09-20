export function getStorageList (state) {
  return state.storageList
}
export function getCurrentStorage (state) {
  return state.currentFileStorage
}
export function getCurrentFilesTree (state) {
  return function (storage) {
    return state.filesTree[storage]
  }
}
export function getCurrentFiles (state) {
  return state.currentFiles
}
export function getLoadingStatus (state) {
  return state.uploadingFiles
}
export function getCurrentFile (state) {
  return state.currentFile
}
export function getCurrentPaths (state) {
  return state.currentPaths
}
export function getCurrentPath (state) {
  return state.currentPath
}
export function getCurrentPattern (state) {
  return state.currentPattern
}
export function getCheckedItems (state) {
  return state.checkedItems
}
export function getCopiedFiles (state) {
  return state.copiedFiles
}
export function getFilesQuota (state) {
  return state.quota
}
export function getFiles (state) {
  return state.files
}
export function getFolders (state) {
  return state.folders
}
