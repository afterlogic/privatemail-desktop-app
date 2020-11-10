import _ from 'lodash'

import dbManager from './db-manager.js'

import contactsDbManager from '../contacts/db-manager.js'
import contactsManager from '../contacts/manager.js'

export default {
  start: function (oDb) {
    return new Promise((resolve, reject) => {
      oDb.serialize(async () => {
        oDb.run('ALTER TABLE accounts ADD COLUMN extend TEXT')
        oDb.run('ALTER TABLE accounts ADD COLUMN server_allow_edit_domains TEXT', [], function (oError) {
          resolve()
        })
      })
    })
  },
}
