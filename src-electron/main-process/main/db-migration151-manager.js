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
        oDb.run('ALTER TABLE messages ADD COLUMN html_raw TEXT', [], (oError) => {
          if (oError) {
            _logMigrationError('Error while adding text_search field', oError)
          }
          resolve()
        })
      })
    })
  },
}
