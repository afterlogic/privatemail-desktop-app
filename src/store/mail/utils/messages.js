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

  getUidsToRetrieve: function (aMessageList, oStateMessagesCache, iAccountId, sFolderFullName) {
    var aUids = []
    _.each(aMessageList, (oMessageInfo) => {
      var sMessageKey = this.getMessageCacheKey(iAccountId, sFolderFullName, oMessageInfo.uid)
      var oMessage = oStateMessagesCache[sMessageKey]
      if (!oMessage) {
        aUids.push(oMessageInfo.uid)
      }
      if (oMessage && oMessageInfo.thread) {
        _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
          var sThreadMessageKey = this.getMessageCacheKey(iAccountId, sFolderFullName, oThreadMessageInfo.uid)
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
    console.time('getMessages')
    let iPageSize = 20
    let iOffset = (iPage - 1) * iPageSize
    let aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iPageSize)
    let aCurrentMessages = []
  
    _.each(aPagedList, (oMessageInfo) => {
      let sMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oMessageInfo.uid)
      let oMessage = oStateMessagesCache[sMessageKey]
      if (oMessage) {
        let bFlagsChanged = -1 !== _.findIndex(oMessageInfo.thread, function (oThreadInfo) {
          return oThreadInfo.flagsChanged
        })
        if (oMessageInfo.NeedPopulateThread || bFlagsChanged) {
            let aThreads = []
          _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
            let sThreadMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oThreadMessageInfo.uid)
            let oThreadMessage = oStateMessagesCache[sThreadMessageKey]
            if (oThreadMessage) {
              oThreadMessage.ThreadParentUid = oMessage.Uid
              oThreadMessage.Threads = null
              aThreads.push(oThreadMessage)
            }
          })
          if (aThreads.length > 0) {
            oMessage.Threads = aThreads // this operation extremely slows down performance
          } else if (_.isArray(oMessage.Threads)) {
            oMessage.Threads = null // do not delete because it will not trigger changes in UI
          }
          oMessageInfo.NeedPopulateThread = false
        }
        delete oMessage.ThreadParentUid
        aCurrentMessages.push(oMessage)
      }
    })
    console.timeEnd('getMessages')
    return aCurrentMessages
  },

  getMessagesInfoParameters: function (iAccountId, sFolderFullName) {
    return {
      AccountID: iAccountId,
      Folder: sFolderFullName,
      UseThreading: true,
      SortBy: 'arrival',
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
