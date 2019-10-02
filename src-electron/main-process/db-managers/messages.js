import _ from 'lodash'

let db = null

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