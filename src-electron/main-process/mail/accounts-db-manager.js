import _ from 'lodash'

import dbHelper from '../utils/db-helper.js'

import typesUtils from '../../../src/utils/types.js'

let oDb = null

let aAccountDbMap = [
  {Name: 'AccountID', DbName: 'account_id', Type: 'INTEGER'},
  {Name: 'AllowAutoresponder', DbName: 'allow_autoresponder', Type: 'INTEGER', IsBool: true},
  {Name: 'AllowFilters', DbName: 'allow_filters', Type: 'INTEGER', IsBool: true},
  {Name: 'AllowForward', DbName: 'allow_forward', Type: 'INTEGER', IsBool: true},
  {Name: 'CanBeUsedToAuthorize', DbName: 'can_be_used_to_authorize', Type: 'INTEGER', IsBool: true},
  {Name: 'Email', DbName: 'email', Type: 'TEXT'},
  {Name: 'EntityId', DbName: 'entity_id', Type: 'INTEGER'},
  {Name: 'FoldersOrder', DbName: 'folders_order', Type: 'TEXT', IsArray: true},
  {Name: 'FriendlyName', DbName: 'friendly_name', Type: 'TEXT'},
  {Name: 'IdUser', DbName: 'id_user', Type: 'INTEGER'},
  {Name: 'IncomingLogin', DbName: 'incoming_login', Type: 'TEXT'},
  {Name: 'IsDisabled', DbName: 'is_disabled', Type: 'INTEGER', IsBool: true},
  {Name: 'SaveRepliesToCurrFolder', DbName: 'save_replies_to_curr_folder', Type: 'INTEGER', IsBool: true},

  {Name: 'ServerDomains', DbName: 'server_domains', Type: 'TEXT'},
  {Name: 'ServerEnableSieve', DbName: 'server_enable_sieve', Type: 'INTEGER', IsBool: true},
  {Name: 'ServerEnableThreading', DbName: 'server_enable_threading', Type: 'INTEGER', IsBool: true},
  {Name: 'ServerEntityId', DbName: 'server_entity_id', Type: 'INTEGER'},
  {Name: 'ServerExternalAccessImapPort', DbName: 'server_external_access_imap_port', Type: 'INTEGER'},
  {Name: 'ServerExternalAccessImapServer', DbName: 'server_external_access_imap_server', Type: 'TEXT'},
  {Name: 'ServerExternalAccessSmtpPort', DbName: 'server_external_access_smtp_port', Type: 'INTEGER'},
  {Name: 'ServerExternalAccessSmtpServer', DbName: 'server_external_access_smtp_server', Type: 'TEXT'},
  {Name: 'ServerIncomingPort', DbName: 'server_incoming_port', Type: 'INTEGER'},
  {Name: 'ServerIncomingServer', DbName: 'server_incoming_server', Type: 'TEXT'},
  {Name: 'ServerIncomingUseSsl', DbName: 'server_incoming_use_ssl', Type: 'INTEGER', IsBool: true},
  {Name: 'ServerName', DbName: 'server_name', Type: 'TEXT'},
  {Name: 'ServerOutgoingPort', DbName: 'server_outgoing_port', Type: 'INTEGER'},
  {Name: 'ServerOutgoingServer', DbName: 'server_outgoing_server', Type: 'TEXT'},
  {Name: 'ServerOutgoingUseSsl', DbName: 'server_outgoing_use_ssl', Type: 'INTEGER', IsBool: true},
  {Name: 'ServerOwnerType', DbName: 'server_owner_type', Type: 'TEXT'},
  {Name: 'ServerSetExternalAccessServers', DbName: 'server_set_external_access_servers', Type: 'INTEGER', IsBool: true},
  {Name: 'ServerSievePort', DbName: 'server_sieve_port', Type: 'INTEGER'},
  {Name: 'ServerSmtpAuthType', DbName: 'server_smtp_auth_type', Type: 'TEXT'},
  {Name: 'ServerSmtpLogin', DbName: 'server_smtp_login', Type: 'TEXT'},
  {Name: 'ServerTenantId', DbName: 'server_tenant_id', Type: 'INTEGER'},
  {Name: 'ServerUUID', DbName: 'server_uuid', Type: 'TEXT'},
  {Name: 'ServerUseFullEmailAddressAsLogin', DbName: 'server_use_full_email_address_as_login', Type: 'INTEGER', IsBool: true},

  {Name: 'ServerId', DbName: 'server_id', Type: 'INTEGER'},
  {Name: 'Signature', DbName: 'signature', Type: 'TEXT'},
  {Name: 'UUID', DbName: 'uuuid', Type: 'TEXT'},
  {Name: 'UseSignature', DbName: 'use_signature', Type: 'INTEGER', IsBool: true},
  {Name: 'UseThreading', DbName: 'use_threading', Type: 'INTEGER', IsBool: true},
  {Name: 'UseToAuthorize', DbName: 'use_to_authorize', Type: 'INTEGER', IsBool: true},
]

export default {
  init: function (oDbConnect) {
    oDb = oDbConnect
    if (oDb && oDb.open) {
      oDb.serialize(function() {
        let aAccountDbFields = _.map(aAccountDbMap, function (oAccountDbFieldData) {
          return oAccountDbFieldData.DbName + ' ' + oAccountDbFieldData.Type
        })
        let sAccountDbFields = aAccountDbFields.join(', ')
        oDb.run('CREATE TABLE IF NOT EXISTS accounts (' + sAccountDbFields + ')')
      })
    }
  },

  getAccounts: function () {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.all(
          'SELECT * FROM accounts',
          [],
          (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getAccounts', oError })
            } else {
              let aAccounts = dbHelper.prepareDataFromDb(aRows, aAccountDbMap)
              resolve(aAccounts)
            }
          }
        )
      } else {
        reject({ sMethod: 'getAccounts', sError: 'No DB connection' })
      }
    })
  },

  getAccount: function ({ iAccountId }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT * FROM accounts WHERE account_id = ?', iAccountId)
          .get(function (oError, oRow) {
            if (oError) {
              reject({ sMethod: 'getAccount', oError })
            } else {
              let aAccounts = dbHelper.prepareDataFromDb([oRow], aAccountDbMap)
              resolve(typesUtils.isNonEmptyArray(aAccounts) ? aAccounts[0] : null)
            }
          })
          .finalize()
      } else {
        reject({ sMethod: 'getAccount', sError: 'No DB connection' })
      }
    })
  },

  setAccounts: function (aAccounts) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          oDb.run('DELETE FROM accounts', [], (oError) => {
            if (oError) {
              reject({ sMethod: 'setMessages', oError })
            } else {
              let sFieldsDbNames = _.map(aAccountDbMap, function (oAccountDbFieldData) {
                return oAccountDbFieldData.DbName
              }).join(', ')
              let sQuestions = aAccountDbMap.map(function () { return '?' }).join(',')
              let oStatement = oDb.prepare('INSERT INTO accounts (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
              _.each(aAccounts, function (oAccount) {
                if (oAccount.Server) {
                  _.each(oAccount.Server, function (mValue, sKey) {
                    oAccount['Server' + sKey] = mValue
                  })
                }
                let aParams = dbHelper.prepareInsertParams(oAccount, aAccountDbMap)
                oStatement.run(aParams)
              })
              oStatement.finalize(function (oError) {
                if (oError) {
                  reject({ sMethod: 'setMessages', oError })
                } else {
                  resolve()
                }
              })
            }
          })
        })
      } else {
        reject({ sMethod: 'setMessages', sError: 'No DB connection' })
      }
    })
  },

  saveAccountSettings: function ({ iAccountId, bUseThreading, bSaveRepliesToCurrFolder, sFriendlyName }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let aValuesToSet = []
          let aParams = []
          if (typeof bUseThreading === 'boolean') {
            aValuesToSet.push('use_threading = ?')
            aParams.push(bUseThreading)
          }
          if (typeof bSaveRepliesToCurrFolder === 'boolean') {
            aValuesToSet.push('save_replies_to_curr_folder = ?')
            aParams.push(bSaveRepliesToCurrFolder)
          }
          if (typeof sFriendlyName === 'string') {
            aValuesToSet.push('friendly_name = ?')
            aParams.push(sFriendlyName)
          }
          let oStatement = oDb.prepare('UPDATE accounts SET ' + aValuesToSet.join(', ') + ' WHERE account_id = ?')
          aParams.push(iAccountId)
          oStatement.run(aParams)
          oStatement.finalize(function (oError) {
            if (oError) {
              reject({ sMethod: 'saveAccountSettings', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'saveAccountSettings', sError: 'No DB connection' })
      }
    })
  },

  removeAccount: function (iAccountId) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('DELETE FROM accounts WHERE account_id = ?')
          let aParams = [
            iAccountId,
          ]
          oStatement.run(aParams)
          oStatement.finalize(function (oError) {
            if (oError) {
              reject({ sMethod: 'removeAccount', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'removeAccount', sError: 'No DB connection' })
      }
    })
  },

  addAccount: function (oAccount) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let sFieldsDbNames = _.map(aAccountDbMap, function (oAccountDbFieldData) {
            return oAccountDbFieldData.DbName
          }).join(', ')
          let sQuestions = aAccountDbMap.map(function () { return '?' }).join(',')
          let oStatement = oDb.prepare('INSERT INTO accounts (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
          if (oAccount.Server) {
            _.each(oAccount.Server, function (mValue, sKey) {
              oAccount['Server' + sKey] = mValue
            })
          }
          let aParams = dbHelper.prepareInsertParams(oAccount, aAccountDbMap)
          oStatement.run(aParams)
          oStatement.finalize(function (oError) {
            if (oError) {
              reject({ sMethod: 'addAccount', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'addAccount', sError: 'No DB connection' })
      }
    })
  },
}
