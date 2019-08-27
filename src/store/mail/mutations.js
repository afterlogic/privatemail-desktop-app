import _ from 'lodash'
import dateUtils from 'src/utils/date'

function _getMessages(aStateMessageList, iPage, oStateMessagesCache, oStateCurrentFolder) {
  var iPageSize = 20
  var iOffset = (iPage - 1) * iPageSize
  var aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iPageSize)
  var aCurrentMessages = []

  _.each(aPagedList, function (oMessageInfo) {
    var oMessage = oStateMessagesCache[oStateCurrentFolder + oMessageInfo.uid]
    if (oMessage) {
      oMessage.Threads = []
      var bFlaggedThread = false
      var bThreadHasUnread = false
      if (oMessageInfo.thread) {
        _.each(oMessageInfo.thread, function (oThreadMessage) {
          var oThreadMessage = oStateMessagesCache[oStateCurrentFolder + oThreadMessage.uid]
          if (oThreadMessage) {
            if (oThreadMessage.IsFlagged) {
              bFlaggedThread = true
            }
            if (!oThreadMessage.IsSeen) {
              bThreadHasUnread = true
            }
            oThreadMessage.ThreadParentUid = oMessage.Uid
            oMessage.Threads.push(oThreadMessage)
          }
        })
      }
      oMessage.PartialFlagged = bFlaggedThread
      oMessage.ThreadHasUnread = bThreadHasUnread
      aCurrentMessages.push(oMessage)
    }
  })

  return aCurrentMessages
}

export function setSyncing (state, payload) {
  state.syncing = payload
}

export function setAccount (state, payload) {
  state.account = payload
}

export function setFolderList (state, payload) {
  state.folderList = payload
}

export function setFoldersCount (state, payload) {
  state.foldersCount = payload
}

export function setFoldersNamespace (state, payload) {
  state.foldersNamespace = payload
}

export function setFoldersByNames (state, payload) {
  state.foldersByNames = payload
}

export function setFoldersNames (state, payload) {
  state.foldersNames = payload
}

export function setFoldersRelevantInformation (state, payload) {
  _.each(payload, function (aFolderCounts, sFolderFullName) {
    if (state.foldersByNames[sFolderFullName]) {
      state.foldersByNames[sFolderFullName].Count = aFolderCounts[0]
      state.foldersByNames[sFolderFullName].UnseenCount = aFolderCounts[1]
      state.foldersByNames[sFolderFullName].NextUid = aFolderCounts[2]
      state.foldersByNames[sFolderFullName].Hash = aFolderCounts[3]
    }
  })
}

export function setMessageList (state, payload) {
  state.messageList = payload
}

export function setMessagesCache (state, payload) {
  _.each(payload, function (oMessage) {
    oMessage.Deleted = false
    oMessage.ShortDate = dateUtils.getShortDate(oMessage.TimeStampInUTC, false)
    oMessage.MiddleDate = dateUtils.getShortDate(oMessage.TimeStampInUTC, true)
    state.messagesCache[oMessage.Folder + oMessage.Uid] = oMessage
  })
}

export function setCurrentMessages (state) {
  state.currentMessages = _getMessages(state.messageList, 1, state.messagesCache, state.currentFolder)
}

export function setMessagesRead (state, payload) {
  _.each(payload.Uids, function (sUid) {
    var oMessage = state.messagesCache[state.currentFolder + sUid]
    if (oMessage) {
      oMessage.IsSeen = payload.IsSeen
      if (oMessage.ThreadParentUid) {
        var oParentMessage = state.messagesCache[state.currentFolder + oMessage.ThreadParentUid]
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

export function moveMessagesToFolder (state, payload) {
  _.each(payload.Uids, function (sUid) {
    var oMessage = state.messagesCache[state.currentFolder + sUid]
    if (oMessage) {
      oMessage.Deleted = true
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
  var oMessage = state.messagesCache[state.currentFolder + payload.Uid]
  if (oMessage) {
    _.assign(oMessage, payload)
    oMessage.Received = true
  }
}

export function setCurrentFolder (state, payload) {
  state.currentFolder = payload
}
