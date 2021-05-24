import addressUtils from 'src/utils/address.js'
import typesUtils from 'src/utils/types.js'

export function getFoldersSyncing (state) {
  return state.foldersSyncing
}

export function getMessagesSyncing (state) {
  return state.messagesSyncing
}

export function getAccounts (state) {
  return state.accounts
}

export function getAllAccountsFullEmails (state) {
  let aFullEmails = []

  _.each(state.accounts, (oAccount) => {
    let aIdentities = state.identities[oAccount.iAccountId]
    if (typesUtils.isNonEmptyArray(aIdentities)) {
      _.each(aIdentities, (oIdentity) => {
        aFullEmails.push(addressUtils.getFullEmail(oIdentity.sFriendlyName, oIdentity.sEmail))
      })
    } else {
      aFullEmails.push(addressUtils.getFullEmail(oAccount.sFriendlyName, oAccount.sEmail))
    }
    if (typesUtils.isNonEmptyArray(oAccount.aAliases)) {
      _.each(oAccount.aAliases, function (oAlias) {
        aFullEmails.push(oAlias.getFull())
      })
    }
  })

  return aFullEmails;
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

export function getServers (state) {
  return state.servers
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

export function getEditFoldersTree (state) {
  return state.editFolderList.Tree
}

export function getCurrentMessages (state) {
  return state.currentMessages
}

export function getStarredMessages (state) {
  return state.starredMessages
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

export function getTrashFullName (state) {
  return state.currentFolderList.Trash ? state.currentFolderList.Trash.FullName : ''
}

export function getSpamFullName (state) {
  return state.currentFolderList.Spam ? state.currentFolderList.Spam.FullName : ''
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

export function getHasChanges (state) {
  return state.hasChanges
}

export function getTriggerChangesDialogue (state) {
  return state.triggerChangesDialogue
}

export function getSelectedItem (state) {
  return state.selectedItem
}

export function getAccountQuota (state) {
  if (state.currentAccount) {
    let currentAccount = state.currentAccount
    return currentAccount.aQuota ? currentAccount.aQuota : []
  } else {
    return []
  }
}

export function getMessageByUid (state) {
  return function (messageUid) {
    let oFoundMessage = null
    _.each(state.currentMessages, (oMessage) => {
      if (oMessage.Uid === messageUid) {
        oFoundMessage = oMessage
      } else if (_.isArray(oMessage.Threads) && oMessage.ThreadOpened) {
        _.each(oMessage.Threads, (oThreadMessage) => {
          if (oThreadMessage.Uid === messageUid) {
            oFoundMessage = oThreadMessage
            return false
          }
        })
      }
      if (oFoundMessage) {
        return false
      }
    })
    return oFoundMessage
  }
}
