import { ipcRenderer } from 'electron'
import store from 'src/store'
import _ from 'lodash'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi.js'

import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import foldersUtils from './utils/folders.js'
import coreSettings from 'src/modules/core/settings.js'
import mailSettings from 'src/modules/mail/settings.js'
import contactsSettings from 'src/modules/contacts/settings.js'

export function asyncGetSettings ({ state, commit, dispatch, getters }, fGetSettingsCallback) {
  ipcRenderer.once('mail-get-accounts', (event, { aAccounts, oError }) => {
    if (typesUtils.isNonEmptyArray(aAccounts)) {
      commit('setAccounts', aAccounts)
      commit('setCurrentAccount', typesUtils.isNonEmptyArray(state.accounts) ? state.accounts[0] : null)
      commit('resetCurrentFolderList')

      if (mailSettings.bAllowIdentities) {
        dispatch('asyncGetIdentities')
      }
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
        mailSettings.parse(oResult['Mail'], oResult['MailWebclient'])
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

export function asyncGetIdentities ({ state, commit, dispatch }) {
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

ipcRenderer.on('mail-get-folders', (event, oDbFolderList) => {
  if (store.state.mail.currentAccount) {
    if (oDbFolderList && oDbFolderList.Tree) {
      let bFirstTime = typesUtils.pInt(store.getters['mail/getCurrentFolderList'] && store.getters['mail/getCurrentFolderList'].AccountId) === 0
      let oFolderList = foldersUtils.prepareFolderListFromDb(oDbFolderList)
      if (!bFirstTime) {
        oFolderList.Current = oFolderList.Flat[store.state.mail.currentFolderList.Current.FullName]
      }
      store.commit('mail/setCurrentFolderList', oFolderList)
      store.dispatch('mail/asyncGetMessages', {
        sFolderFullName: oFolderList.Current.FullName,
      })
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
    notification.showError(errors.getText(oError, sError))
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

ipcRenderer.on('mail-get-messages', (oEvent, { iAccountId, sFolderFullName, sSearch, oAdvancedSearch, sFilter, iPage, aMessages, iTotalCount, sError, oError } ) => {
  if (sError || oError) {
    store.commit('mail/setMessagesSyncing', false)
    notification.showError(errors.getText(oError || null, typesUtils.pString(sError)))
  } else if (iAccountId === store.getters['mail/getCurrentAccountId']) {
    let bSameList = sFolderFullName === store.getters['mail/getCurrentFolderFullName'] &&
                    iPage === store.getters['mail/getCurrentPage'] &&
                    sSearch === store.getters['mail/getCurrentSearch'] &&
                    sFilter === store.getters['mail/getCurrentFilter']
    if (bSameList) {
      store.commit('mail/setMessagesSyncing', false)
      store.commit('mail/setCurrentMessagesTotalCount', iTotalCount)
      store.commit('mail/setCurrentMessages', aMessages)
      store.commit('mail/setCurrentAdvancedSearch', oAdvancedSearch)
    }
  }
})

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
  commit('setAllMessagesRead')
  ipcRenderer.send('mail-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    bIsSeen: true,
  })
}

ipcRenderer.on('mail-delete-messages', (event, { bResult, oError }) => {
  if (bResult) {
    store.dispatch('mail/asyncRefresh')
  } else {
    notification.showError(errors.getText(oError || null, 'Error occured while deleting of message(s).'))
  }
})

export function asyncDeleteMessages ({ state, commit, dispatch, getters }, { aUids }) {
  commit('setMessagesDeleted', {
    aUids,
    bDeleted: true,
  })
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage && _.indexOf(aUids, oCurrentMessage.Uid) !== -1) {
    commit('setCurrentMessage', null)
  }
  ipcRenderer.send('mail-delete-messages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: getters.getCurrentAccountId,
    sFolderFullName: getters.getCurrentFolderFullName,
    aUids,
  })
}

ipcRenderer.on('mail-move-messages', (event, { bResult, oError }) => {
  if (bResult) {
    store.dispatch('mail/asyncRefresh')
  } else {
    notification.showError(errors.getText(oError || null, 'Error occured while moving of message(s).'))
  }
})

export function asyncMoveMessagesToFolder ({ state, commit, dispatch, getters }, { aUids, sToFolderFullName }) {
  commit('setMessagesDeleted', {
    aUids,
    bDeleted: true,
  })
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage && _.indexOf(aUids, oCurrentMessage.Uid) !== -1) {
    commit('setCurrentMessage', null)
  }
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
  commit('setMessageFlagged', { sUid, bFlagged })
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
