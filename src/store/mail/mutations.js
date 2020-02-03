import { ipcRenderer } from 'electron'
import * as getters from './getters'
import _ from 'lodash'

import dateUtils from 'src/utils/date'
import typesUtils from 'src/utils/types'

import messagesUtils from './utils/messages.js'

export function setSyncing (state, payload) {
  state.syncing = payload
}

export function setCurrentAccount (state, payload) {
  state.allMessageLists = {}

  state.messageList = null
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

export function setMessagesRead (state, payload) {
  let aMessagesForDB = []
  let iAccountId = state.currentAccount.AccountID
  _.each(payload.Uids, function (sUid) {
    let sMessageKey = messagesUtils.getMessageCacheKey(iAccountId, getters.getCurrentFolderFullName(state), sUid)
    let oMessage = state.messagesCache[sMessageKey]
    if (oMessage) {
      oMessage.IsSeen = payload.IsSeen
      if (oMessage.ThreadParentUid) {
        let sThreadMessageKey = messagesUtils.getMessageCacheKey(iAccountId, getters.getCurrentFolderFullName(state), oMessage.ThreadParentUid)
        let oParentMessage = state.messagesCache[sThreadMessageKey]
        if (oParentMessage) {
          let bHasUnseenMessages = false
          _.each(oParentMessage.Threads, function (oThreadMessage) {
            if (!oThreadMessage.IsSeen) {
              bHasUnseenMessages = true
            }
          })
          oParentMessage.ThreadHasUnread = bHasUnseenMessages
          aMessagesForDB.push(oParentMessage)
        }
      }
      aMessagesForDB.push(oMessage)
    }
  })
  ipcRenderer.send('db-set-messages', {
    iAccountId,
    aMessages: aMessagesForDB,
  })
}

export function setAllMessagesRead (state, sFolderFullName) {
  let aMessagesForDB = []
  _.each(state.messagesCache, function (oMessage) {
    if (oMessage.Folder === sFolderFullName && (!oMessage.IsSeen || oMessage.ThreadHasUnread)) {
      oMessage.IsSeen = true
      if (oMessage.ThreadHasUnread) {
        oMessage.ThreadHasUnread = false
      }
      aMessagesForDB.push(oMessage)
    }
  })
  ipcRenderer.send('db-set-messages', {
    iAccountId,
    aMessages: aMessagesForDB,
  })
}

export function setMessagesDeleted (state, payload) {
  let aMessagesForDB = []
  _.each(payload.Uids, function (sUid) {
    let sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getCurrentFolderFullName(state), sUid)
    let oMessage = state.messagesCache[sMessageKey]
    if (oMessage) {
      oMessage.Deleted = payload.Deleted
      aMessagesForDB.push(oMessage)
    }
  })
  ipcRenderer.send('db-set-messages', {
    iAccountId: state.currentAccount.AccountID,
    aMessages: aMessagesForDB,
  })
}

export function setMessageFlagged (state, payload) {
  let aMessagesForDB = []
  _.each(state.currentMessages, function (oMessage) {
    if (payload.Uid === oMessage.Uid) {
      oMessage.IsFlagged = payload.Flagged
      aMessagesForDB.push(oMessage)
    } else if (oMessage.Threads) {
      _.each(oMessage.Threads, function (oThreadMessage) {
        if (payload.Uid === oThreadMessage.Uid) {
          oThreadMessage.IsFlagged = payload.Flagged
          aMessagesForDB.push(oThreadMessage)
        }
      })
    }
  })
  ipcRenderer.send('db-set-messages', {
    iAccountId: state.currentAccount.AccountID,
    aMessages: aMessagesForDB,
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
