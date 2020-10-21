import _ from 'lodash'

import dbManager from './db-manager.js'

import contactsDbManager from '../contacts/db-manager.js'
import contactsManager from '../contacts/manager.js'

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
        let oEvent = {
          sender: {
            send: (sEventName, { bHasChanges, sStorage, oError }) => {
              if (sEventName === 'contacts-refresh' && (sStorage === 'personal' || oError)) {
                resolve()
              }
            }
          }
        }
        contactsManager.refreshStorages(oEvent, { sApiHost, sAuthToken }, )
      })
    })
  },
}
