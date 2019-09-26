import foldersManager from '../managers/folders.js'

const sqlite3 = require('sqlite3').verbose()

export default {
  getFolders: function (iAccountId) {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('privatemail.db', (err) => {
        if (err === null) {
          db.serialize(function() {
            let stmt = db.prepare('SELECT list FROM folders WHERE acct_id = ?');
            stmt.each(iAccountId, function(err, row) {
              if (row && typeof row.list === 'string' && row.list !== '') {
                resolve(foldersManager.populateFolderList(JSON.parse(row.list)))
              } else {
                reject({event: 'db-get-folders', err, row})
              }
            }, function(err, count) {
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
      let db = new sqlite3.Database('privatemail.db', (err) => {
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
}
