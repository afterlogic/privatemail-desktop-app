import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import dateUtils from 'src/utils/date'

function _getIconName(sType, sFolderFullName) {
  var sIconName = ''
  switch (sType) {
    case 1:
      sIconName = 'mail' // inbox
      break
    case 2:
      sIconName = 'send' // sent
      break
    case 3:
      sIconName = 'insert_drive_file' // drafts
      break
    case 4:
      sIconName = 'error' // spam
      break
    case 5:
      sIconName = 'delete' // trash
      break
    case 7:
      sIconName = 'star' // starred
      break
  }
  if (sFolderFullName === 'Notes') {
    sIconName = 'edit'
  }
  return sIconName;
}

function _prepareFolderList(aFolderListFromServer, oOldFoldersByNames) {
  var aNewFoldersByNames = []
  var aNewFoldersNames = []

  function _recursive(aFolderList) {
    var aNewFolderList = []
    _.each(aFolderList, function (oFolderFromServer) {
      var oOldFolder = oOldFoldersByNames[oFolderFromServer.FullName]
      var oNewFolder = {
        FullName: oFolderFromServer.FullName,
        Name: oFolderFromServer.Name,
        Type: oFolderFromServer.Type,
        IconName: _getIconName(oFolderFromServer.Type, oFolderFromServer.FullName),
        Count: oOldFolder ? oOldFolder.Count : 0,
        UnseenCount: oOldFolder ? oOldFolder.UnseenCount : 0,
        NextUid: oOldFolder ? oOldFolder.NextUid : '',
        Hash: oOldFolder ? oOldFolder.Hash : oFolderFromServer.FullName,
      }
      oNewFolder.SubFolders = (oFolderFromServer.SubFolders && oFolderFromServer.SubFolders['@Collection']) ? _recursive(oFolderFromServer.SubFolders['@Collection']) : []
      aNewFolderList.push(oNewFolder)
      aNewFoldersByNames[oNewFolder.FullName] = oNewFolder
      aNewFoldersNames.push(oNewFolder.FullName)
    })

    return aNewFolderList
  }

  var aResultNewFolderList = _recursive(aFolderListFromServer)

  return {
    folderList: aResultNewFolderList,
    foldersByNames: aNewFoldersByNames,
    foldersNames: aNewFoldersNames,
  }
}

function _prepareFoldersByNames(aStateFolderList) {
  var aNewFoldersByNames = []

  function _recursive(aFolderList) {
    _.each(aFolderList, function (oFolder) {
      aNewFoldersByNames[oFolder.FullName] = oFolder
    })
  }
  _recursive(aStateFolderList)
  
  return aNewFoldersByNames
}

function _getUids(aStateMessageList, iPage) {
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
}

function _getMessages(aStateMessageList, iPage, oStateMessagesCache) {
  var iPageSize = 20
  var iOffset = (iPage - 1) * iPageSize
  var aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iPageSize)
  var aCurrentMessages = []

  _.each(aPagedList, function (oMessageInfo) {
    var oMessage = oStateMessagesCache['INBOX' + oMessageInfo.uid]
    if (oMessage) {
      oMessage.Threads = []
      var bFlaggedThread = false
      var bThreadHasUnread = false
      if (oMessageInfo.thread) {
        _.each(oMessageInfo.thread, function (oThreadMessage) {
          var oThreadMessage = oStateMessagesCache['INBOX' + oThreadMessage.uid]
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

export default {
  namespaced: true,
  state: {
    syncing: false,
    account: null,
    folderList: null,
    foldersByNames: null,
    foldersNames: null,
    foldersCount: 0,
    foldersNamespace: '',
    messageList: null,
    messagesCache: {},
    currentMessages: [],
    currentMessage: null,
  },
  mutations: {
    setSyncing (state, payload) {
      state.syncing = payload
    },
    setAccount (state, payload) {
      state.account = payload
    },
    setFolderList (state, payload) {
      state.folderList = payload
    },
    setFoldersCount (state, payload) {
      state.foldersCount = payload
    },
    setFoldersNamespace (state, payload) {
      state.foldersNamespace = payload
    },
    setFoldersByNames (state, payload) {
      state.foldersByNames = payload
    },
    setFoldersNames (state, payload) {
      state.foldersNames = payload
    },
    setFoldersRelevantInformation (state, payload) {
      _.each(payload, function (aFolderCounts, sFolderFullName) {
        if (state.foldersByNames[sFolderFullName]) {
          state.foldersByNames[sFolderFullName].Count = aFolderCounts[0]
          state.foldersByNames[sFolderFullName].UnseenCount = aFolderCounts[1]
          state.foldersByNames[sFolderFullName].NextUid = aFolderCounts[2]
          state.foldersByNames[sFolderFullName].Hash = aFolderCounts[3]
        }
      })
    },
    setMessageList (state, payload) {
      state.messageList = payload
    },
    setMessagesCache (state, payload) {
      _.each(payload, function (oMessage) {
        oMessage.Deleted = false
        oMessage.ShortDate = dateUtils.getShortDate(oMessage.TimeStampInUTC, false)
        oMessage.MiddleDate = dateUtils.getShortDate(oMessage.TimeStampInUTC, true)
        state.messagesCache[oMessage.Folder + oMessage.Uid] = oMessage
      })
    },
    setCurrentMessages (state) {
      state.currentMessages = _getMessages(state.messageList, 1, state.messagesCache)
    },
    setMessagesRead (state, payload) {
      _.each(payload.Uids, function (sUid) {
        var oMessage = state.messagesCache['INBOX' + sUid]
        if (oMessage) {
          oMessage.IsSeen = payload.IsSeen
          if (oMessage.ThreadParentUid) {
            var oParentMessage = state.messagesCache['INBOX' + oMessage.ThreadParentUid]
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
    },
    setAllMessagesRead (state) {
      _.each(state.messagesCache, function (oMessage) {
        oMessage.IsSeen = true
        if (oMessage.Threads) {
          oMessage.ThreadHasUnread = false
        }
      })
    },
    moveMessagesToFolder (state, payload) {
      _.each(payload.Uids, function (sUid) {
        var oMessage = state.messagesCache['INBOX' + sUid]
        if (oMessage) {
          oMessage.Deleted = true
        }
      })
    },
    setMessageFlagged (state, payload) {
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
    },
    setCurrentMessage (state, payload) {
      state.currentMessage = payload
    },
    updateMessage (state, payload) {
      var oMessage = state.messagesCache['INBOX' + payload.Uid]
      if (oMessage) {
        _.assign(oMessage, payload)
        oMessage.Received = true
      }
    },
  },
  actions: {
    logout ({ commit }) {
      commit('setAccount', null)
      commit('setFolderList', null)
      commit('setFoldersByNames', null)
      commit('setFoldersNames', null)
      commit('setFoldersCount', 0)
      commit('setFoldersNamespace', '')
    },
    setCurrentMessage ({ commit, dispatch }, payload) {
      commit('setCurrentMessage', payload)
      if (!payload.IsSeen) {
        dispatch('setMessagesRead', {
          Uids: [payload.Uid],
          IsSeen: true
        })
      }
      if (!payload.Received) {
        dispatch('asyncGetCurrentMessage')
      }
    },
    setMessagesRead ({ state, commit, dispatch }, payload) {
      commit('setMessagesRead', payload)
      webApi.sendRequest('Mail', 'SetMessagesSeen', {AccountID: state.account.AccountID, Folder: 'INBOX', Uids: payload.Uids.join(','), SetAction: payload.IsSeen}, (oResult, oError) => {
        dispatch('asyncGetFoldersRelevantInformation')
      })
    },
    setAllMessagesRead ({ state, commit, dispatch }) {
      commit('setAllMessagesRead')
      webApi.sendRequest('Mail', 'SetAllMessagesSeen', {AccountID: state.account.AccountID, Folder: 'INBOX', SetAction: true}, (oResult, oError) => {
        dispatch('asyncGetFoldersRelevantInformation')
      })
    },
    moveMessagesToFolder ({ state, commit, dispatch }, payload) {
      commit('moveMessagesToFolder', payload)
      webApi.sendRequest('Mail', 'MoveMessages', {AccountID: state.account.AccountID, Folder: 'INBOX', ToFolder: payload.ToFolder, Uids: payload.Uids.join(',')}, (oResult, oError) => {
        dispatch('asyncGetFoldersRelevantInformation')
      })
    },
    setMessageFlagged ({ state, commit, dispatch }, payload) {
      commit('setMessageFlagged', payload)
      webApi.sendRequest('Mail', 'SetMessageFlagged', {AccountID: state.account.AccountID, Folder: 'INBOX', Uids: payload.Uid, SetAction: payload.Flagged}, (oResult, oError) => {
        dispatch('asyncGetFoldersRelevantInformation')
      })
    },
    asyncGetCurrentMessage ({ state, commit }) {
      webApi.sendRequest('Mail', 'GetMessage', {AccountID: state.account.AccountID, Folder: 'INBOX', Uid: state.currentMessage.Uid}, (oResult, oError) => {
        if (oResult) {
          commit('updateMessage', oResult)
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while getting message'))
        }
      })
    },
    asyncGetMessages ({ state, commit }) {
      commit('setSyncing', true)
      webApi.sendRequest('Mail', 'GetMessagesByUids', {AccountID: state.account.AccountID, Folder: 'INBOX', Uids: _getUids(state.messageList, 1)}, (oResult, oError) => {
        commit('setSyncing', false)
        if (oResult && oResult['@Collection']) {
          commit('setMessagesCache', oResult['@Collection'])
          commit('setCurrentMessages')
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
        }
      })
    },
    asyncGetMessagesInfo ({ state, commit, dispatch }) {
      webApi.sendRequest('Mail', 'GetMessagesInfo', {AccountID: state.account.AccountID, Folder: 'INBOX', UseThreading: true, SortBy: 'date', SortOrder: 1}, (oResult, oError) => {
        if (oResult) {
          commit('setMessageList', oResult)
          dispatch('asyncGetMessages')
        } else {
          commit('setSyncing', false)
          notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
        }
      })
    },
    asyncGetFoldersRelevantInformation ({ state, commit, dispatch }) {
      if (state.account) {
        commit('setSyncing', true)
        webApi.sendRequest('Mail', 'GetRelevantFoldersInformation', {AccountID: state.account.AccountID, Folders: state.foldersNames, UseListStatusIfPossible: true}, (oResult, oError) => {
          if (oResult && oResult.Counts) {
            commit('setFoldersRelevantInformation', oResult.Counts)
            dispatch('asyncGetMessagesInfo')
          } else {
            commit('setSyncing', false)
            notification.showError(errors.getText(oError, 'Error occurred while getting folders relevant information'))
          }
        })
      } else {
        commit('setSyncing', false)
      }
    },
    asyncGetFolderList ({ state, commit, dispatch }) {
      if (state.account) {
        commit('setSyncing', true)
        webApi.sendRequest('Mail', 'GetFolders', {AccountID: state.account.AccountID}, (oResult, oError) => {
          if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
            var oFolderListData = _prepareFolderList(oResult.Folders['@Collection'], state.foldersByNames || [])
            commit('setFolderList', oFolderListData.folderList)
            commit('setFoldersByNames', oFolderListData.foldersByNames)
            commit('setFoldersNames', oFolderListData.foldersNames)
            commit('setFoldersCount', oResult.Folders['@Count'])
            commit('setFoldersNamespace', oResult.Folders.Namespace)
            dispatch('asyncGetFoldersRelevantInformation')
          } else {
            commit('setSyncing', false)
            notification.showError(errors.getText(oError, 'Error occurred while getting folder list'))
          }
        })
      }
    },
    asyncGetSettings ({ state, commit, dispatch }) {
      if (_.isEmpty(state.foldersByNames) && !_.isEmpty(state.foldersNames)) {
        commit('setFoldersByNames', _prepareFoldersByNames(state.folderList))
      }
      webApi.sendRequest('Mail', 'GetSettings', {}, (oResult, oError) => {
        if (oResult) {
          if (oResult.Accounts && oResult.Accounts[0]) {
            commit('setAccount', oResult.Accounts[0])
            dispatch('asyncGetFolderList')
          }
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while getting mail settings'))
        }
      })
    },
  },
  getters: {
    getSyncing (state) {
      return state.syncing
    },
    getAccount (state) {
      return state.account
    },
    getFolderList (state) {
      return state.folderList
    },
    getСurrentMessages (state) {
      return state.currentMessages
    },
    getСurrentMessage (state) {
      return state.currentMessage
    },
  },
}
