const sqlite3 = require('sqlite3').verbose()

export default {
  init: function () {
    let db = new sqlite3.Database('privatemail.folders.db', (err) => {
      if (err === null) {
        db.serialize(function() {
          db.run('CREATE TABLE IF NOT EXISTS folders (acct_id INTEGER, list TEXT)')
          db.close()
        })
      }
    })

    let msgInfoDb = new sqlite3.Database('privatemail.messages-info.db', (err) => {
      if (err === null) {
        msgInfoDb.serialize(function() {
          msgInfoDb.run('CREATE TABLE IF NOT EXISTS messages_info (acct_id INTEGER, folder_full_name TEXT, messages_info TEXT)')
          msgInfoDb.close()
        })
      }
    })
  },

  getFolders: function (iAccountId) {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('privatemail.folders.db', (err) => {
        if (err === null) {
          db.serialize(function() {
            let stmt = db.prepare('SELECT list FROM folders WHERE acct_id = ?')
            let oFolderList = null
            stmt.each(iAccountId, function(err, row) {
              if (err) {
                reject({event: 'db-get-folders', err, row})
              } else if (row && typeof row.list === 'string' && row.list !== '') {
                oFolderList = JSON.parse(row.list)
              }
            }, function(err, count) {
              if (err) {
                reject({event: 'db-get-folders', err, count})
              } else {
                resolve(oFolderList)
              }
              stmt.finalize()
            })

            db.close((err) => {
              if (err) {
                reject({event: 'db-get-folders', err})
              }
            })
          })
        } else {
          reject({event: 'db-get-folders', err})
        }
    })
    })
  },

  setFolders: function ({iAccountId, oFolderList}) {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('privatemail.folders.db', (err) => {
        if (err === null) {
          db.serialize(function() {
    
            let stmt = db.prepare('DELETE FROM folders WHERE acct_id = ?', iAccountId)
            stmt.run()
            stmt.finalize()
    
            stmt = db.prepare('INSERT INTO folders (acct_id, list) VALUES (?, ?)', iAccountId, JSON.stringify(oFolderList))
            stmt.run()
            stmt.finalize()
    
            db.close((err) => {
              if (err) {
                reject({event: 'db-set-folders', err})
              }
            })
          })
        } else {
          reject({event: 'db-set-folders', err})
        }
      })
    })
  },

  getMessagesInfo: function ({ iAccountId, sFolderFullName }) {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('privatemail.messages-info.db', (err) => {
        if (err === null) {
          db.serialize(function() {
            let oMessagesInfo = null
            let stmt = db.prepare('SELECT messages_info FROM messages_info WHERE acct_id = ? AND folder_full_name = ?');
            stmt.each(iAccountId, sFolderFullName, function(err, row) {
              if (err) {
                reject({ event: 'db-get-messages-info', err, row })
              } else if (row && typeof row.messages_info === 'string' && row.messages_info !== '') {
                oMessagesInfo = JSON.parse(row.messages_info)
              }
            }, function(err, count) {
              if (err) {
                reject({event: 'db-get-messages-info', err, count})
              } else {
                resolve(oMessagesInfo)
              }
              stmt.finalize()
            })

            db.close((err) => {
              if (err) {
                reject({ event: 'db-get-messages-info', err })
              }
            })
          })
        } else {
          reject({ event: 'db-get-messages-info', err })
        }
      })
    })
  },

  setMessagesInfo: function ({ iAccountId, sFolderFullName, oMessagesInfo }) {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('privatemail.messages-info.db', (err) => {
        if (err === null) {
          db.serialize(function() {

            let stmt = db.prepare('DELETE FROM messages_info WHERE acct_id = ? AND folder_full_name = ?', iAccountId, sFolderFullName)
            stmt.run()
            stmt.finalize()

            stmt = db.prepare('INSERT INTO messages_info (acct_id, folder_full_name, messages_info) VALUES (?, ?, ?)', iAccountId, sFolderFullName, JSON.stringify(oMessagesInfo))
            stmt.run()
            stmt.finalize()

            db.close((err) => {
              if (err === null) {
                resolve()
              } else {
                reject({ event: 'db-set-messages-info', err })
              }
            })
          })
        } else {
          reject({ event: 'db-set-messages-info', err })
        }
      })
    })
  },
}
