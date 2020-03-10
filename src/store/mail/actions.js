import { ipcRenderer } from 'electron'
import store from 'src/store'
import _ from 'lodash'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'

import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import foldersUtils from './utils/folders.js'
import coreSettings from 'src/modules/core/settings.js'
import mailSettings from 'src/modules/mail/settings.js'
import contactsSettings from 'src/modules/contacts/settings.js'

let aOperationStarted = {}
function _refreshAfterGroupOperation (sOperationName, oParameters, bResult) {
  if (_.isEqual(aOperationStarted[sOperationName], oParameters)) {
    delete aOperationStarted[sOperationName]
    if (_.isEmpty(aOperationStarted)) {
      if (bResult) {
        store.dispatch('mail/asyncGetMessages', {})
      }
      store.dispatch('mail/asyncRefresh')
    }
  }
}

export function asyncGetSettings ({ state, commit, dispatch, getters }, fGetSettingsCallback) {
  ipcRenderer.once('mail-get-accounts', (event, { aAccounts, oError }) => {
    if (typesUtils.isNonEmptyArray(aAccounts)) {
      commit('setAccounts', aAccounts)
      commit('setCurrentAccount', typesUtils.isNonEmptyArray(state.accounts) ? state.accounts[0] : null)
      commit('resetCurrentFolderList')

      dispatch('asyncGetIdentities')
      dispatch('asyncGetAliases')
      dispatch('asyncGetServers')
      ipcRenderer.send('contacts-refresh', {
        sApiHost: store.getters['main/getApiHost'],
        sAuthToken: store.getters['user/getAuthToken'],
      })
    }
    if (_.isFunction(fGetSettingsCallback)) {
      fGetSettingsCallback(oError)
    }
  })

  ipcRenderer.once('core-get-appdata', (event, {oResult, oError}) => {
    if (oResult) {
      if (oResult['User']) {
        store.commit('user/setUserData', oResult['User'])
      }
      if (oResult['Core'] && oResult['CoreWebclient']) {
        coreSettings.parse(oResult['Core'], oResult['CoreWebclient'])
      }
      if (oResult['Mail'] && oResult['MailWebclient']) {
        mailSettings.parse(oResult['Mail'], oResult['MailWebclient'], oResult['CpanelIntegrator'])
      }
      if (oResult['Contacts']) {
        contactsSettings.parse(oResult['Contacts'])
      }
    }
  })

  ipcRenderer.send('core-get-appdata', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })
}

export function asyncGetAliases ({ state, commit, dispatch, getters }) {
  if (mailSettings.bAllowAliases && getters.getDefaultAccount) {
    ipcRenderer.once('mail-get-aliases', (event, { aAliasesData }) => {
      commit('setAliases', { oDefaultAccount: getters.getDefaultAccount, aAliasesData })
    })

    ipcRenderer.send('mail-get-aliases', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
    })
  }
}

export function asyncGetIdentities ({ state, commit, dispatch }) {
  if (mailSettings.bAllowIdentities) {
    ipcRenderer.once('mail-get-identities', (event, { aIdentitiesData }) => {
      let aIdentities = {}
      _.each(aIdentitiesData, function (oData) {
        let oIdentity = new cIdentity(oData)
        if (!_.isArray(aIdentities[oIdentity.iIdAccount])) {
          aIdentities[oIdentity.iIdAccount] = []
        }
        aIdentities[oIdentity.iIdAccount].push(oIdentity)
      })
      _.each(state.accounts, function (oAccount) {
        let aAccountIdentities = aIdentities[oAccount.iAccountId] || []
        let bHasDefault = !!_.find(aAccountIdentities, function (oIdentity) {
          return oIdentity.bDefault
        })
        aAccountIdentities.unshift(new cIdentity({
          Default: !bHasDefault,
          Email: oAccount.sEmail,
          EntityId: 0,
          FriendlyName: oAccount.sFriendlyName,
          IdAccount: oAccount.iAccountId,
          IdUser: oAccount.iIdUser,
          Signature: oAccount.sSignature,
          UUID: '',
          UseSignature: oAccount.bUseSignature,
        }))
        aIdentities[oAccount.iAccountId] = aAccountIdentities
      })
      commit('setIdentities', aIdentities)
    })

    ipcRenderer.send('mail-get-identities', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
    })
  }
}

export function asyncGetServers ({ state, commit, dispatch }) {
    ipcRenderer.once('mail-get-servers', (event, { aServersData }) => {
      commit('setServers', aServersData)
    })

    ipcRenderer.send('mail-get-servers', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
    })
}

ipcRenderer.on('mail-get-folders', (event, oDbFolderList) => {
  if (store.state.mail.currentAccount) {
    if (oDbFolderList && oDbFolderList.Tree) {
      let bFirstTime = typesUtils.pInt(store.getters['mail/getCurrentFolderList'] && store.getters['mail/getCurrentFolderList'].AccountId) === 0
      let oFolderList = foldersUtils.prepareFolderListFromDb(oDbFolderList)
      if (!bFirstTime) {
        oFolderList.Current = oFolderList.Flat[store.state.mail.currentFolderList.Current.FullName]
      }
      store.commit('mail/setCurrentFolderList', oFolderList)
      if (oFolderList.Current.HasChanges) {
        store.dispatch('mail/asyncRefresh')
      } else {
        store.dispatch('mail/asyncGetMessages', {
          sFolderFullName: oFolderList.Current.FullName,
        })
      }
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

ipcRenderer.on('mail-refresh', (event, { bHasChanges, bHasChangesInCurrentFolder, sFolderFullName, oError, sError }) => {
  store.commit('mail/setFoldersSyncing', false)
  if (oError || sError) {
    notification.showError(errors.getText(oError, sError || 'Error occured while checking mail'))
  } else {
    if (bHasChanges) {
      store.dispatch('mail/asyncGetFolderList', {})
    }
  }
})

export function asyncRefresh ({ state, commit, dispatch, getters }, bAllFolders) {
  let oCurrentAccount = getters.getCurrentAccount
  if (store.getters['user/isAuthorized'] && oCurrentAccount) {
    commit('setFoldersSyncing', true)
    ipcRenderer.send('mail-refresh', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      iAccountId: oCurrentAccount.iAccountId,
      bUseThreading: oCurrentAccount.bUseThreading,
      sCurrentFolderFullName: getters.getCurrentFolderFullName,
      aFoldersToRefresh: bAllFolders ? state.currentFolderList.Names : getters.getDisplayedFolders,
      bAllFolders,
    })
  }
}

export function asyncGetMessages ({ state, commit, getters, dispatch }, { sFolderFullName, iPage, sSearch, sFilter }) {
  let oCurrentAccount = getters.getCurrentAccount
  if (store.getters['user/isAuthorized'] && oCurrentAccount) {
    if (typeof sFolderFullName !== 'string') {
      sFolderFullName = getters.getCurrentFolderFullName
    }
    if (typeof iPage !== 'number') {
      iPage = getters.getCurrentPage
    }
    if (typeof sSearch !== 'string') {
      sSearch = getters.getCurrentSearch
    }
    if (typeof sFilter !== 'string') {
      sFilter = getters.getCurrentFilter
    }
    let bListChanged =  sFolderFullName !== getters.getCurrentFolderFullName ||
                        iPage !== getters.getCurrentPage ||
                        sSearch !== getters.getCurrentSearch ||
                        sFilter !== getters.getCurrentFilter
    if (typesUtils.isNonEmptyString(sFolderFullName)) {
      if (bListChanged) {
        commit('setMessagesSyncing', true)
        commit('setCurrentFilter', sFilter)
        commit('setCurrentSearch', sSearch)
        commit('setCurrentFolder', sFolderFullName)
        commit('setCurrentPage', iPage)
        commit('setCurrentMessagesTotalCount', 0)
        commit('setCurrentMessages', [])
        let oCurrentMessage = getters.getCurrentMessage
        if (oCurrentMessage) {
          commit('setCurrentMessage', null)
        }
      }

      let oFolder = getters.getFolderByFullName(sFolderFullName)

      ipcRenderer.removeAllListeners('mail-get-messages')
      ipcRenderer.on('mail-get-messages', (oEvent, { iAccountId, sFolderFullName, sSearch, oAdvancedSearch, sFilter, iPage, aMessages, iTotalCount, sError, oError } ) => {
        if (sError || oError) {
          commit('setMessagesSyncing', false)
          notification.showError(errors.getText(oError, sError || 'Error occured while getting messages'))
        } else if (iAccountId === getters.getCurrentAccountId) {
          let bSameList = sFolderFullName === getters.getCurrentFolderFullName &&
                          iPage === getters.getCurrentPage &&
                          sSearch === getters.getCurrentSearch &&
                          sFilter === getters.getCurrentFilter
          if (bSameList) {
            commit('setMessagesSyncing', false)
            commit('setCurrentMessagesTotalCount', iTotalCount)
            commit('setCurrentMessages', aMessages)
            commit('setCurrentAdvancedSearch', oAdvancedSearch)
          }
        }
      })
      ipcRenderer.send('mail-get-messages', {
        sApiHost: store.getters['main/getApiHost'],
        sAuthToken: store.getters['user/getAuthToken'],
        iAccountId: oCurrentAccount.iAccountId,
        bUseThreading: oCurrentAccount.bUseThreading,
        sFolderFullName,
        iFolderType: oFolder.Type,
        iPage,
        iMessagesPerPage: getters.getMessagesPerPage,
        sSearch,
        sFilter,
      })
    }
  }
}

export function setCurrentFolder ({ state, commit, dispatch, getters }, sFolderFullName) {
  dispatch('asyncGetMessages', {
    sFolderFullName,
    iPage: 1,
    sSearch: '',
    sFilter: '',
  })
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
  ipcRenderer.removeAllListeners('mail-set-messages-seen')
  ipcRenderer.on('mail-set-messages-seen', (event, { bResult, oError }) => {
    _refreshAfterGroupOperation ('mail-set-messages-seen', { aUids, bIsSeen }, bResult)
  })
  aOperationStarted['mail-set-messages-seen'] = { aUids, bIsSeen }
  commit('setMessagesRead', { aUids, bIsSeen })
  ipcRenderer.send('mail-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    aUids,
    bIsSeen,
  })
}

export function asyncSetAllMessagesRead ({ state, commit, dispatch, getters }) {
  ipcRenderer.removeAllListeners('mail-set-messages-seen')
  ipcRenderer.on('mail-set-messages-seen', (event, { bResult, oError }) => {
    _refreshAfterGroupOperation ('mail-set-messages-seen', {}, bResult)
  })
  aOperationStarted['mail-set-messages-seen'] = { }
  commit('setAllMessagesRead')
  ipcRenderer.send('mail-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    bIsSeen: true,
  })
}

export function asyncDeleteMessages ({ state, commit, dispatch, getters }, { aUids }) {
  ipcRenderer.removeAllListeners('mail-delete-messages')
  ipcRenderer.on('mail-delete-messages', (event, { bResult, oError }) => {
    if (!bResult) {
      notification.showError(errors.getText(oError, 'Error occured while deleting of message(s).'))
    }
    _refreshAfterGroupOperation ('mail-delete-messages', { aUids }, bResult)
  })
  commit('setMessagesDeleted', {
    aUids,
  })
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage && _.indexOf(aUids, oCurrentMessage.Uid) !== -1) {
    commit('setCurrentMessage', null)
  }
  aOperationStarted['mail-delete-messages'] = { aUids }
  ipcRenderer.send('mail-delete-messages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    aUids,
  })
}

export function asyncMoveMessagesToFolder ({ state, commit, dispatch, getters }, { aUids, sToFolderFullName }) {
  ipcRenderer.removeAllListeners('mail-move-messages')
  ipcRenderer.on('mail-move-messages', (event, { bResult, oError }) => {
    if (!bResult) {
      notification.showError(errors.getText(oError, 'Error occured while moving of message(s).'))
    }
    _refreshAfterGroupOperation ('mail-move-messages', { aUids, sToFolderFullName }, bResult)
  })
  commit('setMessagesDeleted', {
    aUids,
    oToFolder: getters.getFolderByFullName(sToFolderFullName),
  })
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage && _.indexOf(aUids, oCurrentMessage.Uid) !== -1) {
    commit('setCurrentMessage', null)
  }
  aOperationStarted['mail-move-messages'] = { aUids, sToFolderFullName }
  ipcRenderer.send('mail-move-messages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    sToFolderFullName,
    aUids,
  })
}

export function asyncSetMessageFlagged ({ state, commit, dispatch, getters }, { sUid, bFlagged }) {
  ipcRenderer.removeAllListeners('mail-set-messages-flagged')
  ipcRenderer.on('mail-set-messages-flagged', (event, { bResult, oError }) => {
    _refreshAfterGroupOperation ('mail-set-messages-flagged', { sUid, bFlagged }, bResult)
  })
  commit('setMessageFlagged', { sUid, bFlagged })
  aOperationStarted['mail-set-messages-flagged'] = { sUid, bFlagged }
  ipcRenderer.send('mail-set-messages-flagged', {
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
