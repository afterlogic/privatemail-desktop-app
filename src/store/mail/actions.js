import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import messagesUtils from './utils/messages.js'
import prefetcher from 'src/prefetcher.js'

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
      commit('setSyncing', false)
      if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
        commit('parseFolderList', {
          FolderListFromServer: oResult.Folders,
          AccountId: foldersAccountId
        })
        commit('setCurrentFolderList')
        if (!state.currentFolder) {
          dispatch('setCurrentFolder', getters.getInboxFullName)
        }
        dispatch('asyncGetAllFoldersRelevantInformation')
      } else {
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
      commit('setSyncing', false)
      if (oResult && oResult.Counts) {
        commit('setFoldersRelevantInformation', oResult.Counts)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting folders relevant information'))
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
  commit('setMessagesInfo', {
    AccountId: state.currentAccount.AccountID,
    FolderFullName: payload,
  })
  commit('setCurrentMessages')
  prefetcher.start()
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
