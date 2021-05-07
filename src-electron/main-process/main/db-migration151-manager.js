import moment from 'moment'

import _ from 'lodash'

import textUtils from '../../../src/utils/text.js'

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

export default {
  start: function (oDb) {
    return new Promise((resolve, reject) => {
      oDb.serialize(() => {
        oDb.all('SELECT * FROM messages LIMIT 1', [], (oError, aRows) => {
          if (!aRows[0].html_raw) {
            oDb.run('ALTER TABLE messages ADD COLUMN html_raw TEXT', [], (oError) => {
              if (oError) {
                _logMigrationError('Error while adding html_raw field', oError)
                reject({sError: 'Error while adding html_raw field', oError})
              } else {
                oDb.all('SELECT * FROM messages WHERE html_raw IS NULL', [], (oError, aRows) => {
                  this._updateMessagesRows(oDb, aRows).then(resolve, reject)
                })
              }
            })
          } else if (oError) {
            _logMigrationError('Error while adding html_raw field', oError)
            reject({sError: 'Error while adding html_raw field', oError})
          } else {
            resolve()
          }
        })
      })
    })
  },

  _updateMessagesRows: function (oDb, aRows) {
    return new Promise((resolve, reject) => {
      let oStatement = oDb.prepare('UPDATE messages SET html_raw = ? WHERE account_id = ? AND folder = ? AND uid = ?')
      _.each(aRows, (oRow) => {
        let sHtmlRaw = ''
        sHtmlRaw = textUtils.unescapeHTMLSymbols(textUtils.htmlToTextSearch(oRow.html))
        let aParams = [
          sHtmlRaw,
          oRow.account_id,
          oRow.folder,
          oRow.uid,
        ]
        oStatement.run(aParams)
      })

      oStatement.finalize((oError) => {
        if (oError) {
          reject({ sError: 'Error updating messages', oError })
        } else {
          resolve()
        }
      })
    })
  },
}


