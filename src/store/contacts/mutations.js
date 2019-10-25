export function setStorages(state, aStorages) {
    state.storages.list = aStorages
}

export function setContactsInfo(state, aContactsInfo) {
    state.contactsInfo.list = aContactsInfo
}

export function setETagsforUpdate(state, ETagsforUpdate) {
    state.ETagsforUpdate = ETagsforUpdate
}

export function setCTag(state, iCTag) {
    state.contactsInfo.CTag = iCTag
}

export function setContacts(state, aContacts) {
    state.contacts.list = aContacts
}

export function setStorage(state, storage) {
    state.currentStorage.name = storage
}

export function setContactsUUIDs(state, contactsUUIDs) {
    state.contactsInfo.contactsUUIDs = contactsUUIDs
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