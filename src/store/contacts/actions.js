import { ipcRenderer } from 'electron'
import store from 'src/store'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import cContact from '../../modules/contacts/classes/CContact'
import cContactsInfo from '../../modules/contacts/classes/CContactsInfo'
import cGroup from '../../modules/contacts/classes/CGroup'
import webApi from '../../../src-electron/main-process/webApi'

ipcRenderer.on('db-get-contacts-storages', (event, aStorages) => {
  store.commit('contacts/setStorages', aStorages)
})

ipcRenderer.on('db-get-contacts-info', (event, oResult) => {
  if (oResult) {
    let aContactsInfo = []
    let ETagsforUpdate = []
    let contactsETags = []
    let contactsUUIDs = []
    let iCTag = null

    oResult.Info.forEach(element => {
      let contactInfo = new cContactsInfo(element)
      contactsUUIDs.push(contactInfo.UUID)
      contactsETags.push(contactInfo.ETag)
      aContactsInfo.push(contactInfo)
    })

    if (oResult.CTag && typeof oResult.CTag === 'number') {
      iCTag = oResult.CTag
    }

    if (store.state.contacts.cTag && store.state.contacts.cTag !== iCTag) {
      for (let i = 0; i < store.state.contacts.contactsETags.length; i++) {
        if (store.state.contacts.contactsUUIDs[i] !== store.state.contacts.contactsInfo[i].ETag) {
          ETagsforUpdate.push()
        }
      }
    } else {
      store.commit('contacts/setContactsUUIDs', contactsUUIDs)
      store.commit('contacts/setContactsInfo', aContactsInfo)
      store.commit('contacts/setCTag', iCTag)
    }
  }
})

ipcRenderer.on('db-get-contacts', (event, aResult) => {
  if (aResult) {
    let aContacts = []

    aResult.forEach(element => {
      let contact = new cContact(element)
      aContacts.push(contact)
    })

    store.commit('contacts/setContacts', aContacts)
  } else {
    notification.showError(errors.getText({}, 'Error occurred while getting contacts'))
  }
})

export function asyncGetStorages({ state, commit, dispatch, getters }) {
  ipcRenderer.send('db-get-contacts-storages', {
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
  })
}

export function asyncGetContactsInfo({ state, commit, dispatch, getters }) {
  if (getters.getCurrentStorage) {
    ipcRenderer.send('db-get-contacts-info', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sStorage: getters.getCurrentStorage,
    })
  }
}

export function asyncGetContactsByUids({ state, commit, dispatch, getters }) {
  if (getters.getCurrentStorage) {
    ipcRenderer.send('db-get-contacts', {
      sApiHost: store.getters['main/getApiHost'],
      sAuthToken: store.getters['user/getAuthToken'],
      sStorage: getters.getCurrentStorage,
      aUids: state.contactsInfo.contactsUUIDs,
    })
  }
}

export function getContactByUUID({ state, commit, dispatch, getters }, UUID) {
  let contactByUUID = {
    UUID,
    editable: false,
    contact: {},
  }
  let contact = state.contacts.list.filter(item => {
    return item.UUID === UUID
  })[0]

  contactByUUID.contact = contact
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

export function logout ({ commit }) {
  commit('setStorages', [])
}

export function asyncGetGroups({ state, commit, dispatch, getters }) {
  webApi.sendRequest({
    sApiHost: store.getters['main/getApiHost'],
    sAuthToken: store.getters['user/getAuthToken'],
    sModule: 'Contacts',
    sMethod: 'GetGroups',
    oParameters: {},
    fCallback: (aResult, oError) => {
      if (aResult) {
        let aGroups = []
    
        aResult.forEach(element => {
          let group = new cGroup(element)
          aGroups.push(group)
        })
    
        store.commit('contacts/setGroups', aGroups)
      } else {
        notification.showError(errors.getText({}, 'Error occurred while getting contacts'))
      }
    },
  })
}

export function getCurrentGroup({ state, commit, dispatch, getters }, UUID) {
  let group = state.currentGroup.group

  commit('setCurrentGroup', group)
}

export function enableEditGroup({ state, commit, dispatch, getters }) {
  if (!state.currentGroup.editable) {
    commit('changeEditContact', true)
    console.log(state.currentGroup.editable)
  }
}

export function disableEditGroup({ state, commit, dispatch, getters }) {
  if (state.currentGroup.editable) {
    commit('changeEditContact', false)
    console.log(state.currentGroup.editable)
  }
}
