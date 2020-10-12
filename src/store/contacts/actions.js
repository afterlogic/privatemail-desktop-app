import { ipcRenderer } from 'electron'
import store from 'src/store'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

import CContact from '../../modules/contacts/classes/CContact'
import CGroup from '../../modules/contacts/classes/CGroup'

let aRequestedEmails = []

ipcRenderer.on('contacts-get-contacts-by-emails', (oEvent, { aEmails, aContacts, bNoInformation, oError }) => {
  if (aContacts) {
    _.each(aContacts, function (oContactData) {
      let oContact = new CContact(oContactData)
      if (oContact) {
        store.commit('contacts/addContactByEmail', { sEmail: oContact.ViewEmail, mContact: oContact })
      }
    })
  }

  if (!bNoInformation) {
    _.each(aEmails, function (sEmail) {
      if (!store.state.contacts.contactsByEmail[sEmail]) {
        store.commit('contacts/addContactByEmail', { sEmail, mContact: false })
      }
    })
  }

  aRequestedEmails = _.difference(aRequestedEmails, aEmails)
})

export function asyncGetContactsByEmails({ state, commit, dispatch, getters }, aEmails) {
  if (_.isEmpty(state.contactsByEmail)) {
    aRequestedEmails = []
  }

  let aEmailsForRequest = []
  _.each(aEmails, (sEmail) => {
    let oContact = state.contactsByEmail[sEmail]
    if (oContact === undefined && _.indexOf(aRequestedEmails, sEmail) === -1) {
      aEmailsForRequest.push(sEmail)
    }
  })

  if (aEmailsForRequest.length > 0) {
    aRequestedEmails = _.union(aRequestedEmails, aEmailsForRequest)
    ipcRenderer.send('contacts-get-contacts-by-emails', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      aEmails: aEmailsForRequest,
    })
  }
}

ipcRenderer.on('contacts-get-external-keys', async (oEvent, { aKeysData, oError }) => {
  if (!_.isArray(aKeysData)) {
    notification.showError(errors.getText(oError, 'Error occurred while getting external keys'))
  } else {
    let aOpenPgpExternalKeys = []
    for (const oKeyData of aKeysData) {
      let aKeys = await OpenPgp.getArmorInfo(oKeyData.PublicPgpKey)
      if (typesUtils.isNonEmptyArray(aKeys)) {
        let aKeyUsersIds = aKeys[0].getUserIds()
        let sKeyEmail = aKeyUsersIds.length > 0 ? aKeyUsersIds[0] : '0'
        aOpenPgpExternalKeys.push({
          bPublic: true,
          bExternal: true,
          sArmor: oKeyData.PublicPgpKey,
          sEmail: oKeyData.Email,
          sFullEmail: sKeyEmail,
          sId: 'key-' + Math.round(Math.random() * 1000000),
        })
      }
    }
    store.commit('contacts/setOpenPgpExternalKeys', { aOpenPgpExternalKeys })
  }
})

export function asyncGetContactsOpenPgpExternalKeys() {
  ipcRenderer.send('contacts-get-external-keys', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })
}

ipcRenderer.on('contacts-get-storages', (event, { aStorages, oError }) => {
  if (_.isArray(aStorages)) {
    store.commit('contacts/setStorages', aStorages)
  } else {
    notification.showError(errors.getText(oError, 'Error occurred while getting storages'))
  }
})

ipcRenderer.on('contacts-get-groups', (event, { aGroups, oError }) => {
  if (_.isArray(aGroups)) {
    store.commit('contacts/setGroups', _.map(aGroups, function (oGroupData) {
      return new CGroup(oGroupData)
    }))
  } else {
    notification.showError(errors.getText(oError, 'Error occurred while getting groups'))
  }
})

function _getContactsParams () {
  let oGroup = store.getters['contacts/getCurrentGroup']
  let sGroupUUID = oGroup && oGroup.group ? oGroup.group.UUID : ''
  let sStorage = store.getters['contacts/getCurrentStorage']
  if (sGroupUUID !== '') {
    sStorage = 'all'
  }
  return {
    sStorage,
    sGroupUUID,
    iPerPage: store.getters['contacts/getContactsPerPage'],
    iPage: store.getters['contacts/getCurrentPage'],
    sSearch: store.getters['contacts/getSearchText'],
  }
}

ipcRenderer.on('contacts-get-contacts', (event, { aContacts, iCount, oRequestParams, oError }) => {
  let oParams = _getContactsParams()
  if (_.isEqual(oParams, oRequestParams)) {
    if (_.isArray(aContacts)) {
      store.commit('contacts/setContacts', _.map(aContacts, function (oContactData) {
        return new CContact(oContactData)
      }))
      store.dispatch('contacts/setCurrentContactByUUID', store.getters['contacts/getCurrentContactUUID'])
      store.commit('contacts/setContactsCount', iCount)
      store.commit('contacts/setHasChanges', false)
      store.commit('contacts/setLoading', false)
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting contacts'))
    }
  }
})

export function asyncGetStorages({ state, commit, dispatch, getters }) {
  ipcRenderer.send('contacts-get-storages', {})
}

export function asyncGetGroups({ state, commit, dispatch, getters }) {
  ipcRenderer.send('contacts-get-groups', {})
}

export function asyncGetContacts({ state, commit, dispatch, getters }) {
  if (getters.getCurrentStorage) {
    store.commit('contacts/setLoading', true)
    let { sStorage, sGroupUUID, iPerPage, iPage, sSearch } = _getContactsParams()
    ipcRenderer.send('contacts-get-contacts', { sStorage, sGroupUUID, iPerPage, iPage, sSearch })
  }
}

export function setCurrentContactByUUID({ state, commit, dispatch, getters }, sUUID) {
  let bEditable = false
  if (state.contactByUUID.UUID === sUUID) {
    bEditable = state.contactByUUID.editable
  }
  let contactByUUID = {
    UUID: sUUID,
    editable: bEditable,
    contact: _.find(state.contacts.list, { 'UUID': sUUID }) || {},
  }
  commit('setContactByUUID', contactByUUID)
}

export function openEditContact({ state, commit, dispatch, getters }) {
  if (!state.contactByUUID.editable) {
    commit('changeEditContact', true)
  }
}

export function closeEditContact({ state, commit, dispatch, getters }) {
  if (state.contactByUUID.editable) {
    commit('changeEditContact', false)
  }
}

export function logout ({ commit, dispatch }) {
  commit('setStorages', [])
  commit('setGroups', [])
  commit('setCurrentGroup', null)
  commit('setContactsCount', 0)
  commit('setContacts', [])
  commit('setContactsPerPage', 20)
  commit('setSearchText', '')
  dispatch('setCurrentContactByUUID', null)
  commit('setNewContactToEdit', null)
  commit('clearContactsByEmail')
}

export function openEditGroup({ state, commit, dispatch, getters }) {
  if (!state.currentGroup.editable) {
    commit('changeEditGroup', true)
  }
}

export function closeEditGroup({ state, commit, dispatch, getters }) {
  if (state.currentGroup.editable) {
    commit('changeEditGroup', false)
  }
}
