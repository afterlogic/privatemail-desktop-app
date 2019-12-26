let oDb = null

export default {
  init: function (oDbConnect) {
    oDb = oDbConnect
    if (oDb) {
      oDb.serialize(function() {
        oDb.run('CREATE TABLE IF NOT EXISTS user_data (data TEXT)')
      })
    }
  },

  getUserData: function () {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT data FROM user_data')
          .get(function(oError, oRow) {
            if (oError) {
              reject({ sMethod: 'getUserData', oError })
            } else {
              let sData = typeof(oRow && oRow.data) === 'string' ? oRow.data : ''
              let oUserData = sData !== '' ? JSON.parse(sData) : {}
              resolve(oUserData)
            }
          })
          .finalize()
      } else {
        reject({ sMethod: 'getUserData', sError: 'No DB connection' })
      }
    })
  },

  saveUserData: function (oUserData) {
    return new Promise((resolve, reject) => {
      if (oDb && oDb.open) {
        oDb.serialize(function() {
          let oStatement = oDb.prepare('DELETE FROM user_data')
          oStatement.run()
          oStatement.finalize(function () {
            let sData = JSON.stringify(oUserData)
            oDb.all(
              'INSERT INTO user_data (data) VALUES (?)',
              [sData],
              function (oError) {
                if (oError) {
                  reject({ sMethod: 'saveUserData', oError })
                } else {
                  resolve()
                }
              }
            )
          })
        })

      } else {
        reject({ sMethod: 'saveUserData', sError: 'No DB connection' })
      }
    })
  },
}
