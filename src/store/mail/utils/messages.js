import store from 'src/store'

export default {
  getUidsToRetrieve: function (aMessageList, aRequestedUids, oStateMessagesCache, iAccountId, sFolderFullName) {
    var aUids = []
    _.each(aMessageList, (oMessageInfo) => {
      var sMessageKey = this.getMessageCacheKey(iAccountId, sFolderFullName, oMessageInfo.uid)
      var oMessage = oStateMessagesCache[sMessageKey]
      if (!oMessage && _.indexOf(aRequestedUids, oMessageInfo.uid) === -1) {
        aUids.push(oMessageInfo.uid)
      }
      if (oMessage && oMessageInfo.thread) {
        _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
          var sThreadMessageKey = this.getMessageCacheKey(iAccountId, sFolderFullName, oThreadMessageInfo.uid)
          var oThreadMessage = oStateMessagesCache[sThreadMessageKey]
          if (!oThreadMessage && _.indexOf(aRequestedUids, oThreadMessageInfo.uid) === -1) {
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

  getMessages: function (aStateMessageList, iMailsPerPage, iPage, oStateMessagesCache, sStateCurrentFolderFullName, iCurrentAccountId) {
    console.time('getMessages')
    let iOffset = (iPage - 1) * iMailsPerPage
    let aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iMailsPerPage)
    let aCurrentMessages = []
    let aNotFounUids = []

    _.each(aPagedList, (oMessageInfo) => {
      let sMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oMessageInfo.uid)
      let oMessage = oStateMessagesCache[sMessageKey]
      if (oMessage) {
        // let bFlagsChanged = -1 !== _.findIndex(oMessageInfo.thread, function (oThreadInfo) {
        //   return oThreadInfo.flagsChanged
        // })
        // if (oMessageInfo.NeedPopulateThread || bFlagsChanged || /** for the first time */_.isArray(oMessageInfo.thread) && !_.isArray(oMessage.Threads)) {
            let aThreads = []
          _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
            let sThreadMessageKey = this.getMessageCacheKey(iCurrentAccountId, sStateCurrentFolderFullName, oThreadMessageInfo.uid)
            let oThreadMessage = oStateMessagesCache[sThreadMessageKey]
            if (oThreadMessage) {
              oThreadMessage.ThreadParentUid = oMessage.Uid
              oThreadMessage.Threads = null
              oThreadMessage.PartialFlagged = false
              oThreadMessage.ThreadHasUnread = false
              aThreads.push(oThreadMessage)
            } else {
              aNotFounUids.push(oThreadMessageInfo.uid)
            }
          })
          if (aThreads.length > 0) {
            oMessage.Threads = aThreads // this operation extremely slows down performance
          } else if (_.isArray(oMessage.Threads)) {
            oMessage.Threads = null // do not delete because it will not trigger changes in UI
          }
          oMessageInfo.NeedPopulateThread = false
        // }
        delete oMessage.ThreadParentUid
        aCurrentMessages.push(oMessage)
      } else {
        aNotFounUids.push(oMessageInfo.uid)
      }
    })

    console.timeEnd('getMessages')
    return { aCurrentMessages, aNotFounUids }
  },

  getMessagesInfoParameters: function (iAccountId, sFolderFullName, sSearch, sFilter) {
    let oDrafts = store.state.mail.currentFolderList.Drafts
    let bDrafts = oDrafts && oDrafts.FullName === sFolderFullName
    let oSpam = store.state.mail.currentFolderList.Spam
    let bSpam = oSpam && oSpam.FullName === sFolderFullName
    let oTrash = store.state.mail.currentFolderList.Trash
    let bTrash = oTrash && oTrash.FullName === sFolderFullName
    return {
      AccountID: iAccountId,
      Folder: sFolderFullName,
      UseThreading: (bDrafts || bSpam || bTrash || sFilter || sSearch) ? false : true,
      SortBy: 'arrival',
      SortOrder: 1,
      Search: sSearch,
      Filter: sFilter,
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
