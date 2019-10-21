import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import cContact from '../../modules/contacts/classes/CContact'
// import cStorages from '../../modules/contacts/classes/CStorages'
import cContactsInfo from '../../modules/contacts/classes/CContactsInfo'

export function asyncGetStorages({ state, commit, dispatch, getters }) {
  webApi.sendRequest({
    sModule: 'Contacts',
    sMethod: 'GetStorages',
    fCallback: (oResult, oError) => {
      if (oResult) {
        let aStorages = []

        oResult.forEach(element => {
          aStorages.push(element)
        })

        commit('setStorages', aStorages)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting storages info'))
      }
    },
  })
}

export function asyncGetContactsInfo({ state, commit, dispatch, getters }) {
  webApi.sendRequest({
    sModule: 'Contacts',
    sMethod: 'GetContactsInfo',
    oParameters: { 'Storage': state.currentStorage.name },
    fCallback: (oResult, oError) => {
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

        if (state.cTag && state.cTag !== iCTag) {
          for (let i = 0; i < state.contactsETags.length; i++) {
            if (state.contactsUUIDs[i] !== state.contactsInfo[i].ETag) {
              ETagsforUpdate.push()
            }
          }
        } else {
          commit('setContactsUUIDs', contactsUUIDs)
          commit('setContactsInfo', aContactsInfo)
          commit('setCTag', iCTag)
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting contacts info'))
      }

    },
  })
}

export async function asyncGetContactsByUids({ state, commit, dispatch, getters }) {
  // if (state.contactsUUIDs.length) {
  //   for (let i = 0; i < state.contactsUUIDs.length; i++) {
  //     if (state.ETagsforUpdate !== state.contactsInfo.UUID) {
  //       state.ETagsforUpdate.push(state.contactsUUIDs[i])
  //     }
  //   }
  // }

  await webApi.sendRequest({
    sModule: 'Contacts',
    sMethod: 'GetContactsByUids',
    oParameters: { 'Storage': state.currentStorage.name, 'Uids': state.contactsInfo.contactsUUIDs },
    fCallback: (oResult, oError) => {
      if (oResult) {
        let aContacts = []

        oResult.forEach(element => {
          let contact = new cContact(element)
          aContacts.push(contact)
        })

        commit('setContacts', aContacts)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting contacts'))
      }

    },
  })
}

export function changeStorage({ state, commit, dispatch, getters }, storage) {
  commit('setStorage', storage)
}

export function getContactByUUID({ state, commit, dispatch, getters }, UUID) {
  let contactByUUID = {
    UUID,
    editable: false,
    contact: {},
  }
  let contact = state.contacts.list.filter(item => {
    if (item.UUID === UUID) return item
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

export function changeContactUUID({ state, commit, dispatch, getters }) {
    commit('changeContactUUID')
}
