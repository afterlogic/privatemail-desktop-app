import moment from 'moment'

import _ from 'lodash'

import textUtils from '../../../src/utils/text.js'

import dbManager from './db-manager.js'

import contactsDbManager from '../contacts/db-manager.js'
import contactsManager from '../contacts/manager.js'

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
      oDb.serialize(async () => {
        oDb.run('DROP TABLE IF EXISTS contacts')
        oDb.run('DROP TABLE IF EXISTS contacts_info')
        oDb.run('DROP TABLE IF EXISTS contacts_storages')
        contactsDbManager.init(oDb)
        let oUserData = await dbManager.getUserData()
        let sApiHost = oUserData?.main?.apiHost
        let sAuthToken = oUserData?.user?.authToken
        contactsManager.refreshGroups(null, { sApiHost, sAuthToken })
        contactsManager.refreshStorages(null, { sApiHost, sAuthToken })
        resolve()
      })
    })
  },
}
