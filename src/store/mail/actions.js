import { ipcRenderer } from 'electron'
import store from 'src/store'
import _ from 'lodash'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi.js'

import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import foldersUtils from './utils/folders.js'
import messagesUtils from './utils/messages.js'
import coreSettings from 'src/modules/core/settings.js'
import mailSettings from 'src/modules/mail/settings.js'
import contactsSettings from 'src/modules/contacts/settings.js'

export function asyncGetSettings ({ commit, dispatch }, fGetSettingsCallback) {
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
      if (_.isFunction(fGetSettingsCallback)) {
        fGetSettingsCallback(oError)
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

ipcRenderer.on('mail-get-messages', (oEvent, { iAccountId, sFolderFullName, sSearch, oAdvancedSearch, sFilter, iPage, aMessages, iTotalCount, sError, oError } ) => {
  if (sError || oError) {
    notification.showError(errors.getText(oError || null, typesUtils.pString(sError)))
  } else if (iAccountId === store.getters['mail/getCurrentAccountId']) {
    store.commit('mail/setCurrentFilter', sFilter)
    store.commit('mail/setCurrentSearch', { sSearch, oAdvancedSearch })
    store.commit('mail/setCurrentFolder', sFolderFullName)
    store.commit('mail/setCurrentPage', iPage)
    store.commit('mail/setCurrentMessagesTotalCount', iTotalCount)
    store.commit('mail/setCurrentMessages', aMessages)
    let oCurrentMessage = store.getters['mail/getCurrentMessage']
    if (oCurrentMessage && oCurrentMessage.Folder !== sFolderFullName) {
      store.commit('mail/setCurrentMessage', null)
    }
  }
})

ipcRenderer.on('mail-get-folders', (event, oDbFolderList) => {
  if (store.state.mail.currentAccount) {
    if (oDbFolderList && oDbFolderList.Tree) {
      let bFirstTime = typesUtils.pInt(store.getters['mail/getCurrentFolderList'] && store.getters['mail/getCurrentFolderList'].AccountId) === 0
      let oFolderList = foldersUtils.prepareFolderListFromDb(oDbFolderList)
      store.commit('mail/setCurrentFolderList', oFolderList)
      store.dispatch('mail/asyncGetMessages', {})
      if (bFirstTime) {
        store.dispatch('mail/asyncRefresh', true)
      }
    }
  }
})

export function asyncGetFolderList ({ state, commit, dispatch, getters }) {
  if (state.currentAccount) {
    ipcRenderer.send('mail-get-folders', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      iAccountId: getters.getCurrentAccountId,
    })
  }
}

ipcRenderer.on('mail-refresh', (event, oResult) => {
  store.commit('mail/setSyncing', false)
  let { bHasChanges, bHasChangesInCurrentFolder, sFolderFullName, oError, sError } = oResult
  if (oError || sError) {
    notification.showError(errors.getText(oError, sError))
  } else {
    if (bHasChangesInCurrentFolder && sFolderFullName === store.getters['mail/getCurrentFolderFullName']) {
      store.dispatch('mail/asyncGetMessages', {})
    }
    if (bHasChanges) {
      store.dispatch('mail/asyncGetFolderList', {})
    }
  }
})

export function asyncRefresh ({ state, commit, dispatch, getters }, bAllFolders) {
  commit('setSyncing', true)
  ipcRenderer.send('mail-refresh', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sCurrentFolderFullName: getters.getCurrentFolderFullName,
    aFoldersToRefresh: bAllFolders ? state.currentFolderList.Names : getters.getDisplayedFolders,
  })
}

export function asyncGetMessages ({ state, commit, getters, dispatch }, { sFolderFullName, iPage, sSearch, sFilter }) {
  ipcRenderer.send('mail-get-messages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: (typeof sFolderFullName === 'string') ? sFolderFullName : getters.getCurrentFolderFullName,
    iPage: (typeof iPage === 'number') ? iPage : getters.getCurrentPage,
    iMessagesPerPage: getters.getMessagesPerPage,
    sSearch: (typeof sSearch === 'string') ? sSearch : getters.getCurrentSearch,
    sFilter: (typeof sFilter === 'string') ? sFilter : getters.getCurrentFilter,
  })
}

export function setCurrentFolder ({ state, commit, dispatch, getters }, sFolderFullName) {
  commit('setCurrentFilter', '')
  commit('setCurrentSearch', { sSearch: '', oAdvancedSearch: null })
  commit('setCurrentFolder', sFolderFullName)
  commit('setCurrentPage', 1)
  dispatch('asyncGetMessages', {})
}

export function setCurrentPage ({ commit }, payload) {
  commit('setCurrentPage', payload)
}

export function setCurrentMessage ({ commit, dispatch }, oMessage) {
  if (!oMessage.IsSeen) { // check here because setCurrentMessage method also sets message seen
    dispatch('asyncSetMessagesRead', {
      aUids: [oMessage.Uid],
      bIsSeen: true
    })
  }
  commit('setCurrentMessage', oMessage)
}

export function asyncSetMessagesRead ({ state, commit, dispatch, getters }, { aUids, bIsSeen }) {
  commit('setMessagesRead', { aUids, bIsSeen })
  ipcRenderer.send('db-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    aUids,
    bIsSeen,
  })
}

export function asyncSetAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead')
  ipcRenderer.send('db-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    bIsSeen: true,
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
      dispatch('asyncRefresh')
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
      dispatch('asyncRefresh')
    },
  })
}

export function asyncSetMessageFlagged ({ state, commit, dispatch, getters }, { sUid, bFlagged }) {
  commit('setMessageFlagged', { sUid, bFlagged })
  ipcRenderer.send('db-set-messages-flagged', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    sUid,
    bFlagged,
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}
