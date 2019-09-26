export default {
  applyFoldersCounts: function ({oFolderList, oCounts}) {
    _.each(oCounts, function (aFolderCounts, sFolderFullName) {
      let oFolder = oFolderList.Flat[sFolderFullName]
      if (oFolder) {
        let iNewCount = aFolderCounts[0]
        let iUnseenCount = aFolderCounts[1]
        let sNextUid = aFolderCounts[2]
        let sHash = aFolderCounts[3]
        if (iNewCount !== oFolder.Count || iUnseenCount !== oFolder.UnseenCount || sNextUid !== oFolder.NextUid || sHash !== oFolder.Hash) {
          oFolder.HasChanges = true
        }
        oFolder.Count = iNewCount
        oFolder.UnseenCount = iUnseenCount
        oFolder.NextUid = sNextUid
        oFolder.Hash = sHash
      }
    })
  },

  populateFolderList: function (oFolderList) {
    return oFolderList
  }
}
