import { ipcRenderer } from 'electron'
import * as getters from './getters'
import _ from 'lodash'

import dateUtils from 'src/utils/date'
import typesUtils from 'src/utils/types'

import messagesUtils from './utils/messages.js'
import prefetcher from 'src/modules/mail/prefetcher.js';

export function setSyncing (state, payload) {
  state.syncing = payload
}

export function setCurrentAccount (state, payload) {
  state.allMessageLists = {}

  state.messageList = null
  state.currentMessages = []
  state.currentPage = 1
  state.messagesPerPage = 20

  state.messagesCache = {}
  state.currentMessage = null

  state.currentAccount = payload
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

export function setCurrentFolderChanged (state) {
  let oCurrent = state.currentFolderList.Current
  if (oCurrent) {
    oCurrent.HasChanges = true
  }
}

export function setFoldersRelevantInformation (state, payload) {
  if (state.currentFolderList && payload.AccountId === state.currentFolderList.AccountId) {
    let oFolderList = state.currentFolderList
    _.each(payload.Counts, function (aFolderCounts, sFolderFullName) {
      let oFolder = oFolderList.Flat[sFolderFullName]
      if (oFolder) {
        let iNewCount = aFolderCounts[0]
        let iUnseenCount = aFolderCounts[1]
        let sNextUid = aFolderCounts[2]
        let sHash = aFolderCounts[3]
        if (iNewCount !== oFolder.Count || iUnseenCount !== oFolder.UnseenCount || sNextUid !== oFolder.NextUid || sHash !== oFolder.Hash) {
          oFolder.HasChanges = true
        }
        oFolder.Count = iNewCount
        oFolder.UnseenCount = iUnseenCount
        oFolder.NextUid = sNextUid
        oFolder.Hash = sHash
      }
    })
}
}

function _isTheadsEqual(mNewThread, mOldThread) {
  let bEqual = false
  if (_.isArray(mOldThread) && _.isArray(mNewThread)) {
    let aOldThreadUids = _.map(mOldThread, function (oThreadItem) {
      return oThreadItem.uid
    })
    let aNewThreadUids = _.map(mNewThread, function (oThreadItem) {
      return oThreadItem.uid
    })
    bEqual = _.isEqual(aOldThreadUids, aNewThreadUids)
  } else {
    bEqual = _.isEqual(mOldThread, mNewThread)
  }
  return bEqual
}

function _syncMessageFlags(oNewInfo, oOldInfo, iAccountId, FolderFullName, oStateMessagesCache) {
  if (!_.isEqual(oNewInfo.flags, oOldInfo.flags)) {
    let sMessageKey = messagesUtils.getMessageCacheKey(iAccountId, FolderFullName, oNewInfo.uid)
    let oMessage = oStateMessagesCache[sMessageKey]
    if (oMessage) {
      oMessage.IsSeen = (oNewInfo.flags.indexOf('\\seen') >= 0)
      oMessage.IsFlagged = (oNewInfo.flags.indexOf('\\flagged') >= 0)
      oMessage.IsAnswered = (oNewInfo.flags.indexOf('\\answered') >= 0)
      oMessage.IsForwarded = (oNewInfo.flags.indexOf('$forwarded') >= 0)
      ipcRenderer.send('db-set-messages', {
        iAccountId,
        aMessages: [oMessage],
      })
    }
    oNewInfo.flagsChanged = true
  }
}

function _getAllMessagesInfo(aMessagesInfo) {
  let aAllThreadsInfo = []
  _.each(aMessagesInfo, function (oMessageInfo) {
    if (_.isArray(oMessageInfo.thread)) {
      aAllThreadsInfo = _.union(aAllThreadsInfo, oMessageInfo.thread)
    }
  })
  return _.union(aMessagesInfo, aAllThreadsInfo)
}

function _updateMessagesInfo (state, oParameters, aNewMessagesInfo) {
  console.time('_updateMessagesInfo')
  let sKey = JSON.stringify(oParameters)
  let aOldMessagesInfo = _.cloneDeep(state.allMessageLists[sKey])
  if (!_.isArray(aOldMessagesInfo)) {
    state.allMessageLists[sKey] = aNewMessagesInfo
  } else {
    let aAllOldMessagesInfo = _getAllMessagesInfo(aOldMessagesInfo)
    let aAllNewMessagesInfo = _getAllMessagesInfo(aNewMessagesInfo)
    _.each(aAllNewMessagesInfo, function (oNewInfo) {
      let iOldInfoIndex = _.findIndex(aAllOldMessagesInfo, function (oOldInfo) {
        return oNewInfo.uid === oOldInfo.uid
      })
      if (iOldInfoIndex !== -1) {
        let oOldInfo = aAllOldMessagesInfo[iOldInfoIndex]
        if (!_isTheadsEqual(oNewInfo.thread, oOldInfo.thread)) {
          oNewInfo.NeedPopulateThread = true
        }

        _syncMessageFlags(oNewInfo, oOldInfo, oParameters.AccountID, oParameters.Folder, state.messagesCache)

        aAllOldMessagesInfo.splice(iOldInfoIndex, 1);
      } else {
        oNewInfo.NeedPopulateThread = true
      }
    })

    _.each(aAllOldMessagesInfo, function (oOldInfo) {
      let sMessageKey = messagesUtils.getMessageCacheKey(oParameters.AccountID, oParameters.Folder, oOldInfo.uid)
      delete state.messagesCache[sMessageKey]
    })

    _.each(aNewMessagesInfo, function (oNewInfo) {
      let bHasUnseen = false
      let bHasFlagged = false
      _.each(oNewInfo.thread, (oThreadMessageInfo) => {
        if (oThreadMessageInfo.flags.indexOf('\\flagged') >= 0) {
          bHasFlagged = true
        }
        if (oThreadMessageInfo.flags.indexOf('\\seen') === -1) {
          bHasUnseen = true
        }
        if (bHasUnseen && bHasFlagged) {
          return false // break each
        }
      })
      let sMessageKey = messagesUtils.getMessageCacheKey(oParameters.AccountID, oParameters.Folder, oNewInfo.uid)
      let oMessage = state.messagesCache[sMessageKey]
      if (oMessage) {
        oMessage.PartialFlagged = bHasFlagged
        oMessage.ThreadHasUnread = bHasUnseen
      }
    })

    state.allMessageLists[sKey] = aNewMessagesInfo
    let oFolder = state.currentFolderList.Flat[oParameters.Folder]
    if (oFolder) {
      oFolder.HasChanges = false
    }
  }
  console.timeEnd('_updateMessagesInfo')
}

export function setMessagesInfo (state, payload) {
  if (payload && payload.MessagesInfo && payload.Parameters) {
    _updateMessagesInfo(state, payload.Parameters, payload.MessagesInfo)
    if (state.currentFolderList.Current && payload.Parameters.Folder === state.currentFolderList.Current.FullName) {
      state.messageList = payload.MessagesInfo
    }
  } else if (payload && payload.AccountId && payload.FolderFullName) {
    let oParameters = messagesUtils.getMessagesInfoParameters(payload.AccountId, payload.FolderFullName, getters.getCurrentSearch(state), getters.getCurrentFilter(state))
    state.messageList = state.allMessageLists[JSON.stringify(oParameters)] || null
  } else {
    state.messageList = null
  }
}

export function updateMessagesCache (state, payload) {
  let aMessagesForDb = []

  _.each(payload.Messages, function (oMessageFromServer) {
    oMessageFromServer.Threads = null
    oMessageFromServer.Deleted = false
    oMessageFromServer.ShortDate = dateUtils.getShortDate(oMessageFromServer.TimeStampInUTC, false)
    oMessageFromServer.MiddleDate = dateUtils.getShortDate(oMessageFromServer.TimeStampInUTC, true)
    let sMessageKey = messagesUtils.getMessageCacheKey(payload.AccountId, oMessageFromServer.Folder, oMessageFromServer.Uid)
    if (state.messagesCache[sMessageKey]) {
      _.assign(state.messagesCache[sMessageKey], oMessageFromServer)
    } else {
      state.messagesCache[sMessageKey] = oMessageFromServer
    }
    aMessagesForDb.push(state.messagesCache[sMessageKey])
  })
  ipcRenderer.send('db-set-messages', {
    iAccountId: payload.AccountId,
    aMessages: aMessagesForDb,
  })
}

export function updateMessagesCacheFromDb (state, { iAccountId, sFolderFullName, aMessages }) {
  _.each(aMessages, function (oMessageFromDb) {
    let sMessageKey = messagesUtils.getMessageCacheKey(iAccountId, sFolderFullName, oMessageFromDb.Uid)
    if (state.messagesCache[sMessageKey]) {
      _.assign(state.messagesCache[sMessageKey], oMessageFromDb)
    } else {
      state.messagesCache[sMessageKey] = oMessageFromDb
    }
  })
}

export function setCurrentMessages (state, aMessages) {
  if (state.currentAccount) {
    if (_.isArray(aMessages)) {
      state.currentMessages = aMessages
    } else {
      let sStateCurrentFolderFullName = getters.getСurrentFolderFullName(state)
      let iAccountId = state.currentAccount.AccountID
      let { aCurrentMessages, aNotFounUids } = messagesUtils.getMessages(state.messageList, state.currentPage, state.messagesCache, sStateCurrentFolderFullName, iAccountId)

      state.currentMessages = aCurrentMessages

      if (aCurrentMessages.length > 0 && aNotFounUids.length > 0) {
        state.syncing = true
        ipcRenderer.send('db-get-messages', { iAccountId, sFolderFullName: sStateCurrentFolderFullName, aUids: aNotFounUids })
      } else {
        if (state.currentMessages.length === 0 && state.currentFolderList.Current && state.currentFolderList.Current.Count > 0 && state.currentPage === 1 && state.currentFilter === '' && state.currentSearch === '' ) {
          state.syncing = true
          prefetcher.start()
        } else {
          state.syncing = false
        }
      }
    }
  }
}

export function setСurrentPage (state, payload) {
  state.currentPage = payload
}

export function setCurrentFilter (state, sFilter) {
  state.currentFilter = typesUtils.pString(sFilter)
}

export function setCurrentSearch (state, sSearch) {
  state.currentSearch = typesUtils.pString(sSearch)
}

export function setMessagesRead (state, payload) {
  let aMessagesForDB = []
  let iAccountId = state.currentAccount.AccountID
  _.each(payload.Uids, function (sUid) {
    let sMessageKey = messagesUtils.getMessageCacheKey(iAccountId, getters.getСurrentFolderFullName(state), sUid)
    let oMessage = state.messagesCache[sMessageKey]
    if (oMessage) {
      oMessage.IsSeen = payload.IsSeen
      if (oMessage.ThreadParentUid) {
        let sThreadMessageKey = messagesUtils.getMessageCacheKey(iAccountId, getters.getСurrentFolderFullName(state), oMessage.ThreadParentUid)
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
    let sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), sUid)
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
