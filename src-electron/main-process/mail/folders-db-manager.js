let oDb = null

export default {
  init: function (oDbConnect) {
    oDb = oDbConnect
    if (oDb && oDb.open) {
      oDb.serialize(function() {
        oDb.run('CREATE TABLE IF NOT EXISTS folders (acct_id INTEGER, list TEXT)')
        oDb.run('CREATE TABLE IF NOT EXISTS messages_info (acct_id INTEGER, folder_full_name TEXT, messages_info TEXT)')
      })
    }
  },

  getFolders: function (iAccountId) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let oStatement = oDb.prepare('SELECT list FROM folders WHERE acct_id = ?')
          let oFolderList = null
          oStatement.each(iAccountId, function(oError, oRow) {
            if (oError) {
              reject({ sMethod: 'getFolders', oError })
            } else if (oRow && typeof oRow.list === 'string' && oRow.list !== '') {
              oFolderList = JSON.parse(oRow.list)
            }
          }, function(oError) {
            if (oError) {
              reject({ sMethod: 'getFolders', oError })
            } else {
              resolve(oFolderList)
            }
          })
          oStatement.finalize()
        })
      } else {
        reject({ sMethod: 'getFolders', sError: 'No DB connection' })
      }
    })
  },

  setFolders: function ({iAccountId, oFolderList}) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let oStatement = oDb.prepare('DELETE FROM folders WHERE acct_id = ?', iAccountId)
          oStatement.run()
          oStatement.finalize()
          oStatement = oDb.prepare('INSERT INTO folders (acct_id, list) VALUES (?, ?)', iAccountId, JSON.stringify(oFolderList))
          oStatement.run()
          oStatement.finalize()
          resolve()
        })
      } else {
        reject({ sMethod: 'setFolders', sError: 'No DB connection' })
      }
    })
  },

  getMessagesInfo: function ({ iAccountId, sFolderFullName }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let aMessagesInfo = null
          let oStatement = oDb.prepare('SELECT messages_info FROM messages_info WHERE acct_id = ? AND folder_full_name = ?')
          oStatement.each(iAccountId, sFolderFullName, function(oError, oRow) {
            if (oError) {
              reject({ sMethod: 'getMessagesInfo', oError })
            } else if (oRow && typeof oRow.messages_info === 'string' && oRow.messages_info !== '') {
              aMessagesInfo = JSON.parse(oRow.messages_info)
            }
          }, function(oError) {
            if (oError) {
              reject({ sMethod: 'getMessagesInfo', oError })
            } else {
              resolve(aMessagesInfo)
            }
          })
          oStatement.finalize()
        })
      } else {
        reject({ sMethod: 'getMessagesInfo', sError: 'No DB connection' })
      }
    })
  },

  setMessagesInfo: function ({ iAccountId, sFolderFullName, aMessagesInfo }) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let oStatement = oDb.prepare('DELETE FROM messages_info WHERE acct_id = ? AND folder_full_name = ?', iAccountId, sFolderFullName)
          oStatement.run()
          oStatement.finalize()
          oStatement = oDb.prepare('INSERT INTO messages_info (acct_id, folder_full_name, messages_info) VALUES (?, ?, ?)', iAccountId, sFolderFullName, JSON.stringify(aMessagesInfo))
          oStatement.run()
          oStatement.finalize()
          resolve()
        })
      } else {
        reject({ sMethod: 'setMessagesInfo', sError: 'No DB connection' })
      }
    })
  },

  setMessageFlagged: function ({ iAccountId, sFolderFullName, sUid, bFlagged }) {
    this.getMessagesInfo({ iAccountId, sFolderFullName }).then(function (aMessagesInfo) {
      console.log('aMessagesInfo', aMessagesInfo)
      _.each(aMessagesInfo, function (oMessageInfo) {
        if (oMessageInfo.uid === sUid) {
          console.log('oMessageInfo', oMessageInfo)
          return false // break each
        } else {
          // oThreadMessageInfo = _.find(oMessageInfo.)
        }
      })
    })
  },
}
