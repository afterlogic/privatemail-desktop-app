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
        oDb.all(
          'SELECT * FROM messages WHERE text_search IS NULL',
          [],
          (oError, aRows) => {
            if (oError) {
              _logMigrationError('oError selecting from messages table', oError)
              reject({ sError: 'oError selecting from messages table', oError })
            } else if (!_.isArray(aRows)) {
              _logMigrationError('oError selecting from messages table: aRows is not an array')
              reject({ sError: 'oError selecting from messages table' })
            } else {
              dbManager.updateMigrationStatus({ iApproximateTimeSeconds: Math.round(aRows.length / 15), iStartedTime: moment().unix()})
              this._updateMessagesRows(oDb, aRows).then(resolve, reject)
            }
          }
        )
      })
    })
  },

  _updateMessagesRows: function (oDb, aRows) {
    return new Promise((resolve, reject) => {
      let oStatement = oDb.prepare('UPDATE messages SET text_search = ? WHERE account_id = ? AND folder = ? AND uid = ?')
      _.each(aRows, (oRow) => {
        let sTextSearch = ''
        sTextSearch = textUtils.unescapeHTMLSymbols(textUtils.htmlToTextSearch(oRow.html))
        let aParams = [
          sTextSearch,
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
