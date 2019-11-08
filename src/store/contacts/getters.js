import _ from 'lodash'
import typesUtils from '../../utils/types.js'

export function getStorageList(state) {
  return state.storages && _.isFunction(state.storages.getList) ? state.storages.getList() : []
}

export function getHasChanges(state) {
  return state.hasChanges
}

export function getSyncing(state) {
  return state.syncing
}

export function getLoading(state) {
  return state.loading
}

export function getContacts(state) {
  return state.contacts
}

export function getСurrentPage(state) {
  return state.currentPage
}

export function getContactsPerPage(state) {
  return state.contactsPerPage
}

export function getSearchText(state) {
  return state.searchText
}

export function getContactsCount(state) {
  return state.contacts.count
}

export function getCurrentStorage(state) {
  return state.storages && _.isFunction(state.storages.getCurrentStorage) ? state.storages.getCurrentStorage() : ''
}

export function getCurrentContact(state) {
  return state.contactByUUID
}

export function getGroups(state) {
  return state.groups
}

export function getCurrentGroup(state) {
  return state.currentGroup
}

export function getCurrentGroupUUID(state) {
  return typesUtils.pString(state.currentGroup && state.currentGroup.group && state.currentGroup.group.UUID)
}

export function getCreatingState(state) {
  return state.creatingView
}