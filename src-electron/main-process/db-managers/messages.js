import _ from 'lodash'
import dateUtils from '../../../src/utils/date'

const sqlite3 = require('sqlite3').verbose()

export default {
  init: function () {
    let db = new sqlite3.Database('privatemail.db', (err) => {
      if (err === null) {
        db.serialize(function() {
          db.run('CREATE TABLE IF NOT EXISTS messages (acct_id INTEGER, folder_full_name TEXT, message_uid TEXT, message TEXT)')
          db.close()
        })
      }
    })
  },

  getMessage: function ({iAccountId, sFolderFullName, sMessageUid}) {
    console.log(iAccountId, sFolderFullName, sMessageUid)
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('privatemail.db', (err) => {
        if (err === null) {
          db.serialize(() => {
            let stmt = db.prepare('SELECT message FROM messages WHERE acct_id = ? AND folder_full_name = ? AND message_uid = ?')
            stmt.each(iAccountId, sFolderFullName, sMessageUid, (err, row) => {
              console.log('err, row', err, row)
              if (row && typeof row.message === 'string' && row.message !== '') {
                resolve(JSON.parse(row.message))
              } else {
                reject({event: 'db-get-message', err, row})
              }
            }, (err, count) => {
              reject({event: 'db-get-message', err, count})
              stmt.finalize()
            })
            db.close((err) => {
              if (err) {
                reject({event: 'db-get-message', err})
              }
            })
          })
        } else {
          reject({event: 'db-get-message', err})
        }
    })
    })
  },

  setMessages: function ({iAccountId, aMessages}) {
    return new Promise((resolve, reject) => {

      function _setMessageInDb ({ iAccountId, sFolderFullName, sMessageUid, oMessage }) {
        let db = new sqlite3.Database('privatemail.db', (err) => {
          if (err === null) {
            db.serialize(() => {
              let stmt = db.prepare('DELETE FROM messages WHERE acct_id = ? AND folder_full_name = ? AND message_uid = ?', iAccountId, sFolderFullName, sMessageUid)
              stmt.run()
              stmt.finalize()

              stmt = db.prepare('INSERT INTO messages (acct_id, folder_full_name, message_uid, message) VALUES (?, ?, ?, ?)', iAccountId, sFolderFullName, sMessageUid, JSON.stringify(oMessage))
              stmt.run()
              stmt.finalize()

              db.close((err) => {
                if (err) {
                  reject({event: 'db-set-messages', err})
                }
              })
            })
          } else {
            reject({event: 'db-set-messages', err})
          }
        })
      }

      // sqlite3 cannot work with more than 1 connection, so there will be seties of message prepare
      function async(oMessageFromServer, callback) {
        let sFolderFullName = oMessageFromServer.Folder
        let sMessageUid = oMessageFromServer.Uid
        this.getMessage({iAccountId, sFolderFullName, sMessageUid}).then(
          (oMessage) => {
            console.log('*oMessage', !!oMessage)
            _.assign(oMessage, oMessageFromServer)
            _setMessageInDb({ iAccountId, sFolderFullName, sMessageUid, oMessage })
            callback(sMessageUid)
          },
          (oResult) => {
            console.log('*oResult', oResult)
            if (oResult.err === null) {
              oMessageFromServer.Threads = null
              oMessageFromServer.Deleted = false
              oMessageFromServer.ShortDate = dateUtils.getShortDate(oMessageFromServer.TimeStampInUTC, false)
              oMessageFromServer.MiddleDate = dateUtils.getShortDate(oMessageFromServer.TimeStampInUTC, true)
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
      console.log(aMessagesFromServer?aMessagesFromServer.length : 0)
      function series(oMessageFromServer) {
        console.log('oMessageFromServer', !!oMessageFromServer)
        if (oMessageFromServer) {
          async(oMessageFromServer, function(sMessageUid) {
            console.log('sMessageUid', sMessageUid)
            return series(aMessagesFromServer.shift())
          })
        } else {
          return final()
        }
      }
      series(aMessagesFromServer.shift())

      // _.each(aMessages, (oMessageFromServer) => {
      //   let sFolderFullName = oMessageFromServer.Folder
      //   let sMessageUid = oMessageFromServer.Uid
      //   this.getMessage({iAccountId, sFolderFullName, sMessageUid}).then(
      //     (oMessage) => {
      //       console.log('*oMessage', !!oMessage)
      //       _.assign(oMessage, oMessageFromServer)
      //       _setMessageInDb({ iAccountId, sFolderFullName, sMessageUid, oMessage })
      //     },
      //     (oResult) => {
      //       console.log('*oResult', oResult)
      //       if (oResult.err === null) {
      //         oMessageFromServer.Threads = null
      //         oMessageFromServer.Deleted = false
      //         oMessageFromServer.ShortDate = dateUtils.getShortDate(oMessageFromServer.TimeStampInUTC, false)
      //         oMessageFromServer.MiddleDate = dateUtils.getShortDate(oMessageFromServer.TimeStampInUTC, true)
      //         _setMessageInDb ({ iAccountId, sFolderFullName, sMessageUid, oMessage: oMessageFromServer })
      //       } else {
      //         reject(oResult)
      //       }
      //     }
      //   )
      // })

    })
  },
}
