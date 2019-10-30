import _ from 'lodash'

export function getStorageList(state) {
  return state.storages && _.isFunction(state.storages.getList) ? state.storages.getList() : []
}

export function getHasChanges(state) {
  return state.hasChanges
}

export function getSyncing(state) {
  return state.syncing
}

export function getContacts(state) {
  return state.contacts
}

export function getCurrentStorage(state) {
  return state.storages && _.isFunction(state.storages.getCurrentStorage) ? state.storages.getCurrentStorage() : ''
}

export function getContactByUUID(state) {
  return state.contactByUUID
}

export function getGroups(state) {
  return state.groups
}

export function getCurrentGroup(state) {
  return state.currentGroup
}
