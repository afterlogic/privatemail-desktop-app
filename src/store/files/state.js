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
    limit: 0,
    used: 0
  },
  files: [],
  folders: []
}
