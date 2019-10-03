import { ipcRenderer } from 'electron'
import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import foldersUtils from './utils/folders.js'
import messagesUtils from './utils/messages.js'
import prefetcher from 'src/prefetcher.js'

export function asyncGetSettings ({ commit }) {
  webApi.sendRequest('Mail', 'GetSettings', {}, (oResult, oError) => {
    if (oResult && oResult.Accounts && oResult.Accounts[0]) {
      commit('setCurrentAccount', oResult.Accounts[0])
      commit('resetCurrentFolderList')
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting mail settings'))
    }
  })
}

export function asyncGetFolderList ({ state, commit, dispatch }) {
  if (state.currentAccount) {
    let iAccountId = state.currentAccount.AccountID

    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetFolders', {AccountID: iAccountId}, (oResult, oError) => {
      commit('setSyncing', false)
      if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
        let oFlatFolders = state.currentFolderList && iAccountId === state.currentFolderList.AccountId ? _.cloneDeep(state.currentFolderList.Flat) : {}
        let oFolderList = foldersUtils.prepareFolderListFromServer(iAccountId, oResult.Namespace || '', oResult.Folders, oFlatFolders)
        ipcRenderer.send('db-set-folders', oFolderList)
        commit('setCurrentFolderList', oFolderList)
        dispatch('asyncGetFoldersRelevantInformation', state.currentFolderList.Names)
        prefetcher.foldersReceived()
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting folder list'))
      }
    })
  }
}

export function asyncGetFoldersRelevantInformation ({ state, commit, dispatch }, payload) {
  if (state.currentAccount) {
    commit('setSyncing', true)
    let iAccountId = state.currentAccount.AccountID
    webApi.sendRequest('Mail', 'GetRelevantFoldersInformation', {AccountID: iAccountId, Folders: payload, UseListStatusIfPossible: true}, (oResult, oError) => {
      commit('setSyncing', false)
      if (oResult && oResult.Counts) {
        if (iAccountId === state.currentAccount.AccountID && state.currentFolderList && iAccountId === state.currentFolderList.AccountId) {
          commit('setFoldersRelevantInformation', {
            AccountId: iAccountId,
            Counts: oResult.Counts,
          })
          ipcRenderer.send('db-set-folders', state.currentFolderList)
          prefetcher.foldersRelevantInfoReceived()
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting folders relevant information'))
      }
    })
  }
}

export function asyncGetMessagesInfo ({ state, commit, getters }, payload) {
  let iAccountId = state.currentAccount.AccountID
  let sFolderFullName = payload
  let bCurrentFolder = sFolderFullName === getters.getСurrentFolderFullName
  let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, sFolderFullName)

  if (bCurrentFolder) {
    commit('setSyncing', true)
  }
  webApi.sendRequest('Mail', 'GetMessagesInfo', oParameters, (oResult, oError) => {
    if (bCurrentFolder) {
      commit('setSyncing', false)
    }
    if (oResult) {
      commit('setMessagesInfo', {
        Parameters: oParameters,
        MessagesInfo: oResult,
      })
      ipcRenderer.send('db-set-messages-info', {
        iAccountId,
        sFolderFullName,
        oMessagesInfo: oResult,
      })
      if (bCurrentFolder) {
        commit('setCurrentMessages')
      }
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
    }
  })
}

export function asyncGetMessages ({ commit, getters }, {iAccountId, sFolderFullName, aUids}) {
  let bCurrentFolder = sFolderFullName === getters.getСurrentFolderFullName
  if (bCurrentFolder) {
    commit('setSyncing', true)
  }
  let oParameters = {
    AccountID: iAccountId,
    Folder: sFolderFullName,
    Uids: aUids,
  }
  webApi.sendRequest('Mail', 'GetMessagesByUids', oParameters, (oResult, oError) => {
    if (bCurrentFolder) {
      commit('setSyncing', false)
    }
    if (oResult && oResult['@Collection']) {
      commit('updateMessagesCache', {
        AccountId: iAccountId,
        Messages: oResult['@Collection'],
      })
      if (bCurrentFolder) {
        commit('setCurrentMessages')
      }
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting messages'))
    }
  })
}

export function asyncGetMessagesBodies ({ commit }, {iAccountId, sFolderFullName, aUids}) {
  let oParameters = {
    AccountID: iAccountId,
    Folder: sFolderFullName,
    Uids: aUids,
  }
  webApi.sendRequest('Mail', 'GetMessagesBodies', oParameters, (aMessagesFromServer, oError) => {
    if (aMessagesFromServer && _.isArray(aMessagesFromServer)) {
      console.time('GetMessagesBodies parse')
      commit('updateMessages', {iAccountId, aMessagesFromServer})
      console.timeEnd('GetMessagesBodies parse')
    }
  })
}

export function asyncGetCurrentMessage ({ state, commit, getters }) {
  let iAccountId = state.currentAccount.AccountID
  webApi.sendRequest('Mail', 'GetMessage', {AccountID: iAccountId, Folder: getters.getСurrentFolderFullName, Uid: state.currentMessage.Uid}, (oResult, oError) => {
    if (oResult) {
      commit('updateMessage', {iAccountId, oMessageFromServer: oResult})
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting message'))
    }
  })
}

export function setCurrentFolder ({ state, commit, getters }, sFolderFullName) {
  commit('setCurrentFolder', sFolderFullName)
  commit('setMessagesInfo', {
    AccountId: state.currentAccount.AccountID,
    FolderFullName: sFolderFullName,
  })
  commit('setСurrentPage', 1)
  commit('setCurrentMessages')
  let oСurrentMessage = getters.getСurrentMessage
  if (oСurrentMessage && oСurrentMessage.Folder !== sFolderFullName) {
    commit('setCurrentMessage', null)
  }
}

export function setСurrentPage ({ commit }, payload) {
  commit('setСurrentPage', payload)
  commit('setCurrentMessages')
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
    dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
  })
}

export function setAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead')
  webApi.sendRequest('Mail', 'SetAllMessagesSeen', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, SetAction: true}, (oResult, oError) => {
    dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
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
    dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
  })
}

export function setMessageFlagged ({ state, commit, dispatch, getters }, payload) {
  commit('setMessageFlagged', payload)
  webApi.sendRequest('Mail', 'SetMessageFlagged', {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: payload.Uid, SetAction: payload.Flagged}, (oResult, oError) => {
    dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}
