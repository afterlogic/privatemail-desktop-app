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

export function asyncGetPartFoldersRelevantInformation ({ dispatch, getters }) {
  dispatch('asyncGetFoldersRelevantInformation', _.uniq([getters.getСurrentFolderFullName, 'INBOX', 'Sent', 'Drafts']))
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
  if (getters.getСurrentFolderFullName !== '') {
    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetMessagesInfo', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, UseThreading: true, SortBy: 'date', SortOrder: 1}, (oResult, oError) => {
      if (oResult) {
        commit('setMessageList', oResult)
        dispatch('asyncGetMessages')
      } else {
        commit('setSyncing', false)
        notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
      }
    })
  }
}

export function asyncGetMessages ({ state, commit, getters }) {
  var aUids = messagesUtils.getUids(state.messageList, 1)
  if (aUids.length === 0) {
    commit('setMessagesCache', [])
    commit('setCurrentMessages')
    commit('setSyncing', false)
  } else {
    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetMessagesByUids', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: aUids}, (oResult, oError) => {
      commit('setSyncing', false)
      if (oResult && oResult['@Collection']) {
        commit('setMessagesCache', oResult['@Collection'])
        commit('setCurrentMessages')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting messages'))
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

export function setCurrentFolder ({ commit, dispatch }, payload) {
  commit('setCurrentFolder', payload)
  commit('setMessageList', null)
  commit('setCurrentMessages')
  dispatch('asyncGetMessagesInfo')
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
    dispatch('asyncGetPartFoldersRelevantInformation')
  })
}

export function setAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead')
  webApi.sendRequest('Mail', 'SetAllMessagesSeen', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, SetAction: true}, (oResult, oError) => {
    dispatch('asyncGetPartFoldersRelevantInformation')
  })
}

export function moveMessagesToFolder ({ state, commit, dispatch, getters }, payload) {
  commit('moveMessagesToFolder', payload)
  webApi.sendRequest('Mail', 'MoveMessages', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, ToFolder: payload.ToFolder, Uids: payload.Uids.join(',')}, (oResult, oError) => {
    dispatch('asyncGetPartFoldersRelevantInformation')
  })
}

export function setMessageFlagged ({ state, commit, dispatch, getters }, payload) {
  commit('setMessageFlagged', payload)
  webApi.sendRequest('Mail', 'SetMessageFlagged', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: payload.Uid, SetAction: payload.Flagged}, (oResult, oError) => {
    dispatch('asyncGetPartFoldersRelevantInformation')
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}
