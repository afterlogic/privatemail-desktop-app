import Vue from 'vue'
import CStorages from '../../modules/contacts/classes/CStorages'

export function setStorages(state, aStorages) {
  if (!(state.storages instanceof CStorages)) {
    state.storages = new CStorages()
  }
  state.storages.parse(aStorages)
}

export function setCurrentStorage(state, sStorage) {
  if (state.storages instanceof CStorages) {
    state.storages.setCurrentStorage(sStorage)
  }
}

export function setHasChanges(state, bHasChanges) {
  state.hasChanges = bHasChanges
  if (bHasChanges) {
    state.contactsByEmail = {}
  }
}

export function setSyncing(state, bSyncing) {
  state.syncing = bSyncing
}

export function setLoading(state, bLoading) {
  state.loading = bLoading
}

export function setContacts(state, aContacts) {
  state.contacts.list = aContacts
}

export function setContactsCount(state, iCount) {
  state.contacts.count = iCount
}

export function setCurrentPage(state, iPage) {
  state.currentPage = iPage
}

export function setContactsPerPage(state, iPerPage) {
  state.contactsPerPage = iPerPage
}

export function setSearchText(state, sSearchText) {
  state.searchText = sSearchText
}

export function setContactByUUID(state, contactByUUID) {
  state.contactByUUID = contactByUUID
}

export function changeEditContact(state, editable) {
  state.contactByUUID.editable = editable
}

export function saveChangesCurrentContact(state, savedContact, index) {
  state.contacts.list[index] = savedContact
}

export function addContactByEmail(state, { sEmail, mContact }) {
  Vue.set(state.contactsByEmail, sEmail, mContact)
}

export function setGroups(state, aGroups) {
  state.groups = aGroups
}

export function setCurrentGroup(state, oGroup) {
  state.currentGroup.group = oGroup
}

export function changeEditGroup(state, editable) {
  state.currentGroup.editable = editable
}

export function changeStateForCreatingContact(state, val) {
  state.stateForCreatingContact = val
}

export function changeStateForCreatingGroup(state, val) {
  state.stateForCreatingGroup = val
}

export function setCheckedContacts(state, val) {
  state.сheckedContactsList = val
}
