import _ from 'lodash'

import typesUtils from 'src/utils/types'

export function setFoldersSyncing (state, payload) {
  state.foldersSyncing = payload
}

export function setMessagesSyncing (state, payload) {
  state.messagesSyncing = payload
}

export function setCurrentAccount (state, payload) {
  state.currentMessages = []
  state.totalMessagesCount = 0
  state.currentPage = 1

  state.messagesCache = {}
  state.currentMessage = null

  state.currentAccount = payload
}

export function setMailsPerPage (state, iMailsPerPage) {
  state.messagesPerPage = iMailsPerPage
}

export function setCurrentIdentities (state, aIdentities) {
  state.currentIdentities = aIdentities
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
  if (oFolderList.AccountId === state.currentAccount.AccountID) {
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

export function setCurrentSearch (state, { sSearch, oAdvancedSearch }) {
  state.currentSearch = typesUtils.pString(sSearch)
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

export function setMessagesDeleted (state, { aUids, bDeleted }) {
  _.each(state.currentMessages, function (oMessage) {
    if (aUids.indexOf(oMessage.Uid) >= 0) {
      oMessage.Deleted = bDeleted
    }
    _.each(oMessage.Threads, function (oThreadMessage) {
      if (aUids.indexOf(oThreadMessage.Uid) >= 0) {
        oThreadMessage.Deleted = bDeleted
      }
    })
  })
}

export function setMessageFlagged (state, { sUid, bFlagged }) {
  _.each(state.currentMessages, function (oMessage) {
    if (sUid === oMessage.Uid) {
      oMessage.IsFlagged = bFlagged
    } else if (typesUtils.isNonEmptyArray(oMessage.Threads)) {
      let bPartialFlagged = false
      _.each(oMessage.Threads, function (oThreadMessage) {
        if (sUid === oThreadMessage.Uid) {
          oThreadMessage.IsFlagged = bFlagged
        }
        bPartialFlagged = bPartialFlagged || oThreadMessage.IsFlagged
      })
      oMessage.PartialFlagged = bPartialFlagged
    }
  })
}

export function setCurrentMessage (state, oMessage) {
  state.currentMessage = oMessage
  if (oMessage) {
    oMessage.IsSeen = true
  }
}

export function setCurrentFolder (state, payload) {
  state.currentFolderList.Current = state.currentFolderList.Flat[payload]
}
