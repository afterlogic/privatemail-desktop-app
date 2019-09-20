import { ipcRenderer } from 'electron'
import _ from 'lodash'
import dateUtils from 'src/utils/date'
import foldersUtils from './utils/folders.js'
import messagesUtils from './utils/messages.js'
import * as getters from './getters'

export function setSyncing (state, payload) {
  state.syncing = payload
}

export function setCurrentAccount (state, payload) {
  state.currentAccount = payload
}

export function resetCurrentFolderList (state) {
  state.currentFolderList = {
    AccountId: 0,
    Namespace: '',
    Count: 0,
    Tree: [],
    Flat: {},
    Names: [],
  }
}

export function setCurrentFolderList (state) {
  let oFolderList = state.allFolderLists[state.currentAccount.AccountID]
  if (oFolderList) {
    state.currentFolderList = oFolderList
  }
}

export function parseFolderList (state, payload) {
  let oFolderList = foldersUtils.prepareFolderList(payload.AccountId, payload.FolderListFromServer, state.currentFolderList.Flat)

  ipcRenderer.send('bd-set-folders', {
    AccountId: oFolderList.AccountId,
    FolderList: oFolderList,
  })

  state.allFolderLists[oFolderList.AccountId] = oFolderList
}

export function setFolderList (state, payload) {
  state.allFolderLists[payload.AccountId] = payload
}

export function setFoldersRelevantInformation (state, payload) {
  let oFolderList = state.allFolderLists[payload.AccountId]
  if (oFolderList) {
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

    ipcRenderer.send('bd-set-folders', {
      AccountId: oFolderList.AccountId,
      FolderList: oFolderList,
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
    oFolder.HasChanges = false
  }
  console.timeEnd('_updateMessagesInfo')
}

export function setMessagesInfo (state, payload) {
  if (payload && payload.MessagesInfo && payload.Parameters) {
    _updateMessagesInfo(state, payload.Parameters, payload.MessagesInfo)
    state.messageList = payload.MessagesInfo
    ipcRenderer.send('bd-set-messages-info', {
      AccountId: payload.Parameters.AccountID,
      FolderFullName: payload.Parameters.Folder,
      MessagesInfo: payload.MessagesInfo,
    })
  } else if (payload && payload.AccountId && payload.FolderFullName) {
    let oParameters = messagesUtils.getMessagesInfoParameters(payload.AccountId, payload.FolderFullName)
    state.messageList = state.allMessageLists[JSON.stringify(oParameters)] || null
  } else {
    state.messageList = null
  }
}

export function updateMessagesCache (state, payload) {
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
  })
}

export function setCurrentMessages (state) {
  state.currentMessages = messagesUtils.getMessages(state.messageList, state.currentPage, state.messagesCache, getters.getСurrentFolderFullName(state), state.currentAccount.AccountID)
}

export function setСurrentPage (state, payload) {
  state.currentPage = payload
}

export function setMessagesRead (state, payload) {
  _.each(payload.Uids, function (sUid) {
    let sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), sUid)
    let oMessage = state.messagesCache[sMessageKey]
    if (oMessage) {
      oMessage.IsSeen = payload.IsSeen
      if (oMessage.ThreadParentUid) {
        let sThreadMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), oMessage.ThreadParentUid)
        let oParentMessage = state.messagesCache[sThreadMessageKey]
        if (oParentMessage) {
          let bHasUnseenMessages = false
          _.each(oParentMessage.Threads, function (oThreadMessage) {
            if (!oThreadMessage.IsSeen) {
              bHasUnseenMessages = true
            }
          })
          oParentMessage.ThreadHasUnread = bHasUnseenMessages
        }
      }
    }
  })
}

export function setAllMessagesRead (state) {
  _.each(state.messagesCache, function (oMessage) {
    oMessage.IsSeen = true
    if (oMessage.Threads) {
      oMessage.ThreadHasUnread = false
    }
  })
}

export function setMessagesDeleted (state, payload) {
  _.each(payload.Uids, function (sUid) {
    let sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), sUid)
    let oMessage = state.messagesCache[sMessageKey]
    if (oMessage) {
      oMessage.Deleted = payload.Deleted
    }
  })
}

export function setMessageFlagged (state, payload) {
  _.each(state.currentMessages, function (oMessage) {
    if (payload.Uid === oMessage.Uid) {
      oMessage.IsFlagged = payload.Flagged
    } else if (oMessage.Threads) {
      _.each(oMessage.Threads, function (oThreadMessage) {
        if (payload.Uid === oThreadMessage.Uid) {
          oThreadMessage.IsFlagged = payload.Flagged
        }
      })
    }
  })
}

export function setCurrentMessage (state, payload) {
  state.currentMessage = payload
}

export function updateMessage (state, payload) {
  let sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, payload.Folder, payload.Uid)
  let oMessage = state.messagesCache[sMessageKey]
  if (oMessage) {
    _.assign(oMessage, payload)
    oMessage.Received = true
  }
}

export function setCurrentFolder (state, payload) {
  state.currentFolderList.Current = state.currentFolderList.Flat[payload]
}
