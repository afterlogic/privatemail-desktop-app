import { ipcRenderer } from 'electron'
import store from 'src/store'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

import webApi from '../../../src-electron/main-process/webApi'

import CContact from '../../modules/contacts/classes/CContact'
import CGroup from '../../modules/contacts/classes/CGroup'

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

ipcRenderer.on('contacts-get-contacts', (event, { aContacts, oError }) => {
  if (_.isArray(aContacts)) {
    store.commit('contacts/setContacts', _.map(aContacts, function (oContactData) {
      return new CContact(oContactData)
    }))
    store.commit('contacts/setHasChanges', false)
    store.commit('contacts/setSyncing', false)
  } else {
    notification.showError(errors.getText(oError, 'Error occurred while getting contacts'))
  }
})

export function asyncGetStorages({ state, commit, dispatch, getters }) {
  ipcRenderer.send('contacts-get-storages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })
}

export function asyncGetGroups({ state, commit, dispatch, getters }) {
  ipcRenderer.send('contacts-get-groups', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })
}

export function asyncGetContacts({ state, commit, dispatch, getters }, { iPage, iPerPage }) {
  if (getters.getCurrentStorage) {
    store.commit('contacts/setSyncing', true)
    let oGroup = getters.getCurrentGroup
    let sGroupUUID = oGroup && oGroup.group ? oGroup.group.UUID : ''
    let sStorage = getters.getCurrentStorage
    if (sGroupUUID !== '') {
      sStorage = 'all'
    }
    ipcRenderer.send('contacts-get-contacts', {
      sStorage,
      sGroupUUID,
      iPerPage,
      iPage,
    })
  }
}

export function getContactByUUID({ state, commit, dispatch, getters }, UUID) {
  let contactByUUID = {
    UUID,
    editable: false,
    contact: _.find(state.contacts.list, { 'UUID': UUID }) || {},
  }

  commit('setContactByUUID', contactByUUID)
}

export function enableEditContact({ state, commit, dispatch, getters }) {
  if (!state.contactByUUID.editable) {
    commit('changeEditContact', true)
    console.log(state.contactByUUID.editable)
  }
}

export function disableEditContact({ state, commit, dispatch, getters }) {
  if (state.contactByUUID.editable) {
    commit('changeEditContact', false)
    console.log(state.contactByUUID.editable)
  }
}

export function saveChangesCurrentContact({ state, commit, dispatch, getters }, savedContact) {
  let index = null
  // console.log( state.contacts.list)
  state.contacts.list.forEach( (item, i) => {
    if (item.UUID === savedContact.UUID) index = i
  })
  commit('saveChangesCurrentContact', savedContact, index)
}

export function logout ({ commit, dispatch }) {
  commit('setStorages', [])
  commit('setGroups', [])
  commit('setCurrentGroup', null)
  dispatch('getContactByUUID', null)
}

export function enableEditGroup({ state, commit, dispatch, getters }) {
  console.log('123',state.currentGroup.editable)
  if (!state.currentGroup.editable) {
    commit('changeEditGroup', true)
    console.log(state.currentGroup.editable)
  }
}

export function disableEditGroup({ state, commit, dispatch, getters }) {
  if (state.currentGroup.editable) {
    commit('changeEditGroup', false)
    console.log(state.currentGroup.editable)
  }
}
