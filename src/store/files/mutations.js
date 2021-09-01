import typesUtils from 'src/utils/types.js'

export function setStorageList (state, storageList) {
  state.storageList = typesUtils.pArray(storageList)
}
export function setCurrentStorage (state, currentStorage) {
  state.currentFileStorage = typesUtils.pObject(currentStorage)
}
export function setFilesList (state, { files, storage }) {
  state.filesTree[storage] = files
}
export function setCurrentFiles (state, { files }) {
  state.currentFiles = files
}
export function setLoadingStatus (state, { status }) {
  state.uploadingFiles = status
}
export function setCurrentPattern (state, { pattern }) {
  state.currentPattern = pattern
}
export function setCurrentFile (state, { currentFile }) {
  state.currentFile = currentFile
}
export function changeCurrentPath (state, { path, index, lastStorage }) {
  if (!lastStorage) {
    if (index === -1) {
      state.currentPaths.push(path)
    } else {
      state.currentPaths.splice(index + 1)
    }
  } else {
    state.currentPaths = [path]
  }
}
export function setCurrentPaths (state, { path }) {
  state.currentPaths = path
}
export function setCurrentPath (state, { path }) {
  state.currentPath = path
}
export function setCheckedItems (state, { checkedItems }) {
  state.checkedItems = checkedItems
}
export function setCopiedFiles (state, { fromType, fromPath, isCut, files }) {
  state.copiedFiles.fromType = fromType
  state.copiedFiles.fromPath = fromPath
  state.copiedFiles.isCut = isCut
  state.copiedFiles.files = files
}
export function setFilesQuota (state, { quota }) {
  state.quota.Limit = quota.Limit
  state.quota.Used = quota.Used
}
