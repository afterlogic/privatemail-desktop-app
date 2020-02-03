import mailEnums from 'src/modules/mail/enums.js'

export default {
  prepareFolderListFromDb: function (oFolderList) {
    let oFoldersFlat = {}
    let aFoldersNames = []
    let oInbox = null
    let oSent = null
    let oDrafts = null
    let oSpam = null
    let oTrash = null

    function _recursive(aFoldersTree) {
      _.each(aFoldersTree, function (oFolder) {
        switch (oFolder.Type) {
          case mailEnums.FolderType.Inbox:
            oInbox = oFolder
            break
          case mailEnums.FolderType.Sent:
            oSent = oFolder
            break
          case mailEnums.FolderType.Drafts:
            oDrafts = oFolder
            break
          case mailEnums.FolderType.Spam:
            oSpam = oFolder
            break
          case mailEnums.FolderType.Trash:
            oTrash = oFolder
            break
        }

        oFoldersFlat[oFolder.FullName] = oFolder
        aFoldersNames.push(oFolder.FullName)

        if (oFolder.SubFolders && oFolder.SubFolders) {
          _recursive(oFolder.SubFolders)
        }
      })
    }

    _recursive(oFolderList.Tree)

    oInbox.HasChanges = true

    return {
      AccountId: oFolderList.AccountId,
      Namespace: oFolderList.Namespace,
      Count: oFolderList.Count,
      Tree: oFolderList.Tree,
      Flat: oFoldersFlat,
      Names: aFoldersNames,

      Inbox: oInbox,
      Sent: oSent,
      Drafts: oDrafts,
      Spam: oSpam,
      Trash: oTrash,

      Current: oInbox,
    }
  },
}
