export function getStorages(state) {
    return state.storages.list
}

export function getContactsInfo(state) {
    return state.contactsInfo.list
}

export function getCTag(state) {
    return state.contactsInfo.CTag
}

export function getContactsByUids(state) {
    return state.contacts
}

export function getStorage(state) {
    return state.currentStorage.name
}

export function getContactByUUID(state) {
    return state.contactByUUID
}
