import _ from 'lodash'

import typesUtils from 'src/utils/types'

import mailEnums from 'src/modules/mail/enums.js'

import cAccount from 'src/modules/mail/classes/cAccount.js'
import cAlias from 'src/modules/mail/classes/cAlias.js'
import cServer from 'src/modules/mail/classes/cServer.js'

export function setFoldersSyncing (state, payload) {
  state.foldersSyncing = payload
}

export function setMessagesSyncing (state, payload) {
  state.messagesSyncing = payload
}

export function setAccounts (state, aAccountsData) {
  let aAccounts = []
  if (typesUtils.isNonEmptyArray(aAccountsData)) {
    _.each(aAccountsData, function (oAccountData) {
      let oAccount = new cAccount(oAccountData)
      aAccounts.push(oAccount)
    })
  }
  state.accounts = aAccounts
}

export function setAliases (state, { oDefaultAccount, aAliasesData }) {
  let aAliases = []
  if (typesUtils.isNonEmptyArray(aAliasesData)) {
    _.each(aAliasesData, function (oAliasData) {
      let oAlias = new cAlias(oAliasData)
      aAliases.push(oAlias)
    })
  }
  if (oDefaultAccount) {
    oDefaultAccount.aAliases = aAliases
  }
}

export function setServers (state, aServersData) {
  let aServers = []
  _.each(aServersData, function (oData) {
    let oServer = new cServer(oData)
    aServers.push(oServer)
  })
  state.servers = aServers
}

export function setCurrentAccount (state, oAccount) {
  state.currentMessages = []
  state.totalMessagesCount = 0
  state.currentPage = 1

  state.messagesCache = {}
  state.currentMessage = null

  state.currentAccount = oAccount
}

export function setAccountSettings (state, { iAccountId, bUseThreading, bSaveRepliesToCurrFolder, sName, bNoSignature, sSignature }) {
  let oAccount = _.find(state.accounts, (oTmpAccount) => {
    return oTmpAccount.iAccountId === iAccountId
  })
  if (oAccount) {
    if (typeof bUseThreading === 'boolean') {
      oAccount.bUseThreading = bUseThreading
    }
    if (typeof bSaveRepliesToCurrFolder === 'boolean') {
      oAccount.bSaveRepliesToCurrFolder = bSaveRepliesToCurrFolder
    }
    if (typeof sName === 'string') {
      oAccount.sFriendlyName = sName
    }
    if (typeof bNoSignature === 'boolean') {
      oAccount.bUseSignature = !bNoSignature
    }
    if (typeof sSignature === 'string') {
      oAccount.sSignature = sSignature
    }
  }
}

export function removeAccount (state, { iAccountId }) {
  state.accounts = _.filter(state.accounts, (oTmpAccount) => {
    return oTmpAccount.iAccountId !== iAccountId
  })
}

export function addAccount (state, { oAccountData }) {
  let oAccount = new cAccount(oAccountData)
  state.accounts.push(oAccount)
}

export function setMailsPerPage (state, iMailsPerPage) {
  state.messagesPerPage = iMailsPerPage
}

export function setIdentities (state, aIdentities) {
  state.identities = aIdentities
}

/**
 * Resets current folder list. The method is used when user changes account or logs out.
 * @param {object} state
 */
export function resetCurrentFolderList (state) {
  state.currentFolderList = {
    AccountId: 0,
    Namespace: '',
    Count: 0,
    Tree: [],
    Flat: {},
    Names: [],

    Inbox: null,
    Sent: null,
    Drafts: null,
    Spam: null,
    Trash: null,

    Current: null,
  }
}

export function setCurrentFolderList (state, oFolderList) {
  if (oFolderList.AccountId === state.currentAccount.iAccountId) {
    state.currentFolderList = oFolderList
  }
}

export function setCurrentMessagesTotalCount (state, iTotalCount) {
  state.totalMessagesCount = iTotalCount
}

export function setCurrentMessages (state, aMessages) {
  if (state.currentAccount && _.isArray(aMessages)) {
    state.currentMessages = aMessages
  }
}

export function setCurrentPage (state, payload) {
  state.currentPage = payload
}

export function setCurrentFilter (state, sFilter) {
  state.currentFilter = typesUtils.pString(sFilter)
}

export function setCurrentSearch (state, sSearch) {
  state.currentSearch = typesUtils.pString(sSearch)
}

export function setCurrentAdvancedSearch (state, oAdvancedSearch) {
  state.currentAdvancedSearch = oAdvancedSearch
}

export function setMessagesRead (state, { aUids, bIsSeen }) {
  let iAddUnseen = 0

  function _setMessageSeenFlag (oMessage) {
    if (oMessage.IsSeen !== bIsSeen) {
      if (oMessage.IsSeen) {
        iAddUnseen++
      } else {
        iAddUnseen--
      }
    }
    oMessage.IsSeen = bIsSeen
  }

  _.each(state.currentMessages, function (oMessage) {
    if (aUids.indexOf(oMessage.Uid) >= 0) {
      _setMessageSeenFlag(oMessage)
    }
    let bThreadHasUnread = false
    _.each(oMessage.Threads, function (oThreadMessage) {
      if (aUids.indexOf(oThreadMessage.Uid) >= 0) {
        _setMessageSeenFlag(oThreadMessage)
      }
      bThreadHasUnread = bThreadHasUnread || !oThreadMessage.IsSeen
    })
    oMessage.ThreadHasUnread = bThreadHasUnread
  })

  let iUnseenCount = state.currentFolderList.Current.UnseenCount + iAddUnseen
  if (iUnseenCount < 0) {
    iUnseenCount = 0
  }
  state.currentFolderList.Current.UnseenCount = iUnseenCount
}

export function setAllMessagesRead (state) {
  _.each(state.currentMessages, function (oMessage) {
    oMessage.IsSeen = true
    _.each(oMessage.Threads, function (oThreadMessage) {
      oThreadMessage.IsSeen = true
    })
    oMessage.ThreadHasUnread = false
  })
  state.currentFolderList.Current.UnseenCount = 0
}

export function setMessagesDeleted (state, { aUids, oToFolder }) {
  let iDeletedCount = 0
  let iUnseenDeletedCount = 0
  _.each(state.currentMessages, function (oMessage) {
    if (aUids.indexOf(oMessage.Uid) >= 0) {
      oMessage.Deleted = true
      iDeletedCount++
      if (!oMessage.IsSeen) {
        iUnseenDeletedCount++
      }
    }
    _.each(oMessage.Threads, function (oThreadMessage) {
      if (aUids.indexOf(oThreadMessage.Uid) >= 0) {
        iDeletedCount++
        oThreadMessage.Deleted = true
        if (!oThreadMessage.IsSeen) {
          iUnseenDeletedCount++
        }
      }
    })
  })
  let iCount = state.currentFolderList.Current.Count - iDeletedCount
  state.currentFolderList.Current.Count = iCount > 0 ? iCount : 0
  let iUnseenCount = state.currentFolderList.Current.UnseenCount - iUnseenDeletedCount
  state.currentFolderList.Current.UnseenCount = iUnseenCount > 0 ? iUnseenCount : 0
  if (oToFolder) {
    oToFolder.UnseenCount = oToFolder.UnseenCount + iUnseenDeletedCount
  }
}

export function setCurrentFolderEmpty (state) {
  state.currentMessages = []
  state.totalMessagesCount = 0
  state.currentFolderList.Current.Count = 0
  state.currentFolderList.Current.UnseenCount = 0
}

export function setMessageFlagged (state, { sUid, bFlagged }) {
  let oFoundMessage = null
  _.each(state.currentMessages, function (oMessage) {
    if (sUid === oMessage.Uid) {
      oFoundMessage = oMessage
      return false // break each
    } else if (typesUtils.isNonEmptyArray(oMessage.Threads)) {
      let bPartialFlagged = false
      _.each(oMessage.Threads, function (oThreadMessage) {
        if (sUid === oThreadMessage.Uid) {
          oFoundMessage = oThreadMessage
          return false // break each
        }
        bPartialFlagged = bPartialFlagged || oThreadMessage.IsFlagged
      })
      if (oFoundMessage) {
        return false // break each
      }
      oMessage.PartialFlagged = bPartialFlagged
    }
  })
  if (oFoundMessage && oFoundMessage.IsFlagged !== bFlagged) {
    oFoundMessage.IsFlagged = bFlagged
    if (bFlagged) {
      state.currentFolderList.Current.FlaggedCount++
    } else {
      state.currentFolderList.Current.FlaggedCount--
    }
  }
}

export function setCurrentMessage (state, oMessage) {
  state.currentMessage = oMessage
  if (oMessage) {
    oMessage.IsSeen = true
  }
}

export function removeCurrentMessageReadingConfirmAddressee (state, payload) {
  if (state.currentMessage) {
    state.currentMessage.ReadingConfirmationAddressee = ''
  }
}

export function setCurrentFolder (state, payload) {
  state.currentFolderList.Current = state.currentFolderList.Flat[payload]
}

export function removeCurrentMessage (state) {
  state.currentMessage = null
}
