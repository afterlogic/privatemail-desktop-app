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
  var oFolderList = state.allFolderLists[state.currentAccount.AccountID]
  if (oFolderList) {
    state.currentFolderList = oFolderList
  }
}

export function parseFolderList (state, payload) {
  var oFolderList = foldersUtils.prepareFolderList(payload.AccountId, payload.FolderListFromServer, state.currentFolderList.Flat)
  state.allFolderLists[oFolderList.AccountId] = oFolderList
}

export function setFoldersRelevantInformation (state, payload) {
  _.each(payload, function (aFolderCounts, sFolderFullName) {
    var oFolder = state.currentFolderList.Flat[sFolderFullName]
    if (oFolder) {
      var iNewCount = aFolderCounts[0]
      var iUnseenCount = aFolderCounts[1]
      var sNextUid = aFolderCounts[2]
      var sHash = aFolderCounts[3]
      if (iNewCount !== oFolder.Count || iUnseenCount !== oFolder.UnseenCount || sNextUid !== oFolder.NextUid || sHash !== oFolder.Hash) {
        oFolder.HasChanges = true
      }
      oFolder.Count = aFolderCounts[0]
      oFolder.UnseenCount = aFolderCounts[1]
      oFolder.NextUid = aFolderCounts[2]
      oFolder.Hash = aFolderCounts[3]
    }
  })
}

export function setMessageList (state, payload) {
  if (payload && payload.MessagesInfo && payload.Parameters) {
    state.allMessageLists[JSON.stringify(payload.Parameters)] = payload.MessagesInfo
    state.messageList = payload.MessagesInfo
  } else if (payload && payload.AccountId && payload.FolderFullName) {
    var oParameters = messagesUtils.getMessagesInfoParameters(payload.AccountId, payload.FolderFullName)
    state.messageList = state.allMessageLists[JSON.stringify(oParameters)] || null
  } else {
    state.messageList = null
  }
}

export function updateMessagesCache (state, payload) {
  _.each(payload.Messages, function (oMessage) {
    oMessage.Deleted = false
    oMessage.ShortDate = dateUtils.getShortDate(oMessage.TimeStampInUTC, false)
    oMessage.MiddleDate = dateUtils.getShortDate(oMessage.TimeStampInUTC, true)
    var sMessageKey = messagesUtils.getMessageCacheKey(payload.AccountId, oMessage.Folder, oMessage.Uid)
    if (state.messagesCache[sMessageKey]) {
      _.assign(state.messagesCache[sMessageKey], oMessage)
    } else {
      state.messagesCache[sMessageKey] = oMessage
    }
  })
}

export function setCurrentMessages (state) {
  state.currentMessages = messagesUtils.getMessages(state.messageList, 1, state.messagesCache, getters.getСurrentFolderFullName(state), state.currentAccount.AccountID)
}

export function setMessagesRead (state, payload) {
  _.each(payload.Uids, function (sUid) {
    var sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), sUid)
    var oMessage = state.messagesCache[sMessageKey]
    if (oMessage) {
      oMessage.IsSeen = payload.IsSeen
      if (oMessage.ThreadParentUid) {
        var sThreadMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), oMessage.ThreadParentUid)
        var oParentMessage = state.messagesCache[sThreadMessageKey]
        if (oParentMessage) {
          var bHasUnseenMessages = false
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
    var sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), sUid)
    var oMessage = state.messagesCache[sMessageKey]
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
  var sMessageKey = messagesUtils.getMessageCacheKey(state.currentAccount.AccountID, getters.getСurrentFolderFullName(state), payload.Uid)
  var oMessage = state.messagesCache[sMessageKey]
  if (oMessage) {
    _.assign(oMessage, payload)
    oMessage.Received = true
  }
}

export function setCurrentFolder (state, payload) {
  var oFolder = state.currentFolderList.Flat[payload]
  state.currentFolder = oFolder
}
