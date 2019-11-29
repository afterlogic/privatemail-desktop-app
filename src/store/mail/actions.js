import { ipcRenderer } from 'electron'
import _ from 'lodash'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

import foldersUtils from './utils/folders.js'
import messagesUtils from './utils/messages.js'
import prefetcher from 'src/modules/mail/prefetcher.js'
import settings from 'src/modules/mail/objects/settings.js'

export function asyncGetSettings ({ commit }) {
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'GetSettings',
    oParameters: {},
    fCallback: (oResult, oError) => {
      if (oResult && oResult.Accounts && oResult.Accounts[0]) {
        commit('setCurrentAccount', oResult.Accounts[0])
        commit('resetCurrentFolderList')
        settings.parse(oResult)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting mail settings'))
      }
    },
  })
}

export function asyncGetFolderList ({ state, commit, dispatch }) {
  if (state.currentAccount) {
    let iAccountId = state.currentAccount.AccountID

    commit('setSyncing', true)
    webApi.sendRequest({
      sModule: 'Mail',
      sMethod: 'GetFolders',
      oParameters: {AccountID: iAccountId},
      fCallback: (oResult, oError) => {
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
      },
    })
  }
}

export function asyncGetFoldersRelevantInformation ({ state, commit, dispatch }, payload) {
  if (state.currentAccount) {
    commit('setSyncing', true)
    let iAccountId = state.currentAccount.AccountID
    webApi.sendRequest({
      sModule: 'Mail',
      sMethod: 'GetRelevantFoldersInformation',
      oParameters: {AccountID: iAccountId, Folders: payload, UseListStatusIfPossible: true},
      fCallback: (oResult, oError) => {
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
      },
    })
  }
}

export function asyncGetMessagesInfo ({ state, commit, getters }, payload) {
  let iAccountId = state.currentAccount.AccountID
  let sFolderFullName = payload
  let bCurrentFolder = sFolderFullName === getters.getСurrentFolderFullName
  let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, sFolderFullName, getters.getCurrentSearch, getters.getCurrentFilter)

  if (bCurrentFolder) {
    commit('setSyncing', true)
  }
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'GetMessagesInfo',
    oParameters,
    fCallback: (aMessagesInfo, oError) => {
      if (bCurrentFolder) {
        commit('setSyncing', false)
      }
      if (_.isArray(aMessagesInfo)) {
        commit('setMessagesInfo', {
          Parameters: oParameters,
          MessagesInfo: aMessagesInfo,
        })
        ipcRenderer.send('db-set-messagesinfo', {
          iAccountId,
          sFolderFullName,
          oMessagesInfo: aMessagesInfo,
        })
        if (bCurrentFolder && state.currentFilter === '' && state.currentSearch === '') {
          commit('setCurrentMessages')
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
      }
    },
  })
}

export function asyncGetMessages ({ state, commit, getters, dispatch }, {iAccountId, sFolderFullName, aUids}) {
  let bCurrentFolder = sFolderFullName === getters.getСurrentFolderFullName
  if (bCurrentFolder) {
    commit('setSyncing', true)
  }
  let oParameters = {
    AccountID: iAccountId,
    Folder: sFolderFullName,
    Uids: aUids,
  }
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'GetMessagesBodies',
    oParameters,
    fCallback: (aMessagesFromServer, oError) => {
      if (bCurrentFolder) {
        commit('setSyncing', false)
      }
      if (aMessagesFromServer && _.isArray(aMessagesFromServer)) {
        console.time('GetMessagesBodies parse')
        commit('updateMessagesCache', {
          AccountId: iAccountId,
          Messages: aMessagesFromServer,
        })
        console.timeEnd('GetMessagesBodies parse')
        if (bCurrentFolder) {
          commit('setCurrentMessages')
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting messages'))
      }
    },
  })
}

export function setCurrentFolder ({ state, commit, getters }, sFolderFullName) {
  commit('setCurrentFilter', '')
  commit('setCurrentSearch', '')
  commit('setCurrentFolder', sFolderFullName)
  commit('setCurrentFolderChanged')
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

export function setCurrentMessage ({ commit, dispatch }, oMessage) {
  if (!oMessage.IsSeen) { // check here because setCurrentMessage method also sets message seen
    dispatch('setMessagesRead', {
      Uids: [oMessage.Uid],
      IsSeen: true
    })
  }
  commit('setCurrentMessage', oMessage)
}

export function setMessagesRead ({ state, commit, dispatch, getters }, payload) {
  commit('setMessagesRead', payload)
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'SetMessagesSeen',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: payload.Uids.join(','), SetAction: payload.IsSeen},
    fCallback: (oResult, oError) => {
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function setAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead', getters.getСurrentFolderFullName)
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'SetAllMessagesSeen',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, SetAction: true},
    fCallback: (oResult, oError) => {
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function moveMessagesToFolder ({ state, commit, dispatch, getters }, payload) {
  commit('setMessagesDeleted', {
    Uids: payload.Uids,
    Deleted: true,
  })
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'MoveMessages',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, ToFolder: payload.ToFolder, Uids: payload.Uids.join(',')},
    fCallback: (oResult, oError) => {
      if (oResult) {
        // remove current message from preview pane if it was deleted
        let oСurrentMessage = getters.getСurrentMessage
        if (oСurrentMessage && _.indexOf(payload.Uids, oСurrentMessage.Uid) !== -1) {
          commit('setCurrentMessage', null)
        }
      } else {
        // restore deleted messages
        commit('setMessagesDeleted', {
          Uids: payload.Uids,
          Deleted: false,
        })
      }
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function setMessageFlagged ({ state, commit, dispatch, getters }, payload) {
  commit('setMessageFlagged', payload)
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'SetMessageFlagged',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getСurrentFolderFullName, Uids: payload.Uid, SetAction: payload.Flagged},
    fCallback: (oResult, oError) => {
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}
