import _ from 'lodash'
import moment from 'moment'

import dbHelper from '../utils/db-helper.js'

import typesUtils from '../../../src/utils/types.js'

let oDb = null

let aMessageDbMap = [
  {Name: 'AccountId', DbName: 'account_id', Type: 'INTEGER'},
  {Name: 'Attachments', DbName: 'attachments', Type: 'TEXT', IsObject: true},
  {Name: 'AttachmentsSearch', DbName: 'attachments_search', Type: 'TEXT'},
  {Name: 'Bcc', DbName: 'bcc_addr', Type: 'TEXT'},
  {Name: 'Cc', DbName: 'cc_addr', Type: 'TEXT'},
  {Name: 'Custom', DbName: 'custom', Type: 'TEXT', IsArray: true},
  {Name: 'Deleted', DbName: 'deleted', Type: 'INTEGER', IsBool: true},
  {Name: 'DownloadAsEmlUrl', DbName: 'download_as_eml_url', Type: 'TEXT'},
  {Name: 'DraftInfo', DbName: 'draft_info', Type: 'TEXT', IsArray: true},
  {Name: 'Extend', DbName: 'extend', Type: 'TEXT', IsArray: true},
  {Name: 'Folder', DbName: 'folder', Type: 'TEXT'},
  {Name: 'FoundedCIDs', DbName: 'founded_cids', Type: 'TEXT', IsArray: true},
  {Name: 'FoundedContentLocationUrls', DbName: 'founded_content_location_urls', Type: 'TEXT', IsArray: true},
  {Name: 'From', DbName: 'from_addr', Type: 'TEXT'}, // "from" word is reserved in sql
  {Name: 'HasAttachments', DbName: 'has_attachments', Type: 'INTEGER', IsBool: true},
  {Name: 'HasExternals', DbName: 'has_externals', Type: 'INTEGER', IsBool: true},
  {Name: 'HasIcalAttachment', DbName: 'has_ical_attachment', Type: 'INTEGER', IsBool: true},
  {Name: 'HasVcardAttachment', DbName: 'has_vcard_attachment', Type: 'INTEGER', IsBool: true},
  {Name: 'Hash', DbName: 'hash', Type: 'TEXT'},
  {Name: 'Headers', DbName: 'headers', Type: 'TEXT'},
  {Name: 'Html', DbName: 'html', Type: 'TEXT'},
  {Name: 'HtmlRaw', DbName: 'html_raw', Type: 'TEXT'},
  {Name: 'Importance', DbName: 'importance', Type: 'INTEGER'},
  {Name: 'InReplyTo', DbName: 'in_reply_to', Type: 'TEXT'},
  {Name: 'InternalTimeStampInUTC', DbName: 'internal_timestamp_in_utc', Type: 'INTEGER'},
  {Name: 'IsAnswered', DbName: 'is_answered', Type: 'INTEGER', IsBool: true},
  {Name: 'IsFlagged', DbName: 'is_flagged', Type: 'INTEGER', IsBool: true},
  {Name: 'IsForwarded', DbName: 'is_forwarded', Type: 'INTEGER', IsBool: true},
  {Name: 'IsSeen', DbName: 'is_seen', Type: 'INTEGER', IsBool: true},
  {Name: 'MessageId', DbName: 'message_id', Type: 'TEXT'},
  {Name: 'Plain', DbName: 'plain', Type: 'TEXT'},
  {Name: 'PlainRaw', DbName: 'plain_raw', Type: 'TEXT'},
  {Name: 'ReadingConfirmationAddressee', DbName: 'reading_confirmation_addressee', Type: 'TEXT'},
  {Name: 'ReceivedOrDateTimeStampInUTC', DbName: 'received_or_date_timestamp_in_utc', Type: 'INTEGER'},
  {Name: 'References', DbName: 'references_list', Type: 'TEXT'}, // "references" word is reserved in sql
  {Name: 'ReplyTo', DbName: 'reply_to_addr', Type: 'TEXT'},
  {Name: 'Rtl', DbName: 'rtl', Type: 'INTEGER', IsBool: true},
  {Name: 'Safety', DbName: 'safety', Type: 'INTEGER', IsBool: true},
  {Name: 'Sender', DbName: 'sender_addr', Type: 'TEXT'},
  {Name: 'Sensitivity', DbName: 'sensitivity', Type: 'INTEGER'},
  {Name: 'Size', DbName: 'size', Type: 'INTEGER'},
  {Name: 'Subject', DbName: 'subject', Type: 'TEXT'},
  {Name: 'TextSearch', DbName: 'text_search', Type: 'TEXT'},
  {Name: 'TextSize', DbName: 'text_size', Type: 'INTEGER'},
  {Name: 'Threads', DbName: 'threads', Type: 'TEXT', IsArray: true},
  {Name: 'TimeStampInUTC', DbName: 'timestamp_in_utc', Type: 'INTEGER'},
  {Name: 'To', DbName: 'to_addr', Type: 'TEXT'},
  {Name: 'Truncated', DbName: 'truncated', Type: 'INTEGER', IsBool: true},
  {Name: 'Uid', DbName: 'uid', Type: 'INTEGER'},
  {Name: 'PartialFlagged', DbName: 'partial_flagged', Type: 'INTEGER', IsBool: true},
  {Name: 'ThreadHasUnread', DbName: 'thread_has_unread', Type: 'INTEGER', IsBool: true},
]

export default {
  init: function (oDbConnect) {
    oDb = oDbConnect
    if (oDb && oDb.open) {
      oDb.serialize(() => {
        let aMessageDbFields = _.map(aMessageDbMap, (oMessageDbFieldData) => {
          return oMessageDbFieldData.DbName + ' ' + oMessageDbFieldData.Type
        })
        let sMessageDbFields = aMessageDbFields.join(', ')
        oDb.run('CREATE TABLE IF NOT EXISTS messages (' + sMessageDbFields + ')')
      })
    }
  },

  removeAccount: function (iAccountId) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('DELETE FROM messages WHERE account_id = ?')
          let aParams = [
            iAccountId,
          ]
          oStatement.run(aParams)
          oStatement.finalize((oError) => {
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

  getMessagesUidsByUids: function (iAccountId, sFolderFullName, aUids) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(async () => {
          let aUidsFromDb = []
          let bError = false
          let iChunkLen = 997
          for (let iIndex = 0, iCount = aUids.length; iIndex < iCount && bError === false; iIndex += iChunkLen) {
            let aUidsChunk = aUids.slice(iIndex, iIndex + iChunkLen)
            await this._getMessagesUidsLessThan998ByUids({ iAccountId, sFolderFullName, aUids: aUidsChunk }).then(
              (aUidsFromDbChunk) => {
                if (_.isArray(aUidsFromDbChunk)) {
                  aUidsFromDb = aUidsFromDb.concat(aUidsFromDbChunk)
                }
              },
              (oResult) => {
                bError = true
                reject(oResult)
              }
            )
          }
          if (!bError) {
            resolve(aUidsFromDb)
          }
        })
      } else {
        reject({ sMethod: 'getMessagesUidsByUids', sError: 'No DB connection' })
      }
    })
  },

  _getMessagesUidsLessThan998ByUids: function ({ iAccountId, sFolderFullName, aUids }) {
    return new Promise((resolve, reject) => {
      aUids = aUids.slice(0, 997)
      if (typesUtils.isNonEmptyArray(aUids)) {
        let aWhere = ['account_id = ?', 'folder = ?']
        let aParams = [iAccountId, sFolderFullName]
        let sQuestions = aUids.map(() => { return '?' }).join(',')
        aWhere.push('uid IN (' + sQuestions + ')')
        aParams = aParams.concat(aUids)
        oDb.all(
          'SELECT uid FROM messages WHERE ' + aWhere.join(' AND '),
          aParams,
          (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getMessagesUidsByUids', oError })
            } else {
              resolve(_.map(aRows, (oRow) => {
                return oRow.uid
              }))
            }
          }
        )
      } else {
        reject({ sMethod: 'getMessagesUidsByUids', sError: 'No UIDs to retrieve' })
      }
    })
  },

  getFilteredMessages: function ({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, sFilter }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        let aWhere = ['account_id = ?', 'folder = ?']
        let aParams = [iAccountId, sFolderFullName]
        let oAdvancedSearch = {}

        if (typesUtils.isNonEmptyString(sSearch)) {
          let aWords = ['from:', 'subject:', 'to:', 'email:', 'text:', 'body:', 'date:', 'has:', 'attachments:']
          let aPatterns = _.map(aWords, (sWord) => {
            return '\\b' + sWord
          })
          let rPattern = new RegExp('(' + aPatterns.join('|') + ')', 'g')
          let aContent = sSearch.split(rPattern)
          if (aContent.length > 2) {
            _.each(aContent, (sItem, iIndex) => {
              let bOdd = !!(iIndex % 2)
              if (bOdd && aContent.length > iIndex + 1) {
                let sValue = _.trim(aContent[iIndex + 1])
                switch (sItem) {
                  case 'from:':
                    aWhere.push('from_addr LIKE ?')
                    aParams.push('%' + sValue + '%')
                    oAdvancedSearch.From = sValue
                    break
                  case 'subject:':
                    aWhere.push('subject LIKE ?')
                    aParams.push('%' + sValue + '%')
                    oAdvancedSearch.Subject = sValue
                    break
                  case 'to:':
                    aWhere.push('(to_addr LIKE ? OR cc_addr LIKE ?)')
                    aParams.push('%' + sValue + '%')
                    oAdvancedSearch.To = sValue
                    break
                  case 'email:':
                    aWhere.push('(from_addr LIKE ? OR to_addr LIKE ? OR cc_addr LIKE ? OR bcc_addr LIKE ?)')
                    aParams.push('%' + sValue + '%')
                    aParams.push('%' + sValue + '%')
                    aParams.push('%' + sValue + '%')
                    aParams.push('%' + sValue + '%')
                    oAdvancedSearch.Email = sValue
                    break
                  case 'text:':
                  case 'body:':
                    aWhere.push('text_search LIKE ?')
                    aParams.push('%' + sValue + '%')
                    oAdvancedSearch.Text = sValue
                    break
                  case 'date:':
                    let aDate = sValue.split('/')
                    if (aDate.length === 2) {
                      let sSinceDate = aDate[0]
                      if (typesUtils.isNonEmptyString(sSinceDate)) {
                        let oSinceDate = moment(sSinceDate, 'YYYY.MM.DD').hour(0).minute(0).second(0)
                        aWhere.push('timestamp_in_utc > ?')
                        aParams.push(oSinceDate.unix())
                        oAdvancedSearch.Since = sValue
                      }
                      let sTillDate = aDate[1]
                      if (typesUtils.isNonEmptyString(sTillDate)) {
                        let oTillDate = moment(sTillDate, 'YYYY.MM.DD').hour(23).minute(59).second(59)
                        aWhere.push('timestamp_in_utc < ?')
                        aParams.push(oTillDate.unix())
                        oAdvancedSearch.Till = sValue
                      }
                    }
                    break
                  case 'has:':
                    if (sValue === 'attachments') {
                      aWhere.push('has_attachments = true')
                      oAdvancedSearch.HasAttachments = true
                    }
                    break
                  case 'attachments:':
                    aWhere.push('attachments_search LIKE ?')
                    aParams.push('%' + sValue + '%')
                    oAdvancedSearch.HasAttachments = true
                    oAdvancedSearch.Attachments = sValue
                    break
                }
              }
            })
          } else {
            aWhere.push('(from_addr LIKE ? OR to_addr LIKE ? OR cc_addr LIKE ? OR subject LIKE ? OR attachments_search LIKE ?)')
            aParams.push('%' + sSearch + '%')
            aParams.push('%' + sSearch + '%')
            aParams.push('%' + sSearch + '%')
            aParams.push('%' + sSearch + '%')
            aParams.push('%' + sSearch + '%')
          }
        }

        if (typesUtils.isNonEmptyString(sFilter)) {
          if (sFilter.indexOf('unseen') !== -1) {
            aWhere.push('is_seen = ?')
            aParams.push(false)
          }
          if (sFilter.indexOf('flagged') !== -1) {
            aWhere.push('is_flagged = ?')
            aParams.push(true)
          }
        }

        oDb.get('SELECT COUNT(*) AS count FROM messages WHERE ' + aWhere.join(' AND '), aParams, (oError, oRow) => {
          let iTotalCount = typesUtils.pInt(oRow && oRow.count)
          if (iTotalCount > 0) {
            aParams.push(iMessagesPerPage)
            aParams.push(iMessagesPerPage * (iPage - 1))
            oDb.all(
              'SELECT * FROM messages WHERE ' + aWhere.join(' AND ') + ' ORDER BY timestamp_in_utc COLLATE NOCASE DESC LIMIT ? OFFSET ?',
              aParams,
              (oError, aRows) => {
                if (oError) {
                  reject({ sMethod: 'getFilteredMessages', oError })
                } else {
                  let aMessages = dbHelper.prepareDataFromDb(aRows, aMessageDbMap)
                  resolve({ aMessages, iTotalCount, oAdvancedSearch })
                }
              }
            )
          } else {
            resolve({ aMessages: [], iTotalCount, oAdvancedSearch })
          }
        })
      } else {
        reject({ sMethod: 'getFilteredMessages', sError: 'No DB connection' })
      }
    })
  },

  getMessagesByUids: function (iAccountId, sFolderFullName, aUids) {
    return new Promise((resolve, reject) => {
      if (typesUtils.isNonEmptyArray(aUids)) {
        if (oDb && oDb.open) {
          oDb.serialize(async () => {
            let aMessages = []
            let bError = false
            let iChunkLen = 997
            for (let iIndex = 0, iCount = aUids.length; iIndex < iCount && bError === false; iIndex += iChunkLen) {
              let aUidsChunk = aUids.slice(iIndex, iIndex + iChunkLen)
              await this._getMessagesLessThan998ByUids(iAccountId, sFolderFullName, aUidsChunk).then(
                (aMessagesChunk) => {
                  if (_.isArray(aMessagesChunk)) {
                    aMessages = aMessages.concat(aMessagesChunk)
                  }
                },
                (oResult) => {
                  bError = true
                  reject(oResult)
                }
              )
            }
            if (!bError) {
              resolve(aMessages)
            }
          })
        } else {
          reject({ sMethod: 'getMessagesByUids', sError: 'No DB connection' })
        }
      } else {
        reject({ sMethod: 'getMessagesByUids', sError: 'No UIDs to retrieve' })
      }
    })
  },

  _getMessagesLessThan998ByUids: function (iAccountId, sFolderFullName, aUids) {
    return new Promise((resolve, reject) => {
      if (typesUtils.isNonEmptyArray(aUids)) {
        let aWhere = ['account_id = ?', 'folder = ?']
        let aParams = [iAccountId, sFolderFullName]

        aUids = aUids.slice(0, 997)
        let sQuestions = aUids.map(() => { return '?' }).join(',')
        aWhere.push('uid IN (' + sQuestions + ')')
        aParams = aParams.concat(aUids)
        oDb.all(
          'SELECT * FROM messages WHERE ' + aWhere.join(' AND '),
          aParams,
          (oError, aRows) => {
            if (oError) {
              reject({ sMethod: 'getMessagesByUids', oError })
            } else {
              let aMessages = dbHelper.prepareDataFromDb(aRows, aMessageDbMap)
              resolve(aMessages)
            }
          }
        )
      } else {
        resolve([])
      }
    })
  },

  getStarredMessagesCount: function (iAccountId, sFolderFullName) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT COUNT(*) AS count FROM messages WHERE account_id = ? AND folder = ? AND is_flagged = ?', iAccountId, sFolderFullName, true)
          .get((oError, oRow) => {
            if (oError) {
              reject({ sMethod: 'getStarredMessagesCount', oError })
            } else {
              resolve(oRow.count)
            }
          })
          .finalize()
      } else {
        reject({ sMethod: 'getStarredMessagesCount', sError: 'No DB connection' })
      }
    })
  },

  getMessage: function ({ iAccountId, sFolderFullName, sMessageUid }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT * FROM messages WHERE account_id = ? AND folder = ? AND uid = ?', iAccountId, sFolderFullName, sMessageUid)
          .get((oError, oRow) => {
            if (oError) {
              reject({ sMethod: 'getMessage', oError })
            } else {
              let aMessages = dbHelper.prepareDataFromDb([oRow], aMessageDbMap)
              resolve(typesUtils.isNonEmptyArray(aMessages) ? aMessages[0] : null)
            }
          })
          .finalize()
      } else {
        reject({ sMethod: 'getMessage', sError: 'No DB connection' })
      }
    })
  },

  setMessages: function ({ iAccountId, aMessages }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let sFolderFullName = typesUtils.isNonEmptyArray(aMessages) ? aMessages[0].Folder : ''
          let aUids = aMessages.map((oMessage) => { return oMessage.Uid })
          this.deleteMessages(iAccountId, sFolderFullName, aUids).then(
            () => {
              let sFieldsDbNames = _.map(aMessageDbMap, (oMessageDbFieldData) => {
                return oMessageDbFieldData.DbName
              }).join(', ')
              let sQuestions = aMessageDbMap.map(() => { return '?' }).join(',')
              let oStatement = oDb.prepare('INSERT INTO messages (' + sFieldsDbNames + ') VALUES (' + sQuestions + ')')
              _.each(aMessages, (oMessage) => {
                dbHelper.prepareMessageFields(oMessage, iAccountId)
                let aParams = dbHelper.prepareInsertParams(oMessage, aMessageDbMap)
                oStatement.run(aParams)
              })
              oStatement.finalize((oError) => {
                if (oError) {
                  reject({ sMethod: 'setMessages', oError })
                } else {
                  resolve(aMessages)
                }
              })
            },
            (oResult) => {
              reject(oResult)
            }
          )
        })
      } else {
        reject({ sMethod: 'setMessages', sError: 'No DB connection' })
      }
    })
  },

  setMessagesFlags: function ({ aMessages }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE messages SET is_answered = ?, is_flagged = ?, is_forwarded = ?, is_seen = ? WHERE account_id = ? AND folder = ? AND uid = ?')
          _.each(aMessages, (oMessage) => {
            let aParams = [
              oMessage.IsAnswered,
              oMessage.IsFlagged,
              oMessage.IsForwarded,
              oMessage.IsSeen,
              oMessage.AccountId,
              oMessage.Folder,
              oMessage.Uid,
            ]
            oStatement.run(aParams)
          })
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'setMessagesFlags', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'setMessagesFlags', sError: 'No DB connection' })
      }
    })
  },

  setMessagesSeen: function ({ iAccountId, sFolderFullName, aUids, bIsSeen }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE messages SET is_seen = ? WHERE account_id = ? AND folder = ? AND uid = ?')
          _.each(aUids, (sUid) => {
            let aParams = [
              bIsSeen,
              iAccountId,
              sFolderFullName,
              sUid,
            ]
            oStatement.run(aParams)
          })
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'setMessagesSeen', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'setMessagesSeen', sError: 'No DB connection' })
      }
    })
  },

  setAllMessagesSeen: function ({ iAccountId, sFolderFullName, bIsSeen }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE messages SET is_seen = ? WHERE account_id = ? AND folder = ?')
          let aParams = [
            bIsSeen,
            iAccountId,
            sFolderFullName,
          ]
          oStatement.run(aParams)
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'setAllMessagesSeen', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'setAllMessagesSeen', sError: 'No DB connection' })
      }
    })
  },

  setMessageFlagged: function ({ iAccountId, sFolderFullName, sUid, bFlagged }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE messages SET is_flagged = ? WHERE account_id = ? AND folder = ? AND uid = ?')
          let aParams = [
            bFlagged,
            iAccountId,
            sFolderFullName,
            sUid,
          ]
          oStatement.run(aParams)
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'setMessageFlagged', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'setMessageFlagged', sError: 'No DB connection' })
      }
    })
  },

  removeMessageConfirmAddressee: function ({ iAccountId, sFolderFullName, sUid }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let oStatement = oDb.prepare('UPDATE messages SET reading_confirmation_addressee = \'\' WHERE account_id = ? AND folder = ? AND uid = ?')
          let aParams = [
            iAccountId,
            sFolderFullName,
            sUid,
          ]
          oStatement.run(aParams)
          oStatement.finalize((oError) => {
            if (oError) {
              reject({ sMethod: 'removeMessageConfirmAddressee', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'removeMessageConfirmAddressee', sError: 'No DB connection' })
      }
    })
  },

  deleteMessages: function (iAccountId, sFolderFullName, aUids) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(async () => {
          let bError = false
          if (typesUtils.isNonEmptyArray(aUids)) {
            let iChunkLen = 997
            for (let iIndex = 0, iCount = aUids.length; iIndex < iCount && bError === false; iIndex += iChunkLen) {
              let aUidsChunk = aUids.slice(iIndex, iIndex + iChunkLen)
              await this._deleteMessagesLessThan998(iAccountId, sFolderFullName, aUidsChunk).then(
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
        reject({ sMethod: 'deleteMessages', sError: 'No DB connection' })
      }
    })
  },

  _deleteMessagesLessThan998: function (iAccountId, sFolderFullName, aUids) {
    return new Promise((resolve, reject) => {
      if (aUids.length === 0) {
        resolve()
      } else {
        aUids = aUids.slice(0, 997)
        let sQuestions = aUids.map(() => { return '?' }).join(',')
        let aParams = ([iAccountId, sFolderFullName]).concat(aUids)
        oDb.run('DELETE FROM messages WHERE account_id = ? AND folder = ? AND uid IN (' + sQuestions + ')', aParams, (oError) => {
          if (oError) {
            reject({ sMethod: 'deleteMessages', oError })
          } else {
            resolve()
          }
        })
      }
    })
  },

  deleteAllMessages: function ({ iAccountId, sFolderFullName }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(() => {
          let aParams = [iAccountId, sFolderFullName]
          oDb.run('DELETE FROM messages WHERE account_id = ? AND folder = ?', aParams, (oError) => {
            if (oError) {
              reject({ sMethod: 'deleteAllMessages', oError })
            } else {
              resolve()
            }
          })
        })
      } else {
        reject({ sMethod: 'deleteAllMessages', sError: 'No DB connection' })
      }
    })
  },
}
