import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import messagesUtils from './utils/messages.js'

export function asyncGetSettings ({ commit, dispatch }) {
  webApi.sendRequest('Mail', 'GetSettings', {}, (oResult, oError) => {
    if (oResult) {
      if (oResult.Accounts && oResult.Accounts[0]) {
        commit('setCurrentAccount', oResult.Accounts[0])
        commit('setCurrentFolderList')
        dispatch('asyncGetFolderList')
      }
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting mail settings'))
    }
  })
}

export function asyncGetFolderList ({ state, commit, dispatch, getters }) {
  if (state.currentAccount) {
    commit('setSyncing', true)
    var foldersAccountId = state.currentAccount.AccountID
    webApi.sendRequest('Mail', 'GetFolders', {AccountID: foldersAccountId}, (oResult, oError) => {
      if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
        commit('parseFolderList', {
          FolderListFromServer: oResult.Folders,
          AccountId: foldersAccountId
        })
        commit('setCurrentFolderList')
        if (!state.currentFolder) {
          commit('setCurrentFolder', getters.getInboxFullName)
        }
        dispatch('asyncGetAllFoldersRelevantInformation')
      } else {
        commit('setSyncing', false)
        notification.showError(errors.getText(oError, 'Error occurred while getting folder list'))
      }
    })
  }
}

export function asyncGetAllFoldersRelevantInformation ({ state, dispatch }) {
  dispatch('asyncGetFoldersRelevantInformation', state.currentFolderList.Names)
}

export function asyncGetDisplayedFoldersRelevantInformation ({ dispatch, getters }) {
  dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
}

export function asyncGetFoldersRelevantInformation ({ state, commit, dispatch }, payload) {
  if (state.currentAccount) {
    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetRelevantFoldersInformation', {AccountID: state.currentAccount.AccountID, Folders: payload, UseListStatusIfPossible: true}, (oResult, oError) => {
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
}

export function asyncGetMessagesInfo ({ state, commit, dispatch, getters }) {
  var sFolderFullNameToRefresh = getters.getFolderFullNameToRefresh
  if (sFolderFullNameToRefresh === '' && state.messageList === null) {
    sFolderFullNameToRefresh = getters.getСurrentFolderFullName
  }
  if (sFolderFullNameToRefresh !== '') {
    commit('setSyncing', true)
    var oParameters = messagesUtils.getMessagesInfoParameters(state.currentAccount.AccountID, sFolderFullNameToRefresh)
    webApi.sendRequest('Mail', 'GetMessagesInfo', oParameters, (oResult, oError) => {
      if (oResult) {
        commit('setMessageList', {
          Parameters: oParameters,
          MessagesInfo: oResult,
        })
        dispatch('asyncGetMessages')
      } else {
        commit('setSyncing', false)
        notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
      }
    })
  } else {
    commit('setCurrentMessages')
    commit('setSyncing', false)
  }
}

export function asyncGetMessages ({ state, commit, dispatch, getters }) {
  var iAccountId = state.currentAccount.AccountID
  var aUids = messagesUtils.getUidsToRetrieve(state.messageList, state.messagesCache, iAccountId, getters.getСurrentFolderFullName)
  if (aUids.length === 0) {
    commit('setCurrentMessages')
    commit('setSyncing', false)
  } else {
    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetMessagesByUids', {AccountID: iAccountId, Folder: getters.getСurrentFolderFullName, Uids: aUids}, (oResult, oError) => {
      commit('setSyncing', false)
      if (oResult && oResult['@Collection']) {
        commit('updateMessagesCache', {
          AccountId: iAccountId,
          Messages: oResult['@Collection'],
        })
        commit('setCurrentMessages')
        dispatch('asyncGetMessagesBodies')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting messages'))
      }
    })
  }
}

export function asyncGetMessagesBodies ({ state, commit, getters }) {
  var iAccountId = state.currentAccount.AccountID
  var aUids = messagesUtils.getUidsToRetrieveBodies(state.messageList, state.messagesCache, iAccountId, getters.getСurrentFolderFullName)
  if (aUids.length > 0) {
    webApi.sendRequest('Mail', 'GetMessagesBodies', {AccountID: iAccountId, Folder: getters.getСurrentFolderFullName, Uids: aUids}, (oResult, oError) => {
      if (oResult && _.isArray(oResult)) {
        _.each(oResult, function (oMessageFromServer) {
          commit('updateMessage', oMessageFromServer)
        })
      }
    })
  }
}

export function asyncGetCurrentMessage ({ state, commit, getters }) {
  webApi.sendRequest('Mail', 'GetMessage', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uid: state.currentMessage.Uid}, (oResult, oError) => {
    if (oResult) {
      commit('updateMessage', oResult)
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting message'))
    }
  })
}

export function setCurrentFolder ({ state, commit, dispatch }, payload) {
  commit('setCurrentFolder', payload)
  commit('setMessageList', {
    AccountId: state.currentAccount.AccountID,
    FolderFullName: payload,
  })
  commit('setCurrentMessages')
  if (state.messageList === null) {
    dispatch('asyncGetMessagesInfo')
  } else if (state.currentMessages.length === 0 && state.messageList.length > 0) {
    dispatch('asyncGetMessages')
  }
}

export function setCurrentMessage ({ commit, dispatch }, payload) {
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
}

export function setMessagesRead ({ state, commit, dispatch, getters }, payload) {
  commit('setMessagesRead', payload)
  webApi.sendRequest('Mail', 'SetMessagesSeen', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: payload.Uids.join(','), SetAction: payload.IsSeen}, (oResult, oError) => {
    dispatch('asyncGetDisplayedFoldersRelevantInformation')
  })
}

export function setAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead')
  webApi.sendRequest('Mail', 'SetAllMessagesSeen', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, SetAction: true}, (oResult, oError) => {
    dispatch('asyncGetDisplayedFoldersRelevantInformation')
  })
}

export function moveMessagesToFolder ({ state, commit, dispatch, getters }, payload) {
  commit('setMessagesDeleted', {
    Uids: payload.Uids,
    Deleted: true,
  })
  webApi.sendRequest('Mail', 'MoveMessages', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, ToFolder: payload.ToFolder, Uids: payload.Uids.join(',')}, (oResult, oError) => {
    if (!oResult) {
      commit('setMessagesDeleted', {
        Uids: payload.Uids,
        Deleted: false,
      })
    }
    dispatch('asyncGetDisplayedFoldersRelevantInformation')
  })
}

export function setMessageFlagged ({ state, commit, dispatch, getters }, payload) {
  commit('setMessageFlagged', payload)
  webApi.sendRequest('Mail', 'SetMessageFlagged', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: payload.Uid, SetAction: payload.Flagged}, (oResult, oError) => {
    dispatch('asyncGetDisplayedFoldersRelevantInformation')
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}
