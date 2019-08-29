export default {
  getUids: function (aStateMessageList, iPage) {
    var aUids = []
    var iPageSize = 20
    var iOffset = (iPage - 1) * iPageSize
    var aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iPageSize)
  
    _.each(aPagedList, function (oMessageInfo) {
      aUids.push(oMessageInfo.uid)
      if (oMessageInfo.thread) {
        _.each(oMessageInfo.thread, function (threadItem) {
          aUids.push(threadItem.uid)
        })
      }
    })
  
    return aUids
  },

  getMessages: function (aStateMessageList, iPage, oStateMessagesCache, oStateCurrentFolder) {
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
}
