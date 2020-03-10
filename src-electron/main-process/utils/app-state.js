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
    return aLastFoldersInfoTime[iAccountId] === sLastFoldersInfoTime
  },

  setLastMessagesInfoTime: function (iAccountId, sFolderFullName) {
    let oNow = new Date()
    let sLastMessagesInfoTime = oNow.getHours() + ':' + oNow.getMinutes() + ':' + oNow.getSeconds() + ':' + oNow.getMilliseconds()
    if (!_.isObject(aLastMessagesInfoTime[iAccountId])) {
      aLastMessagesInfoTime[iAccountId] = {}
    }
    aLastMessagesInfoTime[iAccountId][sFolderFullName] = sLastMessagesInfoTime
    return sLastMessagesInfoTime
  },

  resetLastMessagesInfoTime: function (iAccountId, sFolderFullName) {
    if (!_.isObject(aLastMessagesInfoTime[iAccountId])) {
      aLastMessagesInfoTime[iAccountId] = {}
    }
    aLastMessagesInfoTime[iAccountId][sFolderFullName] = '---'
  },

  isLastMessagesInfoTime: function (iAccountId, sFolderFullName, sLastMessagesInfoTime) {
    if (!_.isObject(aLastMessagesInfoTime[iAccountId])) {
      aLastMessagesInfoTime[iAccountId] = {}
    }
    return aLastMessagesInfoTime[iAccountId][sFolderFullName] === sLastMessagesInfoTime
  },
}
