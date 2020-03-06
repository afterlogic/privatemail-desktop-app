import _ from 'lodash'

let aLastFoldersInfoTime = {}
let aLastMessagesInfoTime = {}

export default {
  setLastFoldersInfoTime: function (iAccountId) {
    let oNow = new Date()
    let sLastFoldersInfoTime = oNow.getHours() + ':' + oNow.getMinutes() + ':' + oNow.getSeconds() + ':' + oNow.getMilliseconds()
    aLastFoldersInfoTime[iAccountId] = sLastFoldersInfoTime
    return sLastFoldersInfoTime
  },

  resetLastFoldersInfoTime: function (iAccountId) {
    aLastFoldersInfoTime[iAccountId] = '---'
  },

  isLastFoldersInfoTime: function (iAccountId, sLastFoldersInfoTime) {
    return true
    // return aLastFoldersInfoTime[iAccountId] === sLastFoldersInfoTime
  },

  setLastMessagesInfoTime: function (iAccountId, sFolderFullName) {
    let oNow = new Date()
    let sLastMessagesInfoTime = oNow.getHours() + ':' + oNow.getMinutes() + ':' + oNow.getSeconds() + ':' + oNow.getMilliseconds()
    let sLastMessagesInfoTimeKey = JSON.stringify({ iAccountId, sFolderFullName })
    aLastMessagesInfoTime[sLastMessagesInfoTimeKey] = sLastMessagesInfoTime
    return sLastMessagesInfoTime
  },

  resetLastMessagesInfoTime: function (iAccountId, sFolderFullName) {
    let sLastMessagesInfoTimeKey = JSON.stringify({ iAccountId, sFolderFullName, sFolderFullName })
    aLastMessagesInfoTime[sLastMessagesInfoTimeKey] = '---'
  },

  isLastMessagesInfoTime: function (iAccountId, sFolderFullName, sLastMessagesInfoTime) {
    return true
    // let sLastMessagesInfoTimeKey = JSON.stringify({ iAccountId, sFolderFullName })
    // return aLastMessagesInfoTime[sLastMessagesInfoTimeKey] === sLastMessagesInfoTime
  },
}
