import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'

let oDb = null

let aContactsDbFields = [
  {Name: 'EntityId', DbName: 'entity_id', Type: 'INTEGER'},
  {Name: 'UUID', DbName: 'uuid', Type: 'TEXT'},
  {Name: 'ParentUUID', DbName: 'parent_uuid', Type: 'TEXT'},
  {Name: 'IdUser', DbName: 'id_user', Type: 'INTEGER'},
  {Name: 'IdTenant', DbName: 'id_tenant', Type: 'INTEGER'},
  {Name: 'Storage', DbName: 'storage', Type: 'TEXT'},
  {Name: 'FullName', DbName: 'full_name', Type: 'TEXT'},
  {Name: 'UseFriendlyName', DbName: 'use_friendly_name', Type: 'INTEGER', IsBool: true},
  {Name: 'PrimaryEmail', DbName: 'primary_email', Type: 'INTEGER'},
  {Name: 'PrimaryPhone', DbName: 'primary_phone', Type: 'INTEGER'},
  {Name: 'PrimaryAddress', DbName: 'primary_address', Type: 'INTEGER'},
  {Name: 'ViewEmail', DbName: 'view_email', Type: 'TEXT'},
  {Name: 'Title', DbName: 'title', Type: 'TEXT'},
  {Name: 'FirstName', DbName: 'first_name', Type: 'TEXT'},
  {Name: 'LastName', DbName: 'last_name', Type: 'TEXT'},
  {Name: 'NickName', DbName: 'nick_name', Type: 'TEXT'},
  {Name: 'Skype', DbName: 'skype', Type: 'TEXT'},
  {Name: 'Facebook', DbName: 'facebook', Type: 'TEXT'},
  {Name: 'PersonalEmail', DbName: 'personal_email', Type: 'TEXT'},
  {Name: 'PersonalAddress', DbName: 'personal_address', Type: 'TEXT'},
  {Name: 'PersonalCity', DbName: 'personal_city', Type: 'TEXT'},
  {Name: 'PersonalState', DbName: 'personal_state', Type: 'TEXT'},
  {Name: 'PersonalZip', DbName: 'personal_zip', Type: 'TEXT'},
  {Name: 'PersonalCountry', DbName: 'personal_country', Type: 'TEXT'},
  {Name: 'PersonalWeb', DbName: 'personal_web', Type: 'TEXT'},
  {Name: 'PersonalFax', DbName: 'personal_fax', Type: 'TEXT'},
  {Name: 'PersonalPhone', DbName: 'personal_phone', Type: 'TEXT'},
  {Name: 'PersonalMobile', DbName: 'personal_mobile', Type: 'TEXT'},
  {Name: 'BusinessEmail', DbName: 'business_email', Type: 'TEXT'},
  {Name: 'BusinessCompany', DbName: 'business_company', Type: 'TEXT'},
  {Name: 'BusinessAddress', DbName: 'business_address', Type: 'TEXT'},
  {Name: 'BusinessCity', DbName: 'business_city', Type: 'TEXT'},
  {Name: 'BusinessState', DbName: 'business_state', Type: 'TEXT'},
  {Name: 'BusinessZip', DbName: 'business_zip', Type: 'TEXT'},
  {Name: 'BusinessCountry', DbName: 'business_country', Type: 'TEXT'},
  {Name: 'BusinessJobTitle', DbName: 'business_job_title', Type: 'TEXT'},
  {Name: 'BusinessDepartment', DbName: 'business_department', Type: 'TEXT'},
  {Name: 'BusinessOffice', DbName: 'business_office', Type: 'TEXT'},
  {Name: 'BusinessPhone', DbName: 'business_phone', Type: 'TEXT'},
  {Name: 'BusinessFax', DbName: 'business_fax', Type: 'TEXT'},
  {Name: 'BusinessWeb', DbName: 'business_web', Type: 'TEXT'},
  {Name: 'OtherEmail', DbName: 'other_email', Type: 'TEXT'},
  {Name: 'Notes', DbName: 'notes', Type: 'TEXT'},
  {Name: 'BirthDay', DbName: 'birth_day', Type: 'INTEGER'},
  {Name: 'BirthMonth', DbName: 'birth_month', Type: 'INTEGER'},
  {Name: 'BirthYear', DbName: 'birth_year', Type: 'INTEGER'},
  {Name: 'ETag', DbName: 'etag', Type: 'TEXT'},
  {Name: 'Auto', DbName: 'auto', Type: 'INTEGER', IsBool: true},
  {Name: 'Frequency', DbName: 'frequency', Type: 'INTEGER'},
  {Name: 'DateModified', DbName: 'date_modified', Type: 'TEXT'},
  {Name: 'DavContacts::UID', DbName: 'dav_contacts_uid', Type: 'TEXT'},
  {Name: 'DavContacts::VCardUID', DbName: 'dav_contacts_vcard_uid', Type: 'TEXT'},
  {Name: 'GroupUUIDs', DbName: 'group_uuids', Type: 'TEXT', IsArray: true},
]

let aGroupsDbFields = [
  {Name: 'City', DbName: 'city', Type: 'TEXT'},
  {Name: 'Company', DbName: 'company', Type: 'TEXT'},
  {Name: 'Country', DbName: 'country', Type: 'TEXT'},
  {Name: 'DavContacts::UID', DbName: 'dav_Contacts_uid', Type: 'TEXT'},
  {Name: 'Email', DbName: 'email', Type: 'TEXT'},
  {Name: 'EntityId', DbName: 'entityId', Type: 'INTEGER'},
  {Name: 'Fax', DbName: 'fax', Type: 'TEXT'},
  {Name: 'IdUser', DbName: 'id_user', Type: 'INTEGER'},
  {Name: 'IsOrganization', DbName: 'is_organization', Type: 'INTEGER', IsBool: true},
  {Name: 'Name', DbName: 'name', Type: 'TEXT'},
  {Name: 'ParentUUID', DbName: 'parent_uuid', Type: 'TEXT'},
  {Name: 'Phone', DbName: 'phone', Type: 'TEXT'},
  {Name: 'State', DbName: 'state', Type: 'TEXT'},
  {Name: 'Street', DbName: 'street', Type: 'TEXT'},
  {Name: 'UUID', DbName: 'uuid', Type: 'TEXT'},
  {Name: 'Web', DbName: 'web', Type: 'TEXT'},
  {Name: 'Zip', DbName: 'zip', Type: 'TEXT'},
]

function _prepareDataFromDb (aRows, aDbFieldsData) {
  let aItems = []
  _.each(aRows, function (oRow) {
    if (typesUtils.isNonEmptyObject(oRow)) {
      let oItem = {}
      _.each(aDbFieldsData, function (oItemDbField) {
        let mDbItem = oRow[oItemDbField.DbName]
        if (oItemDbField.IsBool) {
          oItem[oItemDbField.Name] = !!mDbItem
        } else if (oItemDbField.IsArray) {
          let aValue = []
          let sValue = mDbItem
          if (typesUtils.isNonEmptyString(sValue)) {
            aValue = JSON.parse(sValue)
          }
          oItem[oItemDbField.Name] = aValue
        } else {
          oItem[oItemDbField.Name] = mDbItem
        }
      })
      aItems.push(oItem)
    }
  })
  return aItems
}

function _prepareInsertParams (oItem, aDbFieldsData) {
  let aParams = []
  _.each(aDbFieldsData, function (oDbField) {
    if (oDbField.IsArray) {
      let aValue = typesUtils.pArray(oItem[oDbField.Name])
      aParams.push(JSON.stringify(aValue))
    } else {
      aParams.push(oItem[oDbField.Name])
    }
  })
  return aParams
}

export default {
  init: function (oDbConnect) {
    oDb = oDbConnect
    if (oDb) {
      oDb.serialize(function() {
        oDb.run('CREATE TABLE IF NOT EXISTS contacts_storages (storage TEXT, ctag INTEGER)')
        oDb.run('CREATE TABLE IF NOT EXISTS contacts_info (storage TEXT, uuid TEXT, etag TEXT)')

        let aContactsFields = _.map(aContactsDbFields, function (oContactDbFields) {
          return oContactDbFields.DbName + ' ' + oContactDbFields.Type
        })
        let sContactsFields = aContactsFields.join(', ')
        oDb.run('CREATE TABLE IF NOT EXISTS contacts (' + sContactsFields + ')')

        let aGroupsFields = _.map(aGroupsDbFields, function (oGroupDbFields) {
          return oGroupDbFields.DbName + ' ' + oGroupDbFields.Type
        })
        let sGroupsFields = aGroupsFields.join(', ')
        oDb.run('CREATE TABLE IF NOT EXISTS contacts_groups (' + sGroupsFields + ')')
      })
    }
  },

  getStorages: function ({}) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all('SELECT storage FROM contacts_storages',
        [],
        function(oError, aRows) {
            if (oError) {
              reject({ sMethod: 'getStorages', oError })
            } else {
              let aStorages = []
              _.each(aRows, function (oRow) {
                if (typesUtils.isNonEmptyObject(oRow) && typesUtils.isNonEmptyString(oRow.storage)) {
                  aStorages.push(oRow.storage)
                }
              })
              resolve(aStorages)
            }
          }
        )
      } else {
        reject({ sMethod: 'getStorages', sError: 'No DB connection' })
      }
    })
  },

  setStorages: function ({ aStorages }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let oStatement = oDb.prepare('DELETE FROM contacts_storages')
          oStatement.run()
          oStatement.finalize()
        })

        let sQuestions = aStorages.map(function(){ return '(?)' }).join(',')
        oDb.all(
          'INSERT INTO contacts_storages (storage) VALUES ' + sQuestions,
          aStorages,
          function(oError) {
            if (oError) {
              reject({ sMethod: 'setStorages', oError })
            } else {
              resolve()
            }
          }
        )
      } else {
        reject({ sMethod: 'setStorages', sError: 'No DB connection' })
      }
    })
  },

  getGroups: function ({}) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all('SELECT * FROM contacts_groups ORDER BY name COLLATE NOCASE ASC',
        [],
        function(oError, aRows) {
            if (oError) {
              reject({ sMethod: 'getGroups', oError })
            } else {
              let aGroups = _prepareDataFromDb(aRows, aGroupsDbFields)
              resolve(aGroups)
            }
          }
        )
      } else {
        reject({ sMethod: 'getGroups', sError: 'No DB connection' })
      }
    })
  },

  setGroups: function ({ aGroups }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let oStatement = oDb.prepare('DELETE FROM contacts_groups')
          oStatement.run()
          oStatement.finalize()
        })

        let sFieldsDbNames = _.map(aGroupsDbFields, function (oGroupDbField) {
          return oGroupDbField.DbName
        }).join(', ')
        let sQuestions = aGroupsDbFields.map(function(){ return '?' }).join(',')
        let oStatement = oDb.prepare('INSERT INTO contacts_groups (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
        _.each(aGroups, function (oGroup) {
          let aParams = _prepareInsertParams(oGroup, aGroupsDbFields)
          oStatement.run.apply(oStatement, aParams)
        })
        oStatement.finalize(function (oError) {
          if (oError) {
            reject({ sMethod: 'setGroups', oError })
          } else {
            resolve()
          }
        })
      } else {
        reject({ sMethod: 'setGroups', sError: 'No DB connection' })
      }
    })
  },

  getContactsInfo: function ({ sStorage }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT uuid, etag FROM contacts_info WHERE storage = ?', sStorage)
          .all(function(oError, aRows) {
            if (oError) {
              reject({ sMethod: 'getContactsInfo', oError })
            } else {
              let aInfo = []
              _.each(aRows, function (oRow) {
                if (typesUtils.isNonEmptyObject(oRow) && typesUtils.isNonEmptyString(oRow.uuid)) {
                  aInfo.push({
                    'UUID': oRow.uuid,
                    'ETag': oRow.etag,
                  })
                }
              })
              oDb
              .prepare('SELECT ctag FROM contacts_storages WHERE storage = ?', sStorage)
              .get(function(oError, oRow) {
                if (oError) {
                  reject({ sMethod: 'getContactsInfo', oError })
                } else {
                  resolve({
                    'Info': aInfo,
                    'CTag': typesUtils.pInt(oRow && oRow.ctag),
                  })
                }
              })
              .finalize()
            }
          })
          .finalize()
      } else {
        reject({ sMethod: 'getContactsInfo', sError: 'No DB connection' })
      }
    })
  },

  setContactsInfo: function ({ sStorage, oContactsInfoFromDb, oContactsInfoFromApi }) {
    return new Promise((resolve, reject) => {
      function _deleteContactsByUuids (aUuids) {
        let sQuestions = aUuids.map(function(){ return '(?)' }).join(',')
        oDb.run('DELETE FROM contacts_info WHERE uuid IN (' + sQuestions + ')', aUuids)
        oDb.run('DELETE FROM contacts WHERE uuid IN (' + sQuestions + ')', aUuids)
      }

      function _addContactsInfo (sStorage, aContactsInfo) {
        let oStatement = oDb.prepare('INSERT INTO contacts_info (storage, uuid, etag) VALUES (?, ?, ?)')
        _.each(aContactsInfo, function (oContactInfo) {
          oStatement.run(sStorage, oContactInfo.UUID, oContactInfo.ETag)
        })
        oStatement.finalize()
      }

      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let
            aDiffNew = _.differenceWith(oContactsInfoFromApi.Info, oContactsInfoFromDb.Info, _.isEqual),
            aUuidsNew = _.map(aDiffNew, function (oInfo) {
              return oInfo.UUID
            }),
            aDiffOld = _.differenceWith(oContactsInfoFromDb.Info, oContactsInfoFromApi.Info, _.isEqual),
            aUuidsOld = _.map(aDiffOld, function (oInfo) {
              return oInfo.UUID
            })
          _deleteContactsByUuids(aUuidsOld)
          _addContactsInfo(sStorage, aDiffNew)

          oDb
            .prepare('UPDATE contacts_storages SET ctag = ? WHERE storage = ?', oContactsInfoFromApi.CTag, sStorage)
            .run()
            .finalize(function (oError) {
              if (oError) {
                reject({ sMethod: 'setContactsInfo', oError })
              } else {
                resolve(aUuidsNew)
              }
            })
        })
      } else {
        reject({ sMethod: 'setContactsInfo', sError: 'No DB connection' })
      }
    })
  },

  getContactsUidsByUids: function ({ sStorage }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all('SELECT uuid FROM contacts WHERE storage = ?',
        [sStorage],
        function(oError, aRows) {
            if (oError) {
              reject({ sMethod: 'getContactsUidsByUids', oError })
            } else {
              let aUuids = []
              _.each(aRows, function (oRow) {
                if (typesUtils.isNonEmptyObject(oRow) && typesUtils.isNonEmptyString(oRow.uuid)) {
                  aUuids.push(oRow.uuid)
                }
              })
              resolve(aUuids)
            }
          }
        )
      } else {
        reject({ sMethod: 'getContactsUidsByUids', sError: 'No DB connection' })
      }
    })
  },

  setContacts: function ({ aContacts }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let aUuids = aContacts.map(function(oContact){ return oContact.UUID })
          let sQuestions = aUuids.map(function(){ return '(?)' }).join(',')
          oDb.run('DELETE FROM contacts WHERE uuid IN (' + sQuestions + ')', aUuids)

          let sFieldsDbNames = _.map(aContactsDbFields, function (oContactDbField) {
            return oContactDbField.DbName
          }).join(', ')
          sQuestions = aContactsDbFields.map(function(){ return '?' }).join(',')
          let oStatement = oDb.prepare('INSERT INTO contacts (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
          _.each(aContacts, function (oContact) {
            let aParams = _prepareInsertParams(oContact, aContactsDbFields)
            oStatement.run.apply(oStatement, aParams)
          })
          oStatement.finalize(function (oError) {
            if (oError) {
              reject({ sMethod: 'setContacts', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'setContacts', sError: 'No DB connection' })
      }
    })
  },

  getContacts: function ({ sStorage, iPerPage, iPage }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all('SELECT * FROM contacts WHERE storage = ? ORDER BY full_name COLLATE NOCASE ASC, view_email COLLATE NOCASE ASC LIMIT ? OFFSET ?',
        [sStorage, iPerPage, iPerPage * (iPage - 1)],
        function(oError, aRows) {
            if (oError) {
              reject({ sMethod: 'getContacts', oError })
            } else {
              let aContacts = _prepareDataFromDb(aRows, aContactsDbFields)
              resolve(aContacts)
            }
          }
        )
      } else {
        reject({ sMethod: 'getContacts', sError: 'No DB connection' })
      }
    })
  },
}
