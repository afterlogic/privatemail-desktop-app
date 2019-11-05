import { ipcMain } from 'electron'
import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'

import contactsDbManager from '../contacts/db-manager.js'

import webApi from '../webApi.js'

export default {
  initSubscriptions: function () {
    ipcMain.on('contacts-get-storages', (oEvent, {}) => {
      contactsDbManager.getStorages({}).then(
        (aStoragesFromDb) => {
          oEvent.sender.send('contacts-get-storages', { aStorages: typesUtils.pArray(aStoragesFromDb) })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-storages', { oError })
        }
      )
    })

    ipcMain.on('contacts-get-groups', (oEvent, {}) => {
      contactsDbManager.getGroups({}).then(
        (aGroupsFromDb) => {
          oEvent.sender.send('contacts-get-groups', { aGroups: typesUtils.pArray(aGroupsFromDb) })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-groups', { oError })
        }
      )
    })

    ipcMain.on('contacts-get-contacts', (oEvent, { sStorage, sGroupUUID, sSearch, iPerPage, iPage }) => {
      contactsDbManager.getContacts({ sStorage, sGroupUUID, sSearch, iPerPage, iPage }).then(
        ({ aContacts, iCount }) => {
          oEvent.sender.send('contacts-get-contacts', { aContacts, iCount })
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
                oEvent.sender.send('contacts-refresh', { bHasChanges: true, sStorage })
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

    function _refreshContactsInfo (oEvent, { sApiHost, sAuthToken, sStorage }) {
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
                        oEvent.sender.send('contacts-refresh', { bHasChanges: true, sStorage })
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
    }

    function _refreshStorages (oEvent, { sApiHost, sAuthToken }) {
      contactsDbManager.getStoragesCtags({}).then(
        (aStoragesCtagsFromDb) => {
          webApi.sendRequest({
            sApiHost,
            sAuthToken,
            sModule: 'Contacts',
            sMethod: 'GetContactStorages',
            fCallback: (aStoragesCtagsFromApi, oError) => {
              if (typesUtils.isNonEmptyArray(aStoragesCtagsFromApi)) {

                // Update storage list in database.
                let aStoragesFromDb = _.map(aStoragesCtagsFromDb, function (oStorage) {
                  return oStorage.Storage
                })
                let aStoragesFromApi = _.map(aStoragesCtagsFromApi, function (oStorage) {
                  return oStorage.Id
                })
                if (!_.isEqual(aStoragesFromDb.sort(), aStoragesFromApi.sort())) {
                  oEvent.sender.send('contacts-get-storages', { aStorages: aStoragesFromApi })
                  contactsDbManager.setStorages({ aStorages: aStoragesFromApi }).then(
                    () => {},
                    (oError) => {
                      oEvent.sender.send('contacts-refresh', { oError })
                    }
                  )
                }

                // Check storages CTag and update contacts info if necessary.
                let aStoragesToRefresh = []
                _.each(aStoragesCtagsFromApi, function (oStorageCtagFromApi) {
                  let oStorageCtagFromDb = _.find(aStoragesCtagsFromDb, function (oTmpStorageCtagFromDb) {
                    return oTmpStorageCtagFromDb.Storage === oStorageCtagFromApi.Id
                  })
                  if (!oStorageCtagFromDb || oStorageCtagFromDb.CTag !== oStorageCtagFromApi.CTag) {
                    aStoragesToRefresh.push(oStorageCtagFromApi.Id)
                  }
                })
                if (aStoragesToRefresh.length === 0) {
                  // There are no storages with modified CTag.
                  oEvent.sender.send('contacts-refresh', { bHasChanges: false })
                } else {
                  // Get contacts info for every storage with modified CTag.
                  _.each(aStoragesToRefresh, function (sStorageToRefresh) {
                    _refreshContactsInfo (oEvent, { sApiHost, sAuthToken, sStorage: sStorageToRefresh })
                  })
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
    }

    ipcMain.on('contacts-refresh', (oEvent, { sApiHost, sAuthToken, sStorage }) => {
      this.refreshGroups(oEvent, { sApiHost, sAuthToken })
      _refreshStorages(oEvent, { sApiHost, sAuthToken })
    })
  },

  refreshGroups: function (oEvent, { sApiHost, sAuthToken }) {
    contactsDbManager.getGroups({}).then(
      (aGroupsFromDb) => {
        if (!_.isArray(aGroupsFromDb)) {
          aGroupsFromDb = []
        }
        webApi.sendRequest({
          sApiHost,
          sAuthToken,
          sModule: 'Contacts',
          sMethod: 'GetGroups',
          fCallback: (aGroupsFromApi, oError) => {
            if (typesUtils.isNonEmptyArray(aGroupsFromApi)) {
              if (!contactsDbManager.isGroupsEqual(aGroupsFromDb, aGroupsFromApi)) {
                contactsDbManager.setGroups({ aGroups: aGroupsFromApi })
                oEvent.sender.send('contacts-get-groups', { aGroups: typesUtils.pArray(aGroupsFromApi) })
              }
            }
          },
        })
      },
      (oError) => {}
    )
  },
}
