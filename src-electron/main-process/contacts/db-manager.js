import _ from 'lodash'

import dbHelper from '../utils/db-helper.js'

import typesUtils from '../../../src/utils/types.js'

let oDb = null

let aContactDbMap = [
  {Name: 'EntityId', DbName: 'entity_id', Type: 'INTEGER'},
  {Name: 'UUID', DbName: 'uuid', Type: 'TEXT'},
  {Name: 'Storage', DbName: 'storage', Type: 'TEXT'},
  {Name: 'FullName', DbName: 'full_name', Type: 'TEXT'},
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
  {Name: 'OpenPgpWebclient::PgpKey', DbName: 'openpgp_key', Type: 'TEXT'},
  {Name: 'OpenPgpWebclient::PgpEncryptMessages', DbName: 'openpgp_encrypt_messages', Type: 'INTEGER', IsBool: true},
  {Name: 'OpenPgpWebclient::PgpSignMessages', DbName: 'openpgp_sign_messages', Type: 'INTEGER', IsBool: true},
]

let aGroupDbMap = [
  {Name: 'City', DbName: 'city', Type: 'TEXT'},
  {Name: 'Company', DbName: 'company', Type: 'TEXT'},
  {Name: 'Country', DbName: 'country', Type: 'TEXT'},
  {Name: 'DavContacts::UID', DbName: 'dav_Contacts_uid', Type: 'TEXT'},
  {Name: 'Email', DbName: 'email', Type: 'TEXT'},
  {Name: 'EntityId', DbName: 'entityId', Type: 'INTEGER'},
  {Name: 'Fax', DbName: 'fax', Type: 'TEXT'},
  {Name: 'IsOrganization', DbName: 'is_organization', Type: 'INTEGER', IsBool: true},
  {Name: 'Name', DbName: 'name', Type: 'TEXT'},
  {Name: 'Phone', DbName: 'phone', Type: 'TEXT'},
  {Name: 'State', DbName: 'state', Type: 'TEXT'},
  {Name: 'Street', DbName: 'street', Type: 'TEXT'},
  {Name: 'UUID', DbName: 'uuid', Type: 'TEXT'},
  {Name: 'Web', DbName: 'web', Type: 'TEXT'},
  {Name: 'Zip', DbName: 'zip', Type: 'TEXT'},
]

function _getContactsSql ({ sStorage, sGroupUUID, sSearch, iPerPage, iPage }) {
  let aWhere = []
  let aParams = []

  if (typesUtils.isNonEmptyString(sGroupUUID)) {
    aWhere.push('group_uuids LIKE ?')
    aParams.push('%"' + sGroupUUID + '"%')
  } else if (sStorage === 'all') {
    aWhere.push('storage != ?')
    aParams.push('collected')
  } else {
    aWhere.push('storage = ?')
    aParams.push(sStorage)
  }

  if (typesUtils.isNonEmptyString(sSearch)) {
    aWhere.push('(full_name LIKE ? OR view_email LIKE ?)')
    aParams.push('%' + sSearch + '%')
    aParams.push('%' + sSearch + '%')
  }

  let sWhere = ''
  if (aWhere.length > 0) {
    sWhere = 'WHERE ' + aWhere.join(' AND ')
  }

  let sCountSql = 'SELECT COUNT(*) as count FROM contacts ' + sWhere
  let aCountParams = _.clone(aParams)
  let sSql = 'SELECT * FROM contacts ' + sWhere + ' ORDER BY full_name COLLATE NOCASE ASC, view_email COLLATE NOCASE ASC'
  if (_.isNumber(iPerPage) && _.isNumber(iPage)) {
    sSql = 'SELECT * FROM contacts ' + sWhere + ' ORDER BY full_name COLLATE NOCASE ASC, view_email COLLATE NOCASE ASC LIMIT ? OFFSET ?'
    aParams.push(iPerPage)
    aParams.push(iPerPage * (iPage - 1))
  }

  return { sCountSql, aCountParams, sSql, aParams }
}

export default {
  init: function (oDbConnect) {
    oDb = oDbConnect
    if (oDb) {
      oDb.serialize(() => {
        oDb.run('CREATE TABLE IF NOT EXISTS contacts_storages (storage TEXT, ctag INTEGER)')
        oDb.run('CREATE TABLE IF NOT EXISTS contacts_info (storage TEXT, uuid TEXT, etag TEXT)')

        let aContactsFields = _.map(aContactDbMap, (oContactDbFields) => {
          return oContactDbFields.DbName + ' ' + oContactDbFields.Type
        })
        let sContactsFields = aContactsFields.join(', ')
        oDb.run('CREATE TABLE IF NOT EXISTS contacts (' + sContactsFields + ')')

        let aGroupsFields = _.map(aGroupDbMap, (oGroupDbFields) => {
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
        (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getStorages', oError })
            } else {
              let aStorages = []
              _.each(aRows, (oRow) => {
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

  getStoragesCtags: function ({}) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all('SELECT storage, ctag FROM contacts_storages',
        [],
        (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getStoragesCtags', oError })
            } else {
              let aStoragesCtags = []
              _.each(aRows, (oRow) => {
                if (typesUtils.isNonEmptyObject(oRow) && typesUtils.isNonEmptyString(oRow.storage)) {
                  aStoragesCtags.push({
                    Storage: oRow.storage,
                    CTag: oRow.ctag,
                  })
                }
              })
              resolve(aStoragesCtags)
            }
          }
        )
      } else {
        reject({ sMethod: 'getStoragesCtags', sError: 'No DB connection' })
      }
    })
  },

  setStorages: function (aStoragesFromApi, aStoragesFromDb) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let aStoragesToAdd = _.difference(aStoragesFromApi, aStoragesFromDb)
          let aStoragesToRemove = _.difference(aStoragesFromDb, aStoragesFromApi)

          function _insertStorages () {
            if (aStoragesToAdd.length > 0) {
              let sQuestions = aStoragesToAdd.map(() => { return '(?)' }).join(',')
              oDb.all(
                'INSERT INTO contacts_storages (storage) VALUES ' + sQuestions,
                aStoragesToAdd,
                (oError) => {
                  if (oError) {
                    reject({ sMethod: 'setStorages', oError })
                  } else {
                    resolve()
                  }
                }
              )
            } else {
              resolve()
            }
          }

          if (aStoragesToRemove.length > 0) {
            let sQuestions = aStoragesToRemove.map(() => { return '?' }).join(',')
            oDb.run('DELETE FROM contacts_storages WHERE storage IN (' + sQuestions + ')', aStoragesToRemove, (oError) => {
              if (oError) {
                reject({ sMethod: 'setStorages', oError })
              } else {
                _insertStorages()
              }
            })
          } else {
            _insertStorages()
          }
        })

      } else {
        reject({ sMethod: 'setStorages', sError: 'No DB connection' })
      }
    })
  },

  isGroupsEqual: function (aGroupsFromDb, aGroupsFromApi) {
    let aOldGroups = _.cloneDeep(aGroupsFromDb)
    let aNewGroups = _.cloneDeep(aGroupsFromApi)
    let bEqual = true
    _.each(aNewGroups, (oNewGroup) => {
      let oOldGroupIndex = _.findIndex(aOldGroups, (oGroup) => {
        return oGroup.EntityId === oNewGroup.EntityId
      })
      if (oOldGroupIndex === -1) {
        bEqual = false
      } else {
        let oOldGroup = aOldGroups[oOldGroupIndex]
        _.each(aGroupDbMap, (oDbField) => {
          bEqual = bEqual && (oNewGroup[oDbField.Name] === oOldGroup[oDbField.Name])
        })
        if (bEqual) {
          aOldGroups.splice(oOldGroupIndex, 1)
        }
      }
      if (!bEqual) {
        return false // break each
      }
    })
    if (bEqual) {
      bEqual = aOldGroups.length === 0
    }
    return bEqual
  },

  getGroups: function ({}) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all('SELECT * FROM contacts_groups ORDER BY name COLLATE NOCASE ASC',
        [],
        (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getGroups', oError })
            } else {
              let aGroups = dbHelper.prepareDataFromDb(aRows, aGroupDbMap)
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
        oDb.serialize(() => {
          let oStatement = oDb.prepare('DELETE FROM contacts_groups')
          oStatement.run()
          oStatement.finalize()
        })

        let sFieldsDbNames = _.map(aGroupDbMap, (oGroupDbField) => {
          return oGroupDbField.DbName
        }).join(', ')
        let sQuestions = aGroupDbMap.map(() => { return '?' }).join(',')
        let oStatement = oDb.prepare('INSERT INTO contacts_groups (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
        _.each(aGroups, (oGroup) => {
          let aParams = dbHelper.prepareInsertParams(oGroup, aGroupDbMap)
          oStatement.run(aParams)
        })
        oStatement.finalize((oError) => {
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

  setGroup: function ({ oGroup }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('DELETE FROM contacts_groups WHERE uuid = ?')
          oStatement.run([oGroup.UUID])
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'setGroups', oError })
            } else {
              let sFieldsDbNames = _.map(aGroupDbMap, (oGroupDbField) => {
                return oGroupDbField.DbName
              }).join(', ')
              let sQuestions = aGroupDbMap.map(() => { return '?' }).join(',')
              let aParams = dbHelper.prepareInsertParams(oGroup, aGroupDbMap)
              let oStatement = oDb.prepare('INSERT INTO contacts_groups (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
              oStatement.run(aParams)
              oStatement.finalize((oError) => {
                if (oError) {
                  reject({ sMethod: 'setGroups', oError })
                } else {
                  resolve()
                }
              })
            }
          })
        })
      } else {
        reject({ sMethod: 'setGroups', sError: 'No DB connection' })
      }
    })
  },

  deleteGroup: function ({ sUUID }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('DELETE FROM contacts_groups WHERE uuid = ?')
          oStatement.run([sUUID])
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'deleteGroup', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'deleteGroup', sError: 'No DB connection' })
      }
    })
  },


  getContactsInfo: function ({ sStorage }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT uuid, etag FROM contacts_info WHERE storage = ?', sStorage)
          .all((oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getContactsInfo', oError })
            } else {
              let aInfo = []
              _.each(aRows, (oRow) => {
                if (typesUtils.isNonEmptyObject(oRow) && typesUtils.isNonEmptyString(oRow.uuid)) {
                  aInfo.push({
                    'UUID': oRow.uuid,
                    'ETag': oRow.etag,
                  })
                }
              })
              oDb
              .prepare('SELECT ctag FROM contacts_storages WHERE storage = ?', sStorage)
              .get((oError, oRow) => {
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

  _deleteContactsByUuids: function (sStorage, aUuids, bWithInfo) {
    return new Promise(async (resolve, reject) => {
      let bError = false
      if (typesUtils.isNonEmptyArray(aUuids)) {
        let iChunkLen = 998
        for (let iIndex = 0, iCount = aUuids.length; iIndex < iCount && bError === false; iIndex += iChunkLen) {
          let aUuidsChunk = aUuids.slice(iIndex, iIndex + iChunkLen)
          await this._deleteContactsLessThan999ByUuids(sStorage, aUuidsChunk, bWithInfo).then(
            () => {},
            (oResult) => {
              bError = true
              reject(oResult)
            }
          )
        }
      }
      if (!bError) {
        resolve()
      }
    })
  },

  _deleteContactsLessThan999ByUuids: function (sStorage, aUuids, bWithInfo) {
    return new Promise((resolve, reject) => {
      aUuids = aUuids.slice(0, 998)
      let sQuestions = aUuids.map(() => { return '?' }).join(',')
      let aParams = [sStorage].concat(aUuids)
      if (bWithInfo) {
        oDb.run('DELETE FROM contacts_info WHERE storage=? AND uuid IN (' + sQuestions + ')', aParams, (oError) => {
          if (oError) {
            reject({ sMethod: '_deleteContactsByUuids', oError })
          } else {
            oDb.run('DELETE FROM contacts WHERE storage=? AND uuid IN (' + sQuestions + ')', aParams, (oError) => {
              if (oError) {
                reject({ sMethod: '_deleteContactsByUuids', oError })
              } else {
                resolve()
              }
            })
          }
        })
      } else {
        oDb.run('DELETE FROM contacts WHERE storage=? AND uuid IN (' + sQuestions + ')', aParams, (oError) => {
          if (oError) {
            reject({ sMethod: '_deleteContactsByUuids', oError })
          } else {
            resolve()
          }
        })
      }
    })
  },

  setContactsInfo: function ({ sStorage, oContactsInfoFromDb, oContactsInfoFromApi }) {
    return new Promise((resolve, reject) => {
      function _addContactsInfo (sStorage, aContactsInfo) {
        let oStatement = oDb.prepare('INSERT INTO contacts_info (storage, uuid, etag) VALUES (?, ?, ?)')
        _.each(aContactsInfo, (oContactInfo) => {
          oStatement.run([sStorage, oContactInfo.UUID, oContactInfo.ETag])
        })
        oStatement.finalize()
      }

      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let
            aDiffNew = _.differenceWith(oContactsInfoFromApi.Info, oContactsInfoFromDb.Info, _.isEqual),
            aUuidsNew = _.map(aDiffNew, (oInfo) => {
              return oInfo.UUID
            }),
            aDiffOld = _.differenceWith(oContactsInfoFromDb.Info, oContactsInfoFromApi.Info, _.isEqual),
            aUuidsOld = _.map(aDiffOld, (oInfo) => {
              return oInfo.UUID
            })

          this._deleteContactsByUuids(sStorage, aUuidsOld, true).then(
            () => {
              _addContactsInfo(sStorage, aDiffNew)
              oDb
                .prepare('UPDATE contacts_storages SET ctag = ? WHERE storage = ?', oContactsInfoFromApi.CTag, sStorage)
                .run()
                .finalize((oError) => {
                  if (oError) {
                    reject({ sMethod: 'setContactsInfo', oError })
                  } else {
                    resolve(aUuidsNew)
                  }
                })
              },
            (oResult) => {
              reject(oResult)
            }
          )
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
        (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getContactsUidsByUids', oError })
            } else {
              let aUuids = []
              _.each(aRows, (oRow) => {
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

  setContacts: function ({ sStorage, aContacts, bCreateInfo }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let aUuids = aContacts.map((oContact)=> { return oContact.UUID })
          this._deleteContactsByUuids(sStorage, aUuids, false).then(
            () => {
              let sFieldsDbNames = _.map(aContactDbMap, (oContactDbField) => {
                return oContactDbField.DbName
              }).join(', ')
              let sQuestions = aContactDbMap.map(() => { return '?' }).join(',')
              let oStatement = oDb.prepare('INSERT INTO contacts (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
              let oInfoStatement = oDb.prepare('INSERT INTO contacts_info (storage, uuid, etag) VALUES (?, ?, ?)')
              _.each(aContacts, (oContact) => {
                let aParams = dbHelper.prepareInsertParams(oContact, aContactDbMap)
                oStatement.run(aParams)
                if (bCreateInfo) {
                  oInfoStatement.run([oContact.Storage, oContact.UUID, oContact.ETag])
                }
              })
              oStatement.finalize((oError) => {
                if (oError) {
                  reject({ sMethod: 'setContacts', oError })
                } else {
                  resolve()
                }
              })
              oInfoStatement.finalize()
            },
            (oResult) => {
              reject(oResult)
            }
          )
        })
      } else {
        reject({ sMethod: 'setContacts', sError: 'No DB connection' })
      }
    })
  },

  getContacts: function ({ sStorage, sGroupUUID, sSearch, iPerPage, iPage }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        let { sCountSql, aCountParams, sSql, aParams } = _getContactsSql({ sStorage, sGroupUUID, sSearch, iPerPage, iPage })
        oDb.get(sCountSql, aCountParams, (oError, oRow) => {
          let iCount = typesUtils.pInt(oRow && oRow.count)
          oDb.all(sSql,
            aParams,
            (oError, aRows) => {
                if (oError) {
                  reject({ sMethod: 'getContacts', oError })
                } else {
                  let aContacts = dbHelper.prepareDataFromDb(aRows, aContactDbMap)
                  if (iCount === 0) {
                    iCount = aContacts.length
                  }
                  resolve({ aContacts, iCount })
                }
              }
            )
        })
      } else {
        reject({ sMethod: 'getContacts', sError: 'No DB connection' })
      }
    })
  },

  getContactsByEmails: function (aEmails) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(async () => {
          let aContacts = []
          let bError = false
          if (typesUtils.isNonEmptyArray(aEmails)) {
            let iChunkLen = 998
            for (let iIndex = 0, iCount = aEmails.length; iIndex < iCount && bError === false; iIndex += iChunkLen) {
              let aEmailsChunk = aEmails.slice(iIndex, iIndex + iChunkLen)
              await this._getContactsLessThan999ByEmails(aEmailsChunk).then(
                (aContactsChunk) => {
                  if (_.isArray(aContactsChunk)) {
                    aContacts = aContacts.concat(aContactsChunk)
                  }
                },
                (oResult) => {
                  bError = true
                  reject(oResult)
                }
              )
            }
          }
          if (!bError) {
            resolve(aContacts)
          }
        })
      } else {
        reject({ sMethod: 'getContactsByEmails', sError: 'No DB connection' })
      }
    })
  },

  _getContactsLessThan999ByEmails: function (aEmails) {
    return new Promise((resolve, reject) => {
      aEmails = aEmails.slice(0, 998)
      let aWhere = _.map(aEmails, () => { return 'view_email = ?' })
      let aParams = (['collected']).concat(aEmails)
      let sSql = 'SELECT * FROM contacts WHERE storage != ? AND (' + aWhere.join(' OR ') + ')'
      oDb.all(
        sSql,
        aParams,
        (oError, aRows) => {
          if (oError) {
            reject({ sMethod: 'getContactsByEmails', oError })
          } else {
            let aContacts = dbHelper.prepareDataFromDb(aRows, aContactDbMap)
            resolve(aContacts)
          }
        }
      )
    })
  },

  getFrequentlyUsedContacts: function ({ sSearch }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        let sSql = `SELECT *, frequency/((CAST(JULIANDAY('now', '+1 day') AS INT) - CAST(JULIANDAY(date_modified) AS INT))/30 + 1) AS age_score FROM contacts
                    WHERE view_email <> '' AND (view_email LIKE ? OR full_name LIKE ?)
                    ORDER BY age_score COLLATE NOCASE DESC
                    LIMIT 20 OFFSET 0`
        oDb.all(
          sSql,
          ['%' + sSearch + '%', '%' + sSearch + '%'],
          (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getFrequentlyUsedContacts', oError })
            } else {
              let aContacts = dbHelper.prepareDataFromDb(aRows, aContactDbMap)
              resolve({ aContacts })
            }
          }
        )
      } else {
        reject({ sMethod: 'getFrequentlyUsedContacts', sError: 'No DB connection' })
      }
    })
  },

  deleteContacts: function ({ sStorage, aContactsUUIDs }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          this._deleteContactsByUuids(sStorage, aContactsUUIDs, true).then(
            () => {
              resolve()
            },
            (oResult) => {
              reject(oResult)
            },
          )
        })
      } else {
        reject({ sMethod: 'deleteContacts', sError: 'No DB connection' })
      }
    })
  },

  addContactsToGroup: function (sGroupUUID, aContactsToAdd) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE contacts SET group_uuids=? WHERE uuid=?')
          _.each(aContactsToAdd, (oContact) => {
            let aParams = dbHelper.prepareInsertParams({ GroupUUIDs: _.union(oContact.GroupUUIDs, [sGroupUUID])}, _.filter(aContactDbMap, (oContactDbMap) => {
              return oContactDbMap.DbName === 'group_uuids'
            }))
            aParams = aParams.concat([oContact.UUID])
            oStatement.run(aParams)
          })
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'addContactsToGroup', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'addContactsToGroup', sError: 'No DB connection' })
      }
    })
  },

  removeContactsFromGroup: function (sGroupUUID, aContactsToRemove) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE contacts SET group_uuids=? WHERE uuid=?')
          _.each(aContactsToRemove, (oContact) => {
            let aParams = dbHelper.prepareInsertParams({ GroupUUIDs: _.without(oContact.GroupUUIDs, sGroupUUID)}, _.filter(aContactDbMap, (oContactDbMap) => {
              return oContactDbMap.DbName === 'group_uuids'
            }))
            aParams = aParams.concat([oContact.UUID])
            oStatement.run(aParams)
          })
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'removeContactsFromGroup', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'removeContactsFromGroup', sError: 'No DB connection' })
      }
    })
  },

  updateSharedContacts: function (sStorage, aContactsUUIDs) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(async () => {
          let bError = false
          if (typesUtils.isNonEmptyArray(aContactsUUIDs)) {
            let iChunkLen = 998
            for (let iIndex = 0, iCount = aContactsUUIDs.length; iIndex < iCount && bError === false; iIndex += iChunkLen) {
              let aContactsUUIDsChunk = aContactsUUIDs.slice(iIndex, iIndex + iChunkLen)
              await this._updateLessThan999SharedContacts(sStorage, aContactsUUIDsChunk).then(
                () => {},
                (oResult) => {
                  bError = true
                  reject(oResult)
                }
              )
            }
          }
          if (!bError) {
            resolve()
          }
        })
      } else {
        reject({ sMethod: 'updateSharedContacts', sError: 'No DB connection' })
      }
    })
  },

  _updateLessThan999SharedContacts: function (sStorage, aContactsUUIDs) {
    return new Promise((resolve, reject) => {
      aContactsUUIDs = aContactsUUIDs.slice(0, 998)
      let sQuestions = aContactsUUIDs.map(() => { return '?' }).join(',')
      let oStatement = oDb.prepare('UPDATE contacts SET storage=? WHERE uuid IN (' + sQuestions + ')')
      let sNewStorage = sStorage === 'personal' ? 'shared' : 'personal'
      let aParams = ([sNewStorage]).concat(aContactsUUIDs)
      oStatement.run(aParams)
      oStatement.finalize((oError) => {
        if (oError) {
          reject({ sMethod: 'updateSharedContacts', oError })
        } else {
          resolve()
        }
      })
    })
  },
}
