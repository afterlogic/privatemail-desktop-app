import _ from 'lodash'

import messagesDbManager from './messages-db-manager.js'

import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

export default {
  getMessagesWithThreads: function ({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, aMessagesInfo, sApiHost, sAuthToken }) {
    return new Promise((resolve, reject) => {
      let iTotalCount = aMessagesInfo.length
      let aMessagesInfoSliced = []
      let iOffset = iMessagesPerPage * (iPage - 1)
      if (iTotalCount > iOffset) {
        aMessagesInfoSliced = aMessagesInfo.slice(iOffset, iOffset + iMessagesPerPage)
      }

      if (aMessagesInfoSliced.length > 0) {
        let aUids = []
        _.each(aMessagesInfoSliced, (oMessageInfo) => {
          aUids.push(oMessageInfo.uid)
          if (typesUtils.isNonEmptyArray(oMessageInfo.thread)) {
            _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
              aUids.push(oThreadMessageInfo.uid)
            })
          }
        })

        this.getMessagesByUids({ iAccountId, sFolderFullName, aUids, sApiHost, sAuthToken }).then(
          (aMessages) => {
            let aMessagesWithThreads = []
            _.each(aMessagesInfoSliced, function (oMessageInfo) {
              let oMessage = _.find(aMessages, function (oTmpMessage) {
                return oTmpMessage.Uid === oMessageInfo.uid
              })
              if (oMessage) {
                oMessage.IsSeen = (oMessageInfo.flags.indexOf('\\seen') >= 0)
                oMessage.IsFlagged = (oMessageInfo.flags.indexOf('\\flagged') >= 0)
                oMessage.IsAnswered = (oMessageInfo.flags.indexOf('\\answered') >= 0)
                oMessage.IsForwarded = (oMessageInfo.flags.indexOf('$forwarded') >= 0)
                aMessagesWithThreads.push(oMessage)
                let aThreads = []
                let bHasFlagged = false
                let bHasUnseen = false
                 _.each(oMessageInfo.thread, (oThreadMessageInfo) => {
                  let oThreadMessage = _.find(aMessages, function (oTmpMessage) {
                    return oTmpMessage.Uid === oThreadMessageInfo.uid
                  })
                  if (oThreadMessage) {
                    oThreadMessage.IsSeen = (oThreadMessageInfo.flags.indexOf('\\seen') >= 0)
                    oThreadMessage.IsFlagged = (oThreadMessageInfo.flags.indexOf('\\flagged') >= 0)
                    oThreadMessage.IsAnswered = (oThreadMessageInfo.flags.indexOf('\\answered') >= 0)
                    oThreadMessage.IsForwarded = (oThreadMessageInfo.flags.indexOf('$forwarded') >= 0)
                    bHasFlagged = bHasFlagged || oThreadMessage.IsFlagged
                    bHasUnseen = bHasUnseen || !oThreadMessage.IsSeen
                    oThreadMessage.ThreadParentUid = oMessage.Uid
                    oThreadMessage.Threads = null
                    oThreadMessage.PartialFlagged = false
                    oThreadMessage.ThreadHasUnread = false
                    aThreads.push(oThreadMessage)
                  }
                })
                oMessage.ThreadParentUid = null
                oMessage.Threads = aThreads
                oMessage.PartialFlagged = bHasFlagged
                oMessage.ThreadHasUnread = bHasUnseen
              }
            })
            resolve({ aMessages: aMessagesWithThreads, iTotalCount })
          },
          (oResult) => {
            reject(oResult)
          }
        )
      } else {
        resolve({ aMessages: [], iTotalCount })
      }
    })
  },

  getMessagesByUids: function ({ iAccountId, sFolderFullName, aUids, sApiHost, sAuthToken }) {
    return new Promise((resolve, reject) => {
      messagesDbManager.getMessagesByUids({ iAccountId, sFolderFullName, aUids }).then(
        (aMessages) => {
          let aFoundUids = _.map(aMessages, (oTmpMessage) => { return oTmpMessage.Uid })
          let aNotFoundUids = _.difference(aUids, aFoundUids)
          if (aNotFoundUids.length > 0) {
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetMessagesBodies',
              oParameters: {
                AccountID: iAccountId,
                Folder: sFolderFullName,
                Uids: aNotFoundUids,
              },
              fCallback: (aMessagesFromServer, oError) => {
                if (aMessagesFromServer && _.isArray(aMessagesFromServer)) {
                  this.setMessages({ iAccountId, aMessages: aMessagesFromServer })
                  resolve(_.union(aMessages, aMessagesFromServer))
                } else {
                  reject({ sMethod: 'getMessagesByUids', oError, aMessagesFromServer })
                }
              },
            })
          } else {
            resolve(aMessages)
          }
        },
        (oResult) => {
          reject(oResult)
        }
      )
    })
  },
}
