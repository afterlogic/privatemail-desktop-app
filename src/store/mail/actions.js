import { ipcRenderer } from 'electron'
import store from 'src/store'
import moment from 'moment'
import _ from 'lodash'
import { machineIdSync } from 'node-machine-id'

import deviceUtils from 'src/utils/device.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi.js'

import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import foldersUtils from './utils/folders.js'
import coreSettings from 'src/modules/core/settings.js'
import mailSettings from 'src/modules/mail/settings.js'
import contactsSettings from 'src/modules/contacts/settings.js'
import openpgpSettings from 'src/modules/openpgp/settings.js'
import encryptionSettings from 'src/modules/core-Paranoid-encryption/settings'

let oAllStartedOperations = {}

function _addStartedGroupOperation (sOperationName, oParameters) {
  if (!_.isArray(oAllStartedOperations[sOperationName])) {
    oAllStartedOperations[sOperationName] = []
  }
  oAllStartedOperations[sOperationName].push({ oParameters, oTime: moment() })
}

function _removeStartedGroupOperation (sOperationName, oParameters, bResult) {
  if (!_.isArray(oAllStartedOperations[sOperationName])) {
    oAllStartedOperations[sOperationName] = []
  }
  oAllStartedOperations[sOperationName] = _.filter(oAllStartedOperations[sOperationName], function (oOperationData) {
    let iDiff = moment().diff(oOperationData.oTime, 'seconds')
    return !_.isEqual(oOperationData.oParameters, oParameters) && iDiff < 60
  })
  if (_.isEmpty(oAllStartedOperations[sOperationName])) {
    delete oAllStartedOperations[sOperationName]
  }
  const isUnseenFilter = store.getters['mail/getCurrentFilter'] === 'unseen'

  if (!isUnseenFilter) {
    if (_.isEmpty(oAllStartedOperations)) {
      if (bResult) {
        store.dispatch('mail/asyncGetMessages', {})
      }
      store.dispatch('mail/asyncRefresh')
    }
  }
}

function _hasStartedGroupOperation (iAccountId, sFolderFullName) {
  return !!_.find(oAllStartedOperations, (aStartedOperations) => {
    return !!_.find(aStartedOperations, (oOperationData) => {
      let iDiff = moment().diff(oOperationData.oTime, 'seconds')
      return oOperationData.oParameters.iAccountId === iAccountId && oOperationData.oParameters.sFolderFullName === sFolderFullName && iDiff < 60
    })
  })
}

export function asyncGetSettings ({ state, commit, dispatch, getters }, fGetSettingsCallback) {
  ipcRenderer.once('mail-get-accounts', (event, { aAccounts, oError }) => {
    if (typesUtils.isNonEmptyArray(aAccounts)) {
      commit('setAccounts', aAccounts)
      commit('setCurrentAccount', typesUtils.isNonEmptyArray(state.accounts) ? state.accounts[0] : null)
      commit('resetCurrentFolderList')
      dispatch('asyncGetQuota')
      dispatch('asyncGetIdentities')
      dispatch('asyncGetAliases')
      dispatch('asyncGetServers')
      ipcRenderer.send('contacts-refresh', {
        sApiHost: store.getters['main/getApiHost'],
        sAuthToken: store.getters['user/getAuthToken'],
      })
      webApi.sendRequest({
        sModule: 'TwoFactorAuth',
        sMethod: 'SaveDevice',
        oParameters: {
          DeviceId: machineIdSync(true),
          DeviceName: deviceUtils.getName(),
        },
      })
    }
    if (_.isFunction(fGetSettingsCallback)) {
      fGetSettingsCallback(oError)
    }
  })

  ipcRenderer.once('core-get-appdata', (event, {oResult, oError}) => {
    if (oResult) {
      console.log(oResult, 'oResult')
      if (oResult['User']) {
        store.commit('user/setUserData', oResult['User'])
      }
      if (oResult['Core'] && oResult['CoreWebclient']) {
        coreSettings.parse(oResult['Core'], oResult['CoreWebclient'])
      }
      if (oResult['Mail'] && oResult['MailWebclient']) {
        mailSettings.parse(oResult['Mail'], oResult['MailWebclient'], oResult['CpanelIntegrator'], oResult['MailScheduledMessages'])
      }
      if (oResult['Contacts']) {
        contactsSettings.parse(oResult['Contacts'])
        store.dispatch('contacts/asyncGetContactsOpenPgpExternalKeys')
      }
      if (oResult['OpenPgpWebclient']) {
        openpgpSettings.parse(oResult['OpenPgpWebclient'])
      }
      if (oResult['CoreParanoidEncryptionWebclientPlugin']) {
        encryptionSettings.parse(oResult['CoreParanoidEncryptionWebclientPlugin'])
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

ipcRenderer.on('mail-get-folders', (event, oDbFolderList, bEditAccount = false) => {
  if (store.state.mail.currentAccount) {
    if (oDbFolderList && oDbFolderList.Tree) {
      let bFirstTime = typesUtils.pInt(store.getters['mail/getCurrentFolderList'] && store.getters['mail/getCurrentFolderList'].AccountId) === 0
      let oFolderList = foldersUtils.prepareFolderListFromDb(oDbFolderList)
      if (!bFirstTime) {
        oFolderList.Current = oFolderList.Flat[store.state.mail.currentFolderList.Current.FullName]
      }
      if (!bEditAccount) {
        store.commit('mail/setCurrentFolderList', oFolderList)
      } else {
        store.commit('mail/setEditFolderList', oDbFolderList)
      }
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

export function asyncGetFolderList ({ state, commit, dispatch, getters }, parameters = {bEditAccount: false, iEditAccountId: ''}  ) {
  if (state.currentAccount) {
    ipcRenderer.send('mail-get-folders', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      iAccountId: !parameters.bEditAccount ? getters.getCurrentAccountId: parameters.iEditAccountId,
      bEditAccount: parameters.bEditAccount
    })
  }
}

ipcRenderer.on('mail-new-unseen-messages', (event, { iAccountId, sFolderFullName, aNewUnseenMessages }) => {
  if (_.isObject(Notification) && coreSettings.bAllowDesktopNotifications) {
    let oCurrentAccount = store.getters['mail/getCurrentAccount']
    let iCurrentAccountId = oCurrentAccount ? oCurrentAccount.iAccountId : 0
    if (typesUtils.isNonEmptyArray(aNewUnseenMessages) && iCurrentAccountId === iAccountId && store.getters['mail/getInboxFullName'] === sFolderFullName) {
      let sTitle = 'You have %COUNT% new message(s)'
      sTitle = sTitle.replace(/%COUNT%/g, aNewUnseenMessages.length)
      let sBody = ''
      if (aNewUnseenMessages.length === 1) {
        sBody = 'Subject: ' + aNewUnseenMessages[0].Subject
        sBody += '\r\nFrom: ' + aNewUnseenMessages[0].From.split('\n').join(', ')
      }
      let oNotification = new Notification(sTitle, {
        body: sBody
      })
      oNotification.onclick = () => {
        store.dispatch('mail/setCurrentFolder', sFolderFullName)
        store.dispatch('mail/setCurrentMessage', aNewUnseenMessages[0])
        ipcRenderer.send('app-move-on-top')
      }
    }
  }
})

ipcRenderer.on('mail-refresh', (event, { bHasChanges, bHasChangesInCurrentFolder, sFolderFullName, oError, sError }) => {
  store.commit('mail/setFoldersSyncing', false)
  if (oError || sError) {
    notification.showError(errors.getText(oError, sError || 'Error occurred while checking mail'))
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

ipcRenderer.on('mail-get-messages', (oEvent, { iAccountId, sFolderFullName, sSearch, oAdvancedSearch, sFilter, iPage, aMessages, iTotalCount, sError, oError, bStarredType = false } ) => {
  if (!_hasStartedGroupOperation(iAccountId, sFolderFullName)) {
    if (sError || oError) {
      store.commit('mail/setMessagesSyncing', false)
      notification.showError(errors.getText(oError, sError || 'Error occurred while getting messages'))
    } else if (iAccountId === store.getters['mail/getCurrentAccountId']) {
      let bSameList = sFolderFullName === store.getters['mail/getCurrentFolderFullName'] &&
                      iPage === store.getters['mail/getCurrentPage'] &&
                      sSearch === store.getters['mail/getCurrentSearch'] &&
                      sFilter === store.getters['mail/getCurrentFilter']
      if (bSameList) {
        store.commit('mail/setMessagesSyncing', false)
        store.commit('mail/setCurrentMessagesTotalCount', iTotalCount)
        if (!bStarredType) {
          store.commit('mail/setCurrentMessages', aMessages)
        } else {
          store.commit('mail/setStarredMessages', aMessages)
        }
        store.commit('mail/setCurrentAdvancedSearch', oAdvancedSearch)
        let oCurrentMessage = store.getters['mail/getCurrentMessage']
        if (oCurrentMessage) {
          let bListHasCurrentMessage = !!_.find(aMessages, function (oMessage) {
            return oMessage.Uid === oCurrentMessage.Uid || !!_.find(oMessage.Threads, function (oThreadMessage) {
              return oThreadMessage.Uid === oCurrentMessage.Uid
            })
          })
          if (!bListHasCurrentMessage) {
            store.commit('mail/setCurrentMessage', null)
          }
        }
      } else {
        if (bStarredType) {
          store.commit('mail/setStarredMessages', aMessages)
        }
      }
    }
  if (!bStarredType) {
    let folderName = store.getters['mail/getCurrentFoldersTree'][0].FullName
    store.dispatch('mail/asyncGetStarredMessages', {
      sFolderFullName: folderName,
      iPage: 1,
      sSearch: '',
      sFilter: 'flagged',
      bStarredType: true
    })
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
      if (oFolder) {
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
}

export function asyncGetStarredMessages ({ state, commit, getters, dispatch }, { sFolderFullName, iPage, sSearch, sFilter }) {
  let oCurrentAccount = getters.getCurrentAccount

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
        bStarredType: true
      })
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

ipcRenderer.on('mail-set-messages-seen', (event, { bResult, iAccountId, sFolderFullName, aUids, bIsSeen, oError }) => {
  _removeStartedGroupOperation('mail-set-messages-seen', { iAccountId, sFolderFullName, aUids, bIsSeen }, bResult)
})

export function asyncSetMessagesRead ({ state, commit, dispatch, getters }, { aUids, bIsSeen }) {
  commit('setMessagesRead', { aUids, bIsSeen })

  let iAccountId = getters.getCurrentAccountId
  let sFolderFullName = getters.getCurrentFolderFullName
  _addStartedGroupOperation('mail-set-messages-seen', { iAccountId, sFolderFullName, aUids, bIsSeen })

  ipcRenderer.send('mail-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
    aUids,
    bIsSeen,
  })
}

export function asyncSetAllMessagesRead ({ state, commit, dispatch, getters }) {
  commit('setAllMessagesRead')

  let iAccountId = getters.getCurrentAccountId
  let sFolderFullName = getters.getCurrentFolderFullName
  let bIsSeen = true
  _addStartedGroupOperation('mail-set-messages-seen', { iAccountId, sFolderFullName, aUids: undefined, bIsSeen })

  ipcRenderer.send('mail-set-messages-seen', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
    bIsSeen,
  })
}

ipcRenderer.on('mail-delete-messages', (event, { bResult, iAccountId, sFolderFullName, aUids, oError }) => {
  if (!bResult) {
    notification.showError(errors.getText(oError, 'Error occurred while deleting of message(s).'))
  }
  _removeStartedGroupOperation('mail-delete-messages', { iAccountId, sFolderFullName, aUids }, bResult)
})

export function asyncDeleteMessages ({ state, commit, dispatch, getters }, { iAccountId, sFolderFullName, aUids }) {
  iAccountId = iAccountId || getters.getCurrentAccountId
  sFolderFullName = sFolderFullName || getters.getCurrentFolderFullName

  if (iAccountId === getters.getCurrentAccountId && iAccountId === getters.getCurrentAccountId) {
    commit('setMessagesDeleted', {
      aUids,
    })

    let oCurrentMessage = getters.getCurrentMessage
    if (oCurrentMessage && _.indexOf(aUids, oCurrentMessage.Uid) !== -1) {
      commit('setCurrentMessage', null)
    }
  }

  _addStartedGroupOperation('mail-delete-messages', { iAccountId, sFolderFullName, aUids })

  ipcRenderer.send('mail-delete-messages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
    aUids,
  })
}

ipcRenderer.on('mail-empty-folder', (event, { bResult, iAccountId, sFolderFullName, oError }) => {
  if (!bResult) {
    notification.showError(errors.getText(oError, 'Error occurred while emptying of folder.'))
  }
  _removeStartedGroupOperation('mail-empty-folder', { iAccountId, sFolderFullName }, bResult)
})

export function asyncClearCurrentFolder ({ state, commit, dispatch, getters }) {
  commit('setCurrentFolderEmpty')
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage) {
    commit('setCurrentMessage', null)
  }

  let iAccountId = getters.getCurrentAccountId
  let sFolderFullName = getters.getCurrentFolderFullName
  _addStartedGroupOperation('mail-empty-folder', { iAccountId, sFolderFullName })

  ipcRenderer.send('mail-empty-folder', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
  })
}

ipcRenderer.on('mail-move-messages', (event, { bResult, iAccountId, sFolderFullName, sToFolderFullName, aUids, oError }) => {
  if (!bResult) {
    notification.showError(errors.getText(oError, 'Error occurred while moving of message(s).'))
  }
  _removeStartedGroupOperation('mail-move-messages', { iAccountId, sFolderFullName, sToFolderFullName, aUids }, bResult)
})

export function asyncMoveMessagesToFolder ({ state, commit, dispatch, getters }, { aUids, sToFolderFullName }) {
  commit('setMessagesDeleted', {
    aUids,
    oToFolder: getters.getFolderByFullName(sToFolderFullName),
  })
  let oCurrentMessage = getters.getCurrentMessage
  if (oCurrentMessage && _.indexOf(aUids, oCurrentMessage.Uid) !== -1) {
    commit('setCurrentMessage', null)
  }

  let iAccountId = getters.getCurrentAccountId
  let sFolderFullName = getters.getCurrentFolderFullName
  _addStartedGroupOperation('mail-move-messages', { iAccountId, sFolderFullName, sToFolderFullName, aUids })

  ipcRenderer.send('mail-move-messages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
    sToFolderFullName,
    aUids,
  })
}

ipcRenderer.on('mail-set-messages-flagged', (event, { bResult, iAccountId, sFolderFullName, sUid, bFlagged, oError }) => {
  _removeStartedGroupOperation('mail-set-messages-flagged', { iAccountId, sFolderFullName, sUid, bFlagged }, bResult)
})

export function asyncSetMessageFlagged ({ state, commit, dispatch, getters }, { sUid, bFlagged }) {
  commit('setMessageFlagged', { sUid, bFlagged })

  let iAccountId = getters.getCurrentAccountId
  let sFolderFullName = getters.getCurrentFolderFullName
  _addStartedGroupOperation('mail-set-messages-flagged', { iAccountId, sFolderFullName, sUid, bFlagged })

  ipcRenderer.send('mail-set-messages-flagged', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
    sUid,
    bFlagged,
  })
}

export function logout ({ commit }) {
  commit('setCurrentAccount', null)
  commit('resetCurrentFolderList')
}

export function  saveNote({ state, commit, dispatch, getters }, { messageUid, sFolderFullName, sText, sSubject, callback }) {
  let iAccountId = getters.getCurrentAccountId
  ipcRenderer.send('mail-save-note', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId,
    sFolderFullName,
    messageUid,
    sText,
    sSubject,
  })

  ipcRenderer.once('mail-save-note', (event, { bResult }) => {
    if (bResult) {
      store.dispatch('mail/asyncRefresh', true)
      callback(bResult)
    }
  })

}

export function saveCurrentFolderTree ({ state, commit, dispatch, getters }, {folderName, sProperty, value , isEditAccount}) {
  commit('changeFolderTree', {folderName, sProperty, value, isEditAccount})
}

export function removeCurrentFolderTree ({ state, commit, dispatch, getters }, {folderName, bHideFolder, isEditAccount }) {
  commit('removeFolderTree', {folderName, bHideFolder, isEditAccount})
}

export function asyncGetQuota ({ state, commit, dispatch, getters }) {
  let iAccountId = store.getters['mail/getCurrentAccountId']
  ipcRenderer.send('mail-get-quota', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    iAccountId: iAccountId
  })

  ipcRenderer.once('mail-get-quota', (event, { oResult, iAccountId, oError }) => {
    dispatch('setAccountQuota',{iAccountId: iAccountId, aQuota: oResult})
  })
}

export function setAccountQuota({state}, {iAccountId, aQuota}) {
  store.commit('mail/setAccountQuota',{iAccountId, aQuota})
}
