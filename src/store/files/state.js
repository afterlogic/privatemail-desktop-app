export default {
  storageList: [],
  filesTree: {},
  currentFileStorage: {},
  currentFiles: [],
  currentPattern: '',
  uploadingFiles: false,
  currentFile: null,
  currentPaths: [],
  currentPath: '',
  checkedItems: [],
  copiedFiles: {
    fromType: null,
    fromPath: null,
    isCut: false,
    files: []
  },
  quota: {
    Limit: 0,
    Used: 0
  }
}
