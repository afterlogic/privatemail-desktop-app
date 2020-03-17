// import { app } from 'electron'
import _ from 'lodash'
import moment from 'moment'

import cryptoHelper from '../utils/crypto-helper.js'

import dbMigration122Manager from './db-migration122-manager.js'

import typesUtils from '../../../src/utils/types.js'

let oDb = null
let oMainWindow = null

let oMigrationStatus = {}

let aVersionChangesData = [
  {
    Version: '1.2.2',
    Handler: async function () {
      await dbMigration122Manager.start(oDb).then(
        () => {},
        (mResult) => {
          if (mResult.sError || mResult.oError) {
            let sError = mResult.sError || ''
            if (sError) {
              if (mResult.oError) {
                sError += ' (' + mResult.oError.message + ')'
              }
            } else if (mResult.oError) {
              sError += mResult.oError.message
            }
            oMigrationStatus.sError = sError
          } else {
            oMigrationStatus.sError = mResult.message
          }
          if (oMainWindow) {
            oMainWindow.webContents.send('main-migration', oMigrationStatus)
          }
        },
      )
    },
  },
  // {
  //   Version: '0.0.4',
  //   Handler: function () {
  //     // // Example of how to add a column to a table:
  //     // oDb.run('ALTER TABLE contacts_info ADD COLUMN column_definition', [], function (oError) {
  //     //   console.log('oError', oError)
  //     // })
  //   },
  // },
  // {
  //   Version: '0.0.5',
  //   Handler: function () {
  //     // // Example of how to drop a column from a table (renaming a column is done the same way):
  //     // // Make sure to import app from electron for this example.
  //     // const dbFullPath = app.getPath('userData') + '/privatemail.db'
  //     // const sqlite3 = require('sqlite3').verbose()
  //     // let oDb1 = new sqlite3.Database(dbFullPath, (oError) => {
  //     //   if (oError === null) {
  //     //     oDb1.serialize(function() {
  //     //       oDb1
  //     //         .exec('BEGIN TRANSACTION')
  //     //         .run('CREATE TABLE contacts_info_backup AS SELECT storage, uuid, etag FROM contacts_info', [], function (oError1) { console.log('oError1', oError1) })
  //     //         .run('DROP TABLE contacts_info', [], function (oError2) { console.log('oError2', oError2) })
  //     //         .run('ALTER TABLE contacts_info_backup RENAME TO contacts_info', [], function (oError3) { console.log('oError3', oError3) })
  //     //         .exec('COMMIT')
  //     //     })
  //     //   }
  //     // })
  //   },
  // },
  // {
  //   Version: '0.1.0',
  //   Handler: function () {
  //     // // Example of how to update data in a table:
  //     // oDb
  //     //   .prepare('UPDATE contacts SET notes = ?', '')
  //     //   .run()
  //     //   .finalize()
  //   },
  // },
]

export default {
  updateMigrationStatus: function (oMigrationPartStatus) {
    oMigrationStatus = _.extend(oMigrationStatus, oMigrationPartStatus)
    if (oMainWindow) {
      oMainWindow.webContents.send('main-migration', oMigrationStatus)
    }
  },

  init: function (oDbConnect, sAppVersion, oPassedMainWindow) {
    oMainWindow = oPassedMainWindow
    return new Promise((resolve, reject) => {
      oDb = oDbConnect
      if (oDb) {
        oDb.serialize(function() {
          oDb.run('CREATE TABLE IF NOT EXISTS user_data (data TEXT)')
          oDb.run('CREATE TABLE IF NOT EXISTS app_data (version TEXT)')
          oDb
            .prepare('SELECT version FROM app_data')
            .get(async (oError, oRow) => {
              const semver = require('semver')
              let sPrevAppVersion = '0.0.0'
              if (typeof(oRow && oRow.version) === 'string') {
                sPrevAppVersion = semver.valid(oRow.version) || '0.0.0'
              }
              if (sPrevAppVersion !== '0.0.0' && sPrevAppVersion !== sAppVersion) {
                // apply db changes
                let bFinished = false
                oMigrationStatus.iStartedTime = moment().unix()
                oMainWindow.webContents.send('main-migration', oMigrationStatus)
                for (let i = 0; i < aVersionChangesData.length; i++) {
                  let oData = aVersionChangesData[i]
                  let sVersion = semver.valid(oData.Version)
                  if (sVersion && semver.gt(sVersion, sPrevAppVersion) && _.isFunction(oData.Handler)) {
                    await oData.Handler()
                  }
                }
                bFinished = true
                oMigrationStatus.bFinished = true
                oMainWindow.webContents.send('main-migration', oMigrationStatus)

                if (!oMigrationStatus.sError && !oMigrationStatus.oError) {
                  // save new version to db
                  if (!oRow) {
                    oDb
                      .prepare('INSERT INTO app_data (version) VALUES (?)', sAppVersion)
                      .run()
                      .finalize(resolve)
                  } else {
                    oDb
                      .prepare('UPDATE app_data SET version = ?', sAppVersion)
                      .run()
                      .finalize(resolve)
                  }
                } else {
                  reject()
                }
              } else {
                resolve()
              }
            })
            .finalize()
        })
      }
    })
  },

  getUserData: function () {
    return new Promise((resolve, reject) => {
      if (oMainWindow && !_.isEmpty(oMigrationStatus)) {
        oMainWindow.webContents.send('main-migration', oMigrationStatus)
      }
      if (oDb && oDb.open) {
        oDb
          .prepare('SELECT data FROM user_data')
          .get(function(oError, oRow) {
            if (oError) {
              reject({ sMethod: 'getUserData', oError, oMigrationStatus })
            } else {
              let sData = typeof(oRow && oRow.data) === 'string' ? oRow.data : ''
              let oUserData = typesUtils.pStringToJson(sData)
              if (typeof(oUserData && oUserData.user && oUserData.user.authToken) === 'string') {
                oUserData.user.authToken = cryptoHelper.decrypt(oUserData.user.authToken)
              }
              if (typesUtils.isNotNullObject(oUserData)) {
                oUserData.oMigrationStatus = oMigrationStatus
              }
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
    if (typeof(oUserData && oUserData.user && oUserData.user.authToken) === 'string') {
      oUserData.user.authToken = cryptoHelper.encrypt(oUserData.user.authToken)
    }
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
