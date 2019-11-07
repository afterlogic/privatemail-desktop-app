import _ from 'lodash'

let db = null

let aMessageMap = [
  {Name: 'Attachments', DbName: 'attachments', Type: 'TEXT', IsArray: true},
  {Name: 'Bcc', DbName: 'bcc', Type: 'TEXT', IsArray: true},
  {Name: 'Cc', DbName: 'cc', Type: 'TEXT', IsArray: true},
  {Name: 'Custom', DbName: 'custom', Type: 'TEXT', IsArray: true},
  {Name: 'Deleted', DbName: 'deleted', Type: 'INTEGER', IsBool: true},
  {Name: 'DownloadAsEmlUrl', DbName: 'download_as_eml_url', Type: 'TEXT'},
  {Name: 'DraftInfo', DbName: 'draft_info', Type: 'TEXT', IsArray: true},
  {Name: 'Extend', DbName: 'extend', Type: 'TEXT', IsArray: true},
  {Name: 'Folder', DbName: 'folder', Type: 'TEXT'},
  {Name: 'FoundedCIDs', DbName: 'founded_cids', Type: 'TEXT', IsArray: true},
  {Name: 'FoundedContentLocationUrls', DbName: 'founded_content_location_urls', Type: 'TEXT', IsArray: true},
  {Name: 'From', DbName: 'from', Type: 'TEXT', IsArray: true},
  {Name: 'HasAttachments', DbName: 'has_attachments', Type: 'INTEGER', IsBool: true},
  {Name: 'HasExternals', DbName: 'has_externals', Type: 'INTEGER', IsBool: true},
  {Name: 'HasIcalAttachment', DbName: 'has_ical_attachment', Type: 'INTEGER', IsBool: true},
  {Name: 'HasVcardAttachment', DbName: 'has_vcard_attachment', Type: 'INTEGER', IsBool: true},
  {Name: 'Hash', DbName: 'hash', Type: 'TEXT'},
  {Name: 'Headers', DbName: 'headers', Type: 'TEXT'},
  {Name: 'Html', DbName: 'html', Type: 'TEXT'},
  {Name: 'Importance', DbName: 'importance', Type: 'INTEGER'},
  {Name: 'InReplyTo', DbName: 'in_reply_to', Type: 'TEXT'},
  {Name: 'InternalTimeStampInUTC', DbName: 'internal_timestamp_in_utc', Type: 'INTEGER'},
  {Name: 'IsAnswered', DbName: 'is_answered', Type: 'INTEGER', IsBool: true},
  {Name: 'IsFlagged', DbName: 'is_flagged', Type: 'INTEGER', IsBool: true},
  {Name: 'IsForwarded', DbName: 'is_forwarded', Type: 'INTEGER', IsBool: true},
  {Name: 'IsSeen', DbName: 'is_seen', Type: 'INTEGER', IsBool: true},
  {Name: 'MessageId', DbName: 'message_id', Type: 'TEXT'},
  {Name: 'MiddleDate', DbName: 'middle_date', Type: 'TEXT'},
  {Name: 'Plain', DbName: 'plain', Type: 'TEXT'},
  {Name: 'PlainRaw', DbName: 'plain_raw', Type: 'TEXT'},
  {Name: 'ReadingConfirmationAddressee', DbName: 'reading_confirmation_addressee', Type: 'TEXT'},
  {Name: 'ReceivedOrDateTimeStampInUTC', DbName: 'Received_or_date_timestamp_in_utc', Type: 'INTEGER'},
  {Name: 'References', DbName: 'references', Type: 'TEXT'},
  {Name: 'ReplyTo', DbName: 'reply_to', Type: 'TEXT', IsArray: true},
  {Name: 'Rtl', DbName: 'rtl', Type: 'INTEGER', IsBool: true},
  {Name: 'Safety', DbName: 'safety', Type: 'INTEGER', IsBool: true},
  {Name: 'Sender', DbName: 'sender', Type: 'TEXT', IsArray: true},
  {Name: 'Sensitivity', DbName: 'sensitivity', Type: 'INTEGER'},
  {Name: 'ShortDate', DbName: 'short_date', Type: 'TEXT'},
  {Name: 'Size', DbName: 'size', Type: 'INTEGER'},
  {Name: 'Subject', DbName: 'subject', Type: 'TEXT'},
  {Name: 'TextSize', DbName: 'text_size', Type: 'INTEGER'},
  {Name: 'Threads', DbName: 'threads', Type: 'TEXT', IsArray: true},
  {Name: 'TimeStampInUTC', DbName: 'timestamp_in_utc', Type: 'INTEGER'},
  {Name: 'To', DbName: 'to', Type: 'TEXT', IsArray: true},
  {Name: 'Truncated', DbName: 'truncated', Type: 'INTEGER', IsBool: true},
  {Name: 'Uid', DbName: 'uid', Type: 'INTEGER'},
  {Name: 'PartialFlagged', DbName: 'partial_flagged', Type: 'INTEGER', IsBool: true},
  {Name: 'ThreadHasUnread', DbName: 'thread_has_unread', Type: 'INTEGER', IsBool: true},
],

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
    db = oDbConnect
    if (db) {
      db.serialize(function() {
        db.run('CREATE TABLE IF NOT EXISTS messages (acct_id INTEGER, folder_full_name TEXT, message_uid TEXT, message TEXT)')
      })
    }
  },

  getMessages: function ({iAccountId, sFolderFullName, aUids}) {
    return new Promise((resolve, reject) => {
      if (db) {
        let sQuestions = aUids.map(function(){ return '?' }).join(',')
        let aParams = _.union([iAccountId, sFolderFullName], aUids)
        db.all('SELECT message FROM messages WHERE acct_id = ? AND folder_full_name = ? AND message_uid IN (' + sQuestions + ')',
        aParams,
        function(err, rows) {
            if (err) {
              reject({event: 'db-get-messages', err})
            } else {
              let aMessages = []
              _.each(rows, function (row) {
                if (row && typeof row.message === 'string' && row.message !== '') {
                  aMessages.push(JSON.parse(row.message))
                }
              })
              resolve(aMessages)
            }
          }
        )
      } else {
        reject({event: 'db-get-messages', err})
      }
    })
  },

  getMessage: function ({iAccountId, sFolderFullName, sMessageUid}) {
    return new Promise((resolve, reject) => {
      if (db) {
        db.serialize(() => {
          let oMessage = null
          let stmt = db.prepare('SELECT message FROM messages WHERE acct_id = ? AND folder_full_name = ? AND message_uid = ?')
          stmt.each(iAccountId, sFolderFullName, sMessageUid, (err, row) => {
            if (row && typeof row.message === 'string' && row.message !== '') {
              oMessage = JSON.parse(row.message)
            } else {
              reject({event: 'db-get-message', err, row})
            }
          }, (err, count) => {
            if (err) {
              reject({event: 'db-get-message', err, count})
            } else {
              resolve(oMessage)
            }
            stmt.finalize()
          })
        })
      } else {
        reject({event: 'db-get-message', err})
      }
    })
  },

  setMessages: function ({iAccountId, aMessages}) {
    return new Promise((resolve, reject) => {
      if (db) {
        let self = this
        function _setMessageInDb ({ iAccountId, sFolderFullName, sMessageUid, oMessage }) {
          db.serialize(() => {
            let stmt = db.prepare('DELETE FROM messages WHERE acct_id = ? AND folder_full_name = ? AND message_uid = ?', iAccountId, sFolderFullName, sMessageUid)
            stmt.run()
            stmt.finalize()
            stmt = db.prepare('INSERT INTO messages (acct_id, folder_full_name, message_uid, message) VALUES (?, ?, ?, ?)', iAccountId, sFolderFullName, sMessageUid, JSON.stringify(oMessage))
            stmt.run()
            stmt.finalize()
          })
        }

        // sqlite3 cannot work with more than 1 connection, so there will be series of message prepare
        function async(oMessageFromServer, callback) {
          let sFolderFullName = oMessageFromServer.Folder
          let sMessageUid = oMessageFromServer.Uid
          self.getMessage({iAccountId, sFolderFullName, sMessageUid}).then(
            (oMessage) => {
              if (oMessage) {
                _.assign(oMessage, oMessageFromServer)
                _setMessageInDb({ iAccountId, sFolderFullName, sMessageUid, oMessage })
              } else {
                _setMessageInDb ({ iAccountId, sFolderFullName, sMessageUid, oMessage: oMessageFromServer })
              }
              callback(sMessageUid)
            },
            (oResult) => {
              if (oResult.err === null) {
                _setMessageInDb ({ iAccountId, sFolderFullName, sMessageUid, oMessage: oMessageFromServer })
              } else {
                reject(oResult)
              }
              callback(sMessageUid)
            }
          )
        }

        function final() {
          resolve()
        }

        let aMessagesFromServer = _.cloneDeep(aMessages)
        function series(oMessageFromServer) {
          if (oMessageFromServer) {
            async(oMessageFromServer, function(sMessageUid) {
              return series(aMessagesFromServer.shift())
            })
          } else {
            return final()
          }
        }
        series(aMessagesFromServer.shift())
      } else {
        reject({event: 'db-set-messages', err})
      }
    })
  },
}
