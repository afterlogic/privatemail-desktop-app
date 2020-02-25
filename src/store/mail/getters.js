
export function getFoldersSyncing (state) {
  return state.foldersSyncing
}

export function getMessagesSyncing (state) {
  return state.messagesSyncing
}

export function getAccounts (state) {
  return state.accounts
}

export function getCurrentAccount (state) {
  return state.currentAccount
}

export function getDefaultAccount (state) {
  return _.find(state.accounts, function (oAccount) {
    return oAccount.bDefault
  })
}

export function getCurrentAccountId (state) {
  return state.currentAccount ? state.currentAccount.iAccountId : 0
}

export function getCurrentAccountEmail (state) {
  return state.currentAccount ? state.currentAccount.sEmail : ''
}

export function getCurrentIdentities (state) {
  let iAccountId = state.currentAccount ? state.currentAccount.iAccountId : 0
  return state.identities[iAccountId] || []
}

export function getIdentities (state) {
  return state.identities
}

export function getCurrentDefaultIdentity (state) {
  let iAccountId = state.currentAccount ? state.currentAccount.iAccountId : 0
  let aCurrentIdentities = state.identities[iAccountId] || []
  if (aCurrentIdentities.length > 0) {
    let oIdentity = _.find(aCurrentIdentities, function (oIdentity) {
      return oIdentity.bDefault
    })
    if (!oIdentity) {
      oIdentity = aCurrentIdentities[0]
    }
    if (oIdentity) {
      return oIdentity
    }
  }
  return null
}

export function getCurrentFolderList (state) {
  return state.currentFolderList
}

export function getCurrentFoldersTree (state) {
  return state.currentFolderList.Tree
}

export function getCurrentMessages (state) {
  return state.currentMessages
}

export function getCurrentPage (state) {
  return state.currentPage
}

export function getCurrentFilter (state) {
  return state.currentFilter
}

export function getCurrentSearch (state) {
  return state.currentSearch
}

export function getCurrentAdvancedSearch (state) {
  return state.currentAdvancedSearch
}

export function getMessagesPerPage (state) {
  return state.messagesPerPage
}

export function getMessagesCount (state) {
  return state.totalMessagesCount
}

export function getCurrentMessage (state) {
  return state.currentMessage
}

export function getCurrentMessageUid (state) {
  return state.currentMessage ? state.currentMessage.Uid : ''
}

export function getCurrentFolder (state) {
  return state.currentFolderList.Current
}

export function getCurrentFolderFullName (state) {
  return state.currentFolderList.Current ? state.currentFolderList.Current.FullName : ''
}

export function getInboxFullName (state) {
  return state.currentFolderList.Inbox ? state.currentFolderList.Inbox.FullName : ''
}

export function getFolderByFullName (state) {
  return function (sFolderFullName) {
    return state.currentFolderList.Flat[sFolderFullName]
  }
}

export function getDisplayedFolders (state) {
  let aDisplayedFolders = _.filter(state.currentFolderList.Flat, function (oFolder) {
    return oFolder.Exists && oFolder.IsSelectable && oFolder.IsSubscribed
  })
  return _.map(aDisplayedFolders, function (oFolder) {
    return oFolder.FullName
  })
}
