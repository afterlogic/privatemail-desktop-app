export default {
  getUidsToRetrieveBodies: function (aStateMessageList, oStateMessagesCache, iCurrentAccountId, sStateCurrentFolderFullName) {
    var aUids = []

    _.each(aStateMessageList, (oMessageInfo) => {
      var sMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oMessageInfo.uid)
      var oMessage = oStateMessagesCache[sMessageKey]
      if (oMessage && !oMessage.Received) {
        aUids.push(oMessageInfo.uid)
      }
      if (oMessage && oMessageInfo.thread) {
        _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
          var sThreadMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oThreadMessageInfo.uid)
          var oThreadMessage = oStateMessagesCache[sThreadMessageKey]
          if (oThreadMessage && !oThreadMessage.Received) {
            aUids.push(oThreadMessageInfo.uid)
          }
        })
      }
      if (aUids.length >= 50) {
        return false
      }
    })

    return aUids
  },

  getUidsToRetrieve: function (aStateMessageList, oStateMessagesCache, iCurrentAccountId, sStateCurrentFolderFullName) {
    var aUids = []

    _.each(aStateMessageList, (oMessageInfo) => {
      var sMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oMessageInfo.uid)
      var oMessage = oStateMessagesCache[sMessageKey]
      if (!oMessage) {
        aUids.push(oMessageInfo.uid)
      }
      if (oMessage && oMessageInfo.thread) {
        _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
          var sThreadMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oThreadMessageInfo.uid)
          var oThreadMessage = oStateMessagesCache[sThreadMessageKey]
          if (!oThreadMessage) {
            aUids.push(oThreadMessageInfo.uid)
          }
        })
      }
      if (aUids.length >= 50) {
        return false
      }
    })

    return aUids
  },

  getMessages: function (aStateMessageList, iPage, oStateMessagesCache, sStateCurrentFolderFullName, iCurrentAccountId) {
    var iPageSize = 20
    var iOffset = (iPage - 1) * iPageSize
    var aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iPageSize)
    var aCurrentMessages = []
  
    _.each(aPagedList, (oMessageInfo) => {
      var sMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oMessageInfo.uid)
      var oMessage = oStateMessagesCache[sMessageKey]
      if (oMessage) {
        oMessage.Threads = []
        var bFlaggedThread = false
        var bThreadHasUnread = false
        if (oMessageInfo.thread) {
          _.each(oMessageInfo.thread, (oThreadMessage) => {
            var sThreadMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oThreadMessage.uid)
            var oThreadMessage = oStateMessagesCache[sThreadMessageKey]
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
  },

  getMessagesInfoParameters: function (iAccountId, sFolderFullName) {
    return {
      AccountID: iAccountId,
      Folder: sFolderFullName,
      UseThreading: true,
      SortBy: 'date',
      SortOrder: 1,
    }
  },

  getMessageCacheKey: function (iAccountId, sFolderFullName, sUid) {
    return JSON.stringify({
      AccountId: iAccountId,
      FolderFullName: sFolderFullName,
      Uid: sUid
    })
  },
}
