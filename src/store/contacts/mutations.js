import CStorages from '../../modules/contacts/classes/CStorages'

export function setStorages(state, aStorages) {
  if (!state.storages instanceof CStorages) {
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
}

export function setSyncing(state, bSyncing) {
  state.syncing = bSyncing
}

export function setETagsforUpdate(state, ETagsforUpdate) {
    state.ETagsforUpdate = ETagsforUpdate
}

export function setContacts(state, aContacts) {
  state.contacts.list = aContacts
}

export function setContactByUUID(state, contactByUUID) {
    state.contactByUUID = contactByUUID
}

export function changeEditContact(state, editable) {
    state.contactByUUID.editable = editable
}

export function saveChangesCurrentContact(state, savedContact, index) {
    state.contacts.list[index] = savedContact
    // console.log(state.contacts.list[index])
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
