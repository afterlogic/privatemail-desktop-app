import { ipcMain } from 'electron'
import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'

import foldersManager from './folders-manager.js'
import foldersDbManager from './folders-db-manager.js'
import messagesDbManager from './messages-db-manager.js'

import webApi from '../webApi.js'

export default {
  initSubscriptions: function () {
    ipcMain.on('mail-refresh', (oEvent, iAccountId, sFolderFullName, sApiHost, sAuthToken) => {
    })

    ipcMain.on('mail-get-folders', (oEvent, iAccountId) => {
      foldersDbManager.getFolders(iAccountId).then(
        (oFolderList) => {
          oEvent.sender.send('mail-get-folders', oFolderList)
        },
        (oResult) => {
          oEvent.sender.send('mail-get-folders', null)
          oEvent.sender.send('notification', oResult)
        }
      )
    })

    ipcMain.on('mail-get-messages', (oEvent, { iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, sFilter, sApiHost, sAuthToken }) => {
      if (typesUtils.isNonEmptyString(sSearch) || typesUtils.isNonEmptyString(sSearch)) {
        messagesDbManager.getFilteredMessages({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, sFilter }).then(
          ({ aMessages, iTotalCount, oAdvancedSearch }) => {
            oEvent.sender.send('mail-get-messages', { iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, oAdvancedSearch, sFilter, aMessages, iTotalCount })
          },
          (oResult) => {
            oEvent.sender.send('mail-get-messages', oResult)
          }
        )
      } else {
        foldersManager.getMessagesInfo({ iAccountId, sFolderFullName, sApiHost, sAuthToken }).then(
          (aMessagesInfo) => {
            if (_.isArray(aMessagesInfo)) {
              messagesDbManager.getMessages({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, aMessagesInfo }).then(
                ({ aMessages, iTotalCount }) => {
                  oEvent.sender.send('mail-get-messages', { iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, sFilter, aMessages, iTotalCount })
                },
                (oResult) => {
                  oEvent.sender.send('mail-get-messages', oResult)
                }
              )
            } else {
              oEvent.sender.send('mail-get-messages', { sError: 'There is no messages info for ' + sFolderFullName + ' folder.' })
            }
          },
          (oResult) => {
            oEvent.sender.send('mail-get-messages', oResult)
          }
        )
      }
    })
  },
}
