export default {
  getFolder: function (oFolderList, sFolderFullName) {
    function _recursive(oFoldersTree) {
      let oFoundFolder = null
      _.each(oFoldersTree, function (oFolder) {
        if (oFolder.FullName === sFolderFullName) {
          oFoundFolder = oFolder
          return false // break each
        } else if ((0 === sFolderFullName.indexOf(oFolder.FullName)) && oFolder.SubFolders) {
          oFoundFolder = _recursive(oFolder.SubFolders)
        }
      })
      return oFoundFolder
    }
    return _recursive(oFolderList.Tree)
  },
}
