import _ from 'lodash'

export function getStorageList(state) {
  return state.storages && _.isFunction(state.storages.getList) ? state.storages.getList() : []
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

export function getCurrentStorage(state) {
  return state.storages && _.isFunction(state.storages.getCurrentStorage) ? state.storages.getCurrentStorage() : ''
}

export function getContactByUUID(state) {
  return state.contactByUUID
}
