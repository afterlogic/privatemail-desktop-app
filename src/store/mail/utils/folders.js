import mailEnums from 'src/modules/mail/enums.js'

function _getIconName (sType, sFolderFullName) {
  let sIconName = ''
  switch (sType) {
    case mailEnums.FolderType.Inbox:
      sIconName = 'mail'
      break
    case mailEnums.FolderType.Sent:
      sIconName = 'send'
      break
    case mailEnums.FolderType.Drafts:
      sIconName = 'insert_drive_file'
      break
    case mailEnums.FolderType.Spam:
      sIconName = 'error'
      break
    case mailEnums.FolderType.Trash:
      sIconName = 'delete'
      break
    case mailEnums.FolderType.Starred:
      sIconName = 'star'
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
          Delimiter: oFolderFromServer.Delimiter,
          Namespaced: oFolderFromServer.FullName + oFolderFromServer.Delimiter === sNamespace,
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
          case mailEnums.FolderType.Inbox:
            oInbox = oNewFolder
            break
          case mailEnums.FolderType.Sent:
            oSent = oNewFolder
            break
          case mailEnums.FolderType.Drafts:
            oDrafts = oNewFolder
            break
          case mailEnums.FolderType.Spam:
            oSpam = oNewFolder
            break
          case mailEnums.FolderType.Trash:
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
