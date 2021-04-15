import Vue from 'vue'
import store from 'src/store'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

import typesUtils from 'src/utils/types'

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

export function setContactOpenPgpKeyView(state, { sUUID, sOpenPgpKeyUser }) {
  let oContact = _.find(state.contacts.list, (oContact) => {
    return oContact.UUID === sUUID
  })
  if (oContact) {
    oContact.OpenPgpKeyUser = sOpenPgpKeyUser
  }
}

export function setContacts(state, aContacts) {
  _.each(aContacts, async (oContact) => {
    if (oContact.PublicPgpKey) {
      let aKeys = await OpenPgp.getArmorInfo(oContact.PublicPgpKey)
      if (typesUtils.isNonEmptyArray(aKeys)) {
        let aKeyUsersIds = aKeys[0].getUserIds()
        store.commit('contacts/setContactOpenPgpKeyView', {
          sUUID: oContact.UUID,
          sOpenPgpKeyUser: aKeyUsersIds.length > 0 ? aKeyUsersIds[0] : '0'
        })
      }
    }
  })
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

export function markContactsDeleted(state, aContactsUUIDs) {
  _.each(state.contacts.list, function (oContact) {
    if (_.indexOf(aContactsUUIDs, oContact.UUID) !== -1) {
      oContact.Deleted = true
    }
  })
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

export function importContacts(state, stateImport) {
  state.stateImportContact = stateImport
}

export function disableImportContacts(state, stateImport) {
  state.stateImportContact = stateImport
}

export function setNewContactToEdit(state, oNewContactToEdit) {
  state.newContactToEdit = oNewContactToEdit
}

export function clearContactsByEmail(state) {
  state.contactsByEmail = {}
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
  state.checkedContactsList = val
}

export function setOpenPgpExternalKeys(state, { aOpenPgpExternalKeys }) {
  state.openPgpExternalKeys = aOpenPgpExternalKeys
}
