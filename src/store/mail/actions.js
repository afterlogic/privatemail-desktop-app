import { ipcRenderer } from 'electron'
import _ from 'lodash'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import foldersUtils from './utils/folders.js'
import messagesUtils from './utils/messages.js'
import prefetcher from 'src/modules/mail/prefetcher.js'
import coreSettings from 'src/modules/core/settings.js'
import mailSettings from 'src/modules/mail/settings.js'
import contactsSettings from 'src/modules/contacts/settings.js'

export function asyncGetSettings ({ commit, dispatch }, fCallback) {
  webApi.sendRequest({
    sModule: 'Core',
    sMethod: 'GetAppData',
    oParameters: {},
    fCallback: (oResult, oError) => {
      if (oResult && oResult['Mail'] && oResult['Mail'].Accounts && oResult['Mail'].Accounts[0]) {
        commit('setCurrentAccount', oResult['Mail'].Accounts[0])
        commit('resetCurrentFolderList')
        mailSettings.parse(oResult['Mail'], oResult['MailWebclient'])
        contactsSettings.parse(oResult['Contacts'])
        coreSettings.parse(oResult['Core'], oResult['CoreWebclient'])
        if (mailSettings.bAllowIdentities) {
          dispatch('asyncGetIdentities')
        }
      }
      if (_.isFunction(fCallback)) {
        fCallback(oError)
      }
    },
  })
}

export function asyncGetIdentities ({ state, commit, dispatch }) {
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'GetIdentities',
    oParameters: {},
    fCallback: (aResult, oError) => {
      if (state.currentAccount) {
        let aIdentitiesData = _.isArray(aResult) ? aResult : []
        let aIdentities = []
        let oAccount = state.currentAccount
        let bHasDefault = false
        let iAccountId = oAccount.AccountID
        _.each(aIdentitiesData, function (oData) {
          let oIdentity = new cIdentity(oData)
          if (oIdentity.iIdAccount === iAccountId) {
            aIdentities.push(oIdentity)
            bHasDefault = bHasDefault || oIdentity.bDefault
          }
        })
        let oIdentity = new cIdentity({
          Default: !bHasDefault,
          Email: oAccount.Email,
          EntityId: 0,
          FriendlyName: oAccount.FriendlyName,
          IdAccount: oAccount.AccountID,
          IdUser: oAccount.IdUser,
          Signature: oAccount.Signature,
          UUID: '',
          UseSignature: oAccount.UseSignature,
        })
        aIdentities.unshift(oIdentity)
        commit('setCurrentIdentities', aIdentities)
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
          if (state.currentAccount && iAccountId === state.currentAccount.AccountID && state.currentFolderList && iAccountId === state.currentFolderList.AccountId) {
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
  let bCurrentFolder = sFolderFullName === getters.getCurrentFolderFullName
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
  let bCurrentFolder = sFolderFullName === getters.getCurrentFolderFullName
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
  commit('setCurrentSearch', { sSearch: '', oAdvancedSearch: null })
  commit('setCurrentFolder', sFolderFullName)
  commit('setCurrentFolderChanged')
  commit('setMessagesInfo', {
    AccountId: state.currentAccount.AccountID,
    FolderFullName: sFolderFullName,
  })
  commit('setCurrentPage', 1)
  commit('setCurrentMessages')
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage && oCurrentMessage.Folder !== sFolderFullName) {
    commit('setCurrentMessage', null)
  }
}

export function setCurrentPage ({ commit }, payload) {
  commit('setCurrentPage', payload)
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
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getCurrentFolderFullName, Uids: payload.Uids.join(','), SetAction: payload.IsSeen},
    fCallback: (oResult, oError) => {
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function setAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead', getters.getCurrentFolderFullName)
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'SetAllMessagesSeen',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getCurrentFolderFullName, SetAction: true},
    fCallback: (oResult, oError) => {
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function deleteMessages ({ state, commit, dispatch, getters }, payload) {
  commit('setMessagesDeleted', {
    Uids: payload.Uids,
    Deleted: true,
  })
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'DeleteMessages',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getCurrentFolderFullName, Uids: payload.Uids.join(',')},
    fCallback: (oResult, oError) => {
      if (oResult) {
        // remove current message from preview pane if it was deleted
        let oCurrentMessage = getters.getCurrentMessage
        if (oCurrentMessage && _.indexOf(payload.Uids, oCurrentMessage.Uid) !== -1) {
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

export function moveMessagesToFolder ({ state, commit, dispatch, getters }, payload) {
  commit('setMessagesDeleted', {
    Uids: payload.Uids,
    Deleted: true,
  })
  webApi.sendRequest({
    sModule: 'Mail',
    sMethod: 'MoveMessages',
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getCurrentFolderFullName, ToFolder: payload.ToFolder, Uids: payload.Uids.join(',')},
    fCallback: (oResult, oError) => {
      if (oResult) {
        // remove current message from preview pane if it was moved
        let oCurrentMessage = getters.getCurrentMessage
        if (oCurrentMessage && _.indexOf(payload.Uids, oCurrentMessage.Uid) !== -1) {
          commit('setCurrentMessage', null)
        }
      } else {
        // restore moved messages
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
    oParameters: {AccountID: state.currentAccount.AccountID, Folder: getters.getCurrentFolderFullName, Uids: payload.Uid, SetAction: payload.Flagged},
    fCallback: (oResult, oError) => {
      dispatch('asyncGetFoldersRelevantInformation', getters.getDisplayedFolders)
    },
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}
