import _ from 'lodash'

export default {
  getMessagesWithThreads: function (aMessages, aMessagesInfo) {
    let aMessagesWithThreads = []
    _.each(aMessagesInfo, function (oMessageInfo) {
      let oMessage = _.find(aMessages, function (oMessage) {
        return oMessage.Uid === oMessageInfo.uid
      })
      if (oMessage) {
        aMessagesWithThreads.push(oMessage)
        let aThreads = []
        // _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
        //   let sThreadMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oThreadMessageInfo.uid)
        //   let oThreadMessage = oStateMessagesCache[sThreadMessageKey]
        //   if (oThreadMessage) {
        //     oThreadMessage.ThreadParentUid = oMessage.Uid
        //     oThreadMessage.Threads = null
        //     oThreadMessage.PartialFlagged = false
        //     oThreadMessage.ThreadHasUnread = false
        //     aThreads.push(oThreadMessage)
        //   } else {
        //     aNotFounUids.push(oThreadMessageInfo.uid)
        //   }
        // })
        oMessage.Threads = aThreads
      }
    })
    return aMessagesWithThreads
  },
}
