function _getIconName (sType, sFolderFullName) {
  var sIconName = ''
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
  prepareFolderList: function (iAccountId, oFolderListFromServer, oOldFoldersByNames) {
    var oNewFoldersFlat = {}
    var aNewFoldersNames = []
    var oInbox = null
    var oSent = null
    var oDrafts = null
    var oSpam = null
    var oTrash = null

    function _recursive(aFoldersTree) {
      var aNewFoldersTree = []
      var bHasSubscribed = false
      _.each(aFoldersTree, function (oFolderFromServer) {
        var oOldFolder = oOldFoldersByNames[oFolderFromServer.FullName]
        var oNewFolder = {
          FullName: oFolderFromServer.FullName,
          Name: oFolderFromServer.Name,
          Type: oFolderFromServer.Type,
          IconName: _getIconName(oFolderFromServer.Type, oFolderFromServer.FullName),
          IsSubscribed: oFolderFromServer.IsSubscribed,
          IsSelectable: oFolderFromServer.IsSelectable,
          Exists: oFolderFromServer.Exists,
          HasChanges: false,
          Count: oOldFolder ? oOldFolder.Count : 0,
          UnseenCount: oOldFolder ? oOldFolder.UnseenCount : 0,
          NextUid: oOldFolder ? oOldFolder.NextUid : '',
          Hash: oOldFolder ? oOldFolder.Hash : oFolderFromServer.FullName,
        }

        oNewFolder.SubFolders = []
        oNewFolder.HasSubscribed = false
        if (oFolderFromServer.SubFolders && oFolderFromServer.SubFolders['@Collection']) {
          var oSubFoldersData = _recursive(oFolderFromServer.SubFolders['@Collection'])
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
        HasSubscribed: bHasSubscribed
      }
    }

    var aResultNewFoldersData = _recursive(oFolderListFromServer['@Collection'])

    return {
      AccountId: iAccountId,
      Namespace: oFolderListFromServer.Namespace || '',
      Count: oFolderListFromServer['@Count'] || 0,
      Tree: aResultNewFoldersData.Tree,
      Flat: oNewFoldersFlat,
      Names: aNewFoldersNames,
      Inbox: oInbox,
      Sent: oSent,
      Drafts: oDrafts,
      Spam: oSpam,
      Trash: oTrash,
    }
  }
}
