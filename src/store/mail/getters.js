
export function getSyncing (state) {
  return state.syncing
}

export function getCurrentAccount (state) {
  return state.currentAccount
}

export function getCurrentAccountId (state) {
  return state.currentAccount ? state.currentAccount.AccountID : 0
}

export function getCurrentAccountEmail (state) {
  return state.currentAccount ? state.currentAccount.Email : ''
}

export function getCurrentIdentities (state) {
  return state.currentIdentities
}

export function getCurrentDefaultIdentity (state) {
  if (state.currentIdentities.length > 0) {
    let oIdentity = _.find(state.currentIdentities, function (oIdentity) {
      return oIdentity.bDefault
    })
    if (!oIdentity) {
      oIdentity = state.currentIdentities[0]
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

export function getСurrentMessages (state) {
  return state.currentMessages
}

export function getСurrentPage (state) {
  return state.currentPage
}

export function getCurrentFilter (state) {
  return state.currentFilter
}

export function getCurrentSearch (state) {
  return state.currentSearch
}

export function getMessagesPerPage (state) {
  return state.messagesPerPage
}

export function getMessagesCount (state) {
  return _.isArray(state.messageList) ? state.messageList.length : 0
}

export function getСurrentMessage (state) {
  return state.currentMessage
}

export function getСurrentMessageUid (state) {
  return state.currentMessage ? state.currentMessage.Uid : ''
}

export function getСurrentFolder (state) {
  return state.currentFolderList.Current
}

export function getСurrentFolderFullName (state) {
  return state.currentFolderList.Current ? state.currentFolderList.Current.FullName : ''
}

export function getInboxFullName (state) {
  return state.currentFolderList.Inbox ? state.currentFolderList.Inbox.FullName : ''
}

export function getDisplayedFolders (state) {
  let aDisplayedFolders = _.filter(state.currentFolderList.Flat, function (oFolder) {
    return oFolder.Exists && oFolder.IsSelectable && oFolder.IsSubscribed
  })
  return _.map(aDisplayedFolders, function (oFolder) {
    return oFolder.FullName
  })
}
