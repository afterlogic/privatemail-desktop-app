import { ipcMain } from 'electron'
import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'

import contactsDbManager from '../db-managers/contacts.js'

import webApi from '../webApi.js'

export default {
  initSubscriptions: function () {
    ipcMain.on('contacts-get-storages', (oEvent, { sApiHost, sAuthToken }) => {
      contactsDbManager.getStorages({}).then(
        (aStoragesFromDb) => {
          oEvent.sender.send('contacts-get-storages', { aStorages: typesUtils.pArray(aStoragesFromDb) })
          webApi.sendRequest({
            sApiHost,
            sAuthToken,
            sModule: 'Contacts',
            sMethod: 'GetStorages',
            fCallback: (aStoragesFromApi, oError) => {
              if (typesUtils.isNonEmptyArray(aStoragesFromApi)) {
                if (!_.isEqual(aStoragesFromApi, aStoragesFromDb)) {
                  oEvent.sender.send('contacts-get-storages', { aStorages: aStoragesFromApi })
                  contactsDbManager.setStorages({ aStorages: aStoragesFromApi })
                }
              } else {
                oEvent.sender.send('contacts-get-storages', { oError })
              }
            },
          })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-storages', { oError })
        }
      )
    })

    ipcMain.on('contacts-get-groups', (oEvent, { sApiHost, sAuthToken }) => {
      contactsDbManager.getGroups({}).then(
        (aGroupsFromDb) => {
          oEvent.sender.send('contacts-get-groups', { aGroups: typesUtils.pArray(aGroupsFromDb) })
          webApi.sendRequest({
            sApiHost,
            sAuthToken,
            sModule: 'Contacts',
            sMethod: 'GetGroups',
            fCallback: (aGroupsFromApi, oError) => {
              if (typesUtils.isNonEmptyArray(aGroupsFromApi)) {
                if (!_.isEqual(aGroupsFromApi, aGroupsFromDb)) {
                  oEvent.sender.send('contacts-get-groups', { aGroups: aGroupsFromApi })
                  contactsDbManager.setGroups({ aGroups: aGroupsFromApi })
                }
              } else {
                oEvent.sender.send('contacts-get-groups', { oError })
              }
            },
          })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-groups', { oError })
        }
      )
    })

    ipcMain.on('contacts-get-contacts', (oEvent, { sStorage, iPerPage, iPage }) => {
      contactsDbManager.getContacts({ sStorage, iPerPage, iPage }).then(
        (aContactsFromDb) => {
          oEvent.sender.send('contacts-get-contacts', { aContacts: typesUtils.pArray(aContactsFromDb) })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-contacts', { oError })
        }
      )
    })

    function _refreshContacts (oEvent, { sApiHost, sAuthToken, sStorage, aUuidsNew }) {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod: 'GetContactsByUids',
        oParameters: { 'Storage': sStorage, 'Uids': aUuidsNew },
        fCallback: (aContactsFromApi, oError) => {
          if (typesUtils.isNonEmptyArray(aContactsFromApi)) {
            contactsDbManager.setContacts({ aContacts: aContactsFromApi }).then(
              () => {
                oEvent.sender.send('contacts-refresh', { bHasChanges: true })
              },
              (oError) => {
                oEvent.sender.send('contacts-refresh', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-refresh', { oError })
          }
        },
      })
    }
    
    ipcMain.on('contacts-refresh', (oEvent, { sApiHost, sAuthToken, sStorage }) => {
      contactsDbManager.getContactsInfo({ sStorage }).then(
        (oContactsInfoFromDb) => {
          webApi.sendRequest({
            sApiHost,
            sAuthToken,
            sModule: 'Contacts',
            sMethod: 'GetContactsInfo',
            oParameters: { 'Storage': sStorage },
            fCallback: (oContactsInfoFromApi, oError) => {
              if (typesUtils.isNonEmptyObject(oContactsInfoFromApi)) {
                if (!typesUtils.isNonEmptyObject(oContactsInfoFromDb)) {
                  oContactsInfoFromDb = {
                    CTag: 0,
                    Info: [],
                  }
                }
                if (oContactsInfoFromDb.CTag !== oContactsInfoFromApi.CTag) {
                  contactsDbManager.setContactsInfo({ sStorage, oContactsInfoFromDb, oContactsInfoFromApi }).then(
                    (aUuidsNew) => {
                      if (typesUtils.isNonEmptyArray(aUuidsNew)) {
                        _refreshContacts(oEvent, { sApiHost, sAuthToken, sStorage, aUuidsNew })
                      } else {
                        oEvent.sender.send('contacts-refresh', { bHasChanges: true })
                      }
                    },
                    (oError) => {
                      oEvent.sender.send('contacts-refresh', { oError })
                    }
                  )
                } else {
                  oEvent.sender.send('contacts-refresh', { bHasChanges: false })
                }
              } else {
                oEvent.sender.send('contacts-refresh', { oError })
              }
            },
          })
        },
        (oError) => {
          oEvent.sender.send('contacts-refresh', { oError })
        }
      )
    })
  },
}
