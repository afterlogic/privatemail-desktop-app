function _getIconName (sType, sFolderFullName) {
  let sIconName = ''
  switch (sType) {
    case 1:
      sIconName = 'mail' // inbox
      break
    case 2:
      sIconName = 'send' // sent
      break
    case 3:
      sIconName = 'insert_drive_file' // drafts
      break
    case 4:
      sIconName = 'error' // spam
      break
    case 5:
      sIconName = 'delete' // trash
      break
    case 7:
      sIconName = 'star' // starred
      break
  }
  if (sFolderFullName === 'Notes') {
    sIconName = 'edit'
  }
  return sIconName;
}

export default {
  prepareFolderListFromServer: function (iAccountId, sNamespace, oFolderListFromServer, oOldFoldersByNames) {
    let oNewFoldersFlat = {}
    let aNewFoldersNames = []
    let oInbox = null
    let oSent = null
    let oDrafts = null
    let oSpam = null
    let oTrash = null

    function _recursive(aFoldersTree) {
      let aNewFoldersTree = []
      let bHasSubscribed = false
      _.each(aFoldersTree, function (oFolderFromServer) {
        let oOldFolder = oOldFoldersByNames[oFolderFromServer.FullName]
        let oNewFolder = {
          FullName: oFolderFromServer.FullName,
          Name: oFolderFromServer.Name,
          Type: oFolderFromServer.Type,
          IconName: _getIconName(oFolderFromServer.Type, oFolderFromServer.FullName),
          IsSubscribed: oFolderFromServer.IsSubscribed,
          IsSelectable: oFolderFromServer.IsSelectable,
          Exists: oFolderFromServer.Exists,
          HasChanges: oOldFolder ? oOldFolder.HasChanges : false,
          Count: oOldFolder ? oOldFolder.Count : 0,
          UnseenCount: oOldFolder ? oOldFolder.UnseenCount : 0,
          NextUid: oOldFolder ? oOldFolder.NextUid : '',
          Hash: oOldFolder ? oOldFolder.Hash : oFolderFromServer.FullName,
        }

        oNewFolder.SubFolders = []
        oNewFolder.HasSubscribed = false
        if (oFolderFromServer.SubFolders && oFolderFromServer.SubFolders['@Collection']) {
          let oSubFoldersData = _recursive(oFolderFromServer.SubFolders['@Collection'])
          oNewFolder.SubFolders = oSubFoldersData.Tree
          oNewFolder.HasSubscribed = oSubFoldersData.HasSubscribed
        }
        bHasSubscribed = bHasSubscribed || oNewFolder.Exists && oNewFolder.IsSubscribed || oNewFolder.HasSubscribed

        switch (oNewFolder.Type) {
          case 1:
            oInbox = oNewFolder
            break
          case 2:
            oSent = oNewFolder
            break
          case 3:
            oDrafts = oNewFolder
            break
          case 4:
            oSpam = oNewFolder
            break
          case 5:
            oTrash = oNewFolder
            break
        }
      
        aNewFoldersTree.push(oNewFolder)
        oNewFoldersFlat[oNewFolder.FullName] = oNewFolder
        aNewFoldersNames.push(oNewFolder.FullName)
      })

      return {
        Tree: aNewFoldersTree,
        HasSubscribed: bHasSubscribed,
      }
    }

    let aResultNewFoldersData = _recursive(oFolderListFromServer['@Collection'])

    oInbox.HasChanges = true

    return {
      AccountId: iAccountId,
      Namespace: sNamespace,
      Count: oFolderListFromServer['@Count'] || 0,
      Tree: aResultNewFoldersData.Tree,
      Flat: oNewFoldersFlat,
      Names: aNewFoldersNames,

      Inbox: oInbox,
      Sent: oSent,
      Drafts: oDrafts,
      Spam: oSpam,
      Trash: oTrash,

      Current: oInbox,
    }
  },

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
          case 1:
            oInbox = oFolder
            break
          case 2:
            oSent = oFolder
            break
          case 3:
            oDrafts = oFolder
            break
          case 4:
            oSpam = oFolder
            break
          case 5:
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
