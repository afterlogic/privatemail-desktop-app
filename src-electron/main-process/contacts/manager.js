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
          oEvent.sender.send('contacts-get-contacts', { aContacts, iCount, oRequestParams: { sStorage, sGroupUUID, sSearch, iPerPage, iPage } })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-contacts', { oError })
        }
      )
    })

    ipcMain.on('contacts-get-all-group-contacts', (oEvent, { sStorage, sGroupUUID }) => {
      contactsDbManager.getContacts({ sStorage, sGroupUUID }).then(
        ({ aContacts }) => {
          oEvent.sender.send('contacts-get-all-group-contacts', { aContacts, oRequestParams: { sStorage, sGroupUUID } })
        },
        (oError) => {
          oEvent.sender.send('contacts-get-all-group-contacts', { oError })
        }
      )
    })

    ipcMain.on('contacts-get-contacts-by-emails', (oEvent, { aEmails }) => {
      // contactsDbManager.getStorages({}).then(
      //   (aStoragesFromDb) => {
      //     if (typesUtils.isNonEmptyArray(aStoragesFromDb)) {
            contactsDbManager.getContactsByEmails({ aEmails }).then(
              ({ aContacts }) => {
                oEvent.sender.send('contacts-get-contacts-by-emails', { aEmails, aContacts })
              },
              (oError) => {
                oEvent.sender.send('contacts-get-contacts-by-emails', { oError })
              }
            )
      //     } else {
      //       oEvent.sender.send('contacts-get-contacts-by-emails', { bNoStorages })
      //     }
      //   },
      //   (oError) => {
      //     oEvent.sender.send('contacts-get-contacts-by-emails', { bNoStorages, oError })
      //   }
      // )
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
                  oEvent.sender.send('contacts-refresh', { bHasChanges: false, sStorage })
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
                  } else if (oStorageCtagFromDb) {
                    oEvent.sender.send('contacts-refresh', { bHasChanges: false, sStorage: oStorageCtagFromDb.Storage })
                  }
                })
                if (aStoragesToRefresh.length !== 0) {
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

    ipcMain.on('contacts-save-contact', (oEvent, { sApiHost, sAuthToken, oContactToSave }) => {
      let bNewContact = oContactToSave.UUID === ''
      let sMethod = bNewContact ? 'CreateContact' : 'UpdateContact'
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod,
        oParameters: { Contact: oContactToSave },
        fCallback: (mResult, oError) => {
          if (mResult && (mResult.UUID === oContactToSave.UUID || bNewContact)) {
            oContactToSave.ETag = mResult.ETag
            oContactToSave.UUID = mResult.UUID
            contactsDbManager.setContacts({ aContacts: [oContactToSave], bCreateInfo: bNewContact })
            .then(
              () => {
                oEvent.sender.send('contacts-save-contact', { oContactWithUpdatedETag: oContactToSave })
              },
              (oError) => {
                oEvent.sender.send('contacts-save-contact', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-save-contact', { oError })
          }
        },
      })
    })

    ipcMain.on('contacts-delete-contacts', (oEvent, { sApiHost, sAuthToken, sStorage, aContactsUUIDs }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod: 'DeleteContacts',
        oParameters: { Storage: sStorage, UUIDs: aContactsUUIDs },
        fCallback: (mResult, oError) => {
          if (mResult) {
            contactsDbManager.deleteContacts({ sStorage, aContactsUUIDs })
            .then(
              () => {
                oEvent.sender.send('contacts-delete-contacts', { bDeleted: true })
              },
              (oError) => {
                oEvent.sender.send('contacts-delete-contacts', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-delete-contacts', { oError })
          }
        },
      })
    })

    ipcMain.on('contacts-save-group', (oEvent, { sApiHost, sAuthToken, oGroupToSave, aContacts }) => {
      let bCreateGroup = oGroupToSave.UUID === ''
      let sMethod = bCreateGroup ? 'CreateGroup' : 'UpdateGroup'
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod,
        oParameters: { Group: oGroupToSave },
        fCallback: (mResult, oError) => {
          if (mResult) {
            if (bCreateGroup) {
              oGroupToSave.UUID = mResult
            }
            contactsDbManager.setGroup({ oGroup: oGroupToSave })
            .then(
              () => {
                if (bCreateGroup && typesUtils.isNonEmptyArray(oGroupToSave.Contacts) && typesUtils.isNonEmptyArray(aContacts)) {
                  contactsDbManager.addContactsToGroup({ sGroupUUID: oGroupToSave.UUID, aContacts, aContactsUUIDs: oGroupToSave.Contacts })
                  .then(
                    () => {
                      oEvent.sender.send('contacts-save-group', { bSaved: true, iAddedContactsCount: aContacts.length })
                    },
                    (oError) => {
                      oEvent.sender.send('contacts-save-group', { oError })
                    }
                  )
                } else {
                  oEvent.sender.send('contacts-save-group', { bSaved: true, iAddedContactsCount: 0 })
                }
              },
              (oError) => {
                oEvent.sender.send('contacts-save-group', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-save-group', { oError })
          }
        },
      })
    })

    ipcMain.on('contacts-delete-group', (oEvent, { sApiHost, sAuthToken, sUUID }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod: 'DeleteGroup',
        oParameters: { UUID: sUUID },
        fCallback: (mResult, oError) => {
          if (mResult) {
            contactsDbManager.deleteGroup({ sUUID })
            .then(
              () => {
                oEvent.sender.send('contacts-delete-group', { bDeleted: true })
              },
              (oError) => {
                oEvent.sender.send('contacts-delete-group', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-delete-group', { oError })
          }
        },
      })
    })

    ipcMain.on('contacts-add-contacts-to-group', (oEvent, { sApiHost, sAuthToken, sGroupUUID, aContacts, aContactsUUIDs }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod: 'AddContactsToGroup',
        oParameters: { GroupUUID: sGroupUUID, ContactUUIDs: aContactsUUIDs },
        fCallback: (mResult, oError) => {
          if (mResult) {
            contactsDbManager.addContactsToGroup({ sGroupUUID, aContacts, aContactsUUIDs })
            .then(
              () => {
                oEvent.sender.send('contacts-add-contacts-to-group', { bAdded: true })
              },
              (oError) => {
                oEvent.sender.send('contacts-add-contacts-to-group', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-add-contacts-to-group', { oError })
          }
        },
      })
    })

    ipcMain.on('contacts-remove-contacts-from-group', (oEvent, { sApiHost, sAuthToken, sGroupUUID, aContacts, aContactsUUIDs }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Contacts',
        sMethod: 'RemoveContactsFromGroup',
        oParameters: { GroupUUID: sGroupUUID, ContactUUIDs: aContactsUUIDs },
        fCallback: (mResult, oError) => {
          if (mResult) {
            contactsDbManager.removeContactsFromGroup({ sGroupUUID, aContacts, aContactsUUIDs })
            .then(
              () => {
                oEvent.sender.send('contacts-remove-contacts-from-group', { bRemoved: true })
              },
              (oError) => {
                oEvent.sender.send('contacts-remove-contacts-from-group', { oError })
              }
            )
          } else {
            oEvent.sender.send('contacts-remove-contacts-from-group', { oError })
          }
        },
      })
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
