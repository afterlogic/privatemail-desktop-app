import moment from 'moment'

import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'

import dbManager from './db-manager.js'

const log = require('electron-log')
function _logMigrationError (sError, mData) {
  if (mData) {
    log.warn(sError)
    log.warn(mData)
  } else {
    log.warn(sError)
  }
}

let bCatchedLogged = false
let bResultHasObjectLogged = false
let bAddressWithoutCollectionLogged = false
let bAddressNotObjectLogged = false
let bAddressNotStringLogged = false

function _getMigratedAddress (sAddress) {
  if (typesUtils.isNonEmptyString(sAddress)) {
    let oAddress = undefined
    try {
      oAddress = JSON.parse(sAddress)
    } catch (oError) {
      if (!bCatchedLogged) {
        bCatchedLogged = true
        _logMigrationError('Parse address error: catched ' + sAddress, oError)
      }
    }
    if (_.isObject(oAddress)) {
      if (_.isEmpty(oAddress)) {
        return ''
      } else if (_.isArray(oAddress['@Collection'])) {
        let aAddresses = []
        _.each(oAddress['@Collection'], (oAddressData) => {
          if (typesUtils.isNonEmptyString(oAddressData.DisplayName)) {
            if (typesUtils.isNonEmptyString(oAddressData.Email)) {
              aAddresses.push(oAddressData.DisplayName + ' <' + oAddressData.Email + '>')
            } else {
              aAddresses.push(oAddressData.DisplayName)
            }
          } else if (typesUtils.isNonEmptyString(oAddressData.Email)) {
            aAddresses.push(oAddressData.Email)
          }
        })
        let sAddresses = aAddresses.join('\n')
        if (sAddresses.indexOf('@Object') !== -1) {
          if (!bResultHasObjectLogged) {
            bResultHasObjectLogged = true
            _logMigrationError('Parse address error: result has @Object - ' + sAddress, sAddresses)
          }
        }
        return sAddresses
      } else {
        if (!bAddressWithoutCollectionLogged) {
          bAddressWithoutCollectionLogged = true
          _logMigrationError('Parse address error: oAddress doesn\'t have @Collection - ' + sAddress, oAddress)
        }
      }
    } else {
      if (!bAddressNotObjectLogged) {
        bAddressNotObjectLogged = true
        _logMigrationError('Parse address error: oAddress is not an object - ' + sAddress, oAddress)
      }
    }
  } else if (typeof sAddress !== 'string') {
    if (!bAddressNotStringLogged) {
      bAddressNotStringLogged = true
      _logMigrationError('Parse address error: sAddress is not a string - ' + typeof sAddress + ' - ' + sAddress)
    }
  }
  return typesUtils.pString(sAddress)
}

function _getMigratedAttachmentsSearch (sAttachments) {
  let aAttachmentsSearch = []
  if (typesUtils.isNonEmptyString(sAttachments)) {
    let oAttachments = JSON.parse(sAttachments)
    if (_.isObject(oAttachments) && _.isArray(oAttachments['@Collection'])) {
      _.each(oAttachments['@Collection'], (oAttachData) => {
        if (!oAttachData.IsLinked) {
          aAttachmentsSearch.push(oAttachData.FileName)
        }
      })
    }
  }
  return aAttachmentsSearch.join('\n')
}

export default {
  start: function (oDb) {
    return new Promise((resolve, reject) => {
      oDb.serialize(() => {
        oDb.run('ALTER TABLE messages ADD COLUMN attachments_search TEXT', [], (oError) => {
          if (oError) {
            _logMigrationError('Error while adding attachments_search field', oError)
          }
          oDb.run('DROP TABLE IF EXISTS messages_copy', [], (oError) => {
            if (oError) {
              _logMigrationError('Error while droping messages_copy table', oError)
              reject({ sError: 'Error while droping messages_copy table', oError })
            } else {
              oDb.run('CREATE TABLE messages_copy AS SELECT * FROM messages WHERE 0', [], (oError) => {
                if (oError) {
                  _logMigrationError('Error while creating messages_copy table', oError)
                  reject({ sError: 'Error while creating messages_copy table', oError })
                } else {
                  oDb.all(
                    'SELECT * FROM messages',
                    [],
                    (oError, aRows) => {
                      if (oError) {
                        _logMigrationError('oError selecting from messages table', oError)
                        reject({ sError: 'oError selecting from messages table', oError })
                      } else if (!_.isArray(aRows)) {
                        _logMigrationError('oError selecting from messages table: aRows is not an array')
                        reject({ sError: 'oError selecting from messages table' })
                      } else {
                        dbManager.updateMigrationStatus({ iApproximateTimeSeconds: Math.round(aRows.length / 90), iStartedTime: moment().unix()})
                        this._copyMessageDataToClone(oDb, aRows).then(resolve, reject)
                      }
                    }
                  )
                }
              })
            }
          })
        })
      })
    })
  },

  _copyMessageDataToClone: function (oDb, aRows) {
    return new Promise((resolve, reject) => {
      oDb.serialize(() => {
        let oStatement = oDb.prepare(`INSERT INTO messages_copy (
          account_id,
          attachments,
          attachments_search,
          bcc_addr,
          cc_addr,
          custom,
          deleted,
          download_as_eml_url,
          draft_info,
          extend,
          folder,
          founded_cids,
          founded_content_location_urls,
          from_addr,
          has_attachments,
          has_externals,
          has_ical_attachment,
          has_vcard_attachment,
          hash,
          headers,
          html,
          importance,
          in_reply_to,
          internal_timestamp_in_utc,
          is_answered,
          is_flagged,
          is_forwarded,
          is_seen,
          message_id,
          plain,
          plain_raw,
          reading_confirmation_addressee,
          received_or_date_timestamp_in_utc,
          references_list,
          reply_to_addr,
          rtl,
          safety,
          sender_addr,
          sensitivity,
          size,
          subject,
          text_size,
          threads,
          timestamp_in_utc,
          to_addr,
          truncated,
          uid,
          partial_flagged,
          thread_has_unread
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        let iStatementsCount = 0
        _.each(aRows, (oRow) => {
          if (_.isObject(oRow)) {
            iStatementsCount++
            let sBccAddr = _getMigratedAddress(oRow.bcc_addr)
            let sCcAddr = _getMigratedAddress(oRow.cc_addr)
            let sFromAddr = _getMigratedAddress(oRow.from_addr)
            let sReplyToAddr = _getMigratedAddress(oRow.reply_to_addr)
            let sSenderAddr = _getMigratedAddress(oRow.sender_addr)
            let sToAddr = _getMigratedAddress(oRow.to_addr)
            let sAttachmentsSearch = _getMigratedAttachmentsSearch(oRow.attachments)
            let aParams = [
              oRow.account_id,
              oRow.attachments,
              sAttachmentsSearch,
              sBccAddr,
              sCcAddr,
              oRow.custom,
              oRow.deleted,
              oRow.download_as_eml_url,
              oRow.draft_info,
              oRow.extend,
              oRow.folder,
              oRow.founded_cids,
              oRow.founded_content_location_urls,
              sFromAddr,
              oRow.has_attachments,
              oRow.has_externals,
              oRow.has_ical_attachment,
              oRow.has_vcard_attachment,
              oRow.hash,
              oRow.headers,
              oRow.html,
              oRow.importance,
              oRow.in_reply_to,
              oRow.internal_timestamp_in_utc,
              oRow.is_answered,
              oRow.is_flagged,
              oRow.is_forwarded,
              oRow.is_seen,
              oRow.message_id,
              oRow.plain,
              oRow.plain_raw,
              oRow.reading_confirmation_addressee,
              oRow.received_or_date_timestamp_in_utc,
              oRow.references_list,
              sReplyToAddr,
              oRow.rtl,
              oRow.safety,
              sSenderAddr,
              oRow.sensitivity,
              oRow.size,
              oRow.subject,
              oRow.text_size,
              oRow.threads,
              oRow.timestamp_in_utc,
              sToAddr,
              oRow.truncated,
              oRow.uid,
              oRow.partial_flagged,
              oRow.thread_has_unread,
            ]
            oStatement.run(aParams)
          }
        })
        if (iStatementsCount === 0) {
          _logMigrationError('There were no row objects to migrate')
          reject({ sError: 'There were no row objects to migrate' })
        } else {
          oStatement.finalize((oError) => {
            if (oError) {
              _logMigrationError('Error while migrating row objects', oError)
              reject({ sError: 'Error while migrating row objects', oError })
            } else {
              oDb.run('DROP TABLE IF EXISTS messages', [], (oError) => {
                if (oError) {
                  _logMigrationError('Error while droping messages table', oError)
                  reject({ sError: 'Error while droping messages table', oError })
                } else {
                  oDb.run('ALTER TABLE messages_copy RENAME TO messages', [], (oError) => {
                    if (oError) {
                      _logMigrationError('Error while renaming messages_copy table to messages', oError)
                      reject({ sError: 'Error while renaming messages_copy table to messages', oError })
                    } else {
                      resolve()
                    }
                  })
                }
              })
            }
          })
        }
      })
    })
  },
}
