import { ipcMain } from 'electron'
import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

import foldersManager from './folders-manager.js'
import foldersDbManager from './folders-db-manager.js'
import messagesManager from './messages-manager.js'
import messagesDbManager from './messages-db-manager.js'

export default {
  refreshMessagesInFolders: function (iAccountId, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    let oCurrentFolder = _.find(aChangedFolders, function (oTmpFolder) {
      return oTmpFolder.FullName === sCurrentFolderFullName
    })
    if (oCurrentFolder) {
      foldersManager.refreshMessagesInfo(iAccountId, sCurrentFolderFullName, sApiHost, sAuthToken)
    }
  },

  initSubscriptions: function () {
    ipcMain.on('mail-refresh', (oEvent, { iAccountId, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetRelevantFoldersInformation',
        oParameters: {
          AccountID: iAccountId,
          Folders: aFoldersToRefresh,
          UseListStatusIfPossible: true,
        },
        fCallback: (oResult, oError) => {
          if (oResult && oResult.Counts) {
            foldersDbManager.getFolders(iAccountId).then(
              (oFolderList) => {
                let aChangedFolders = foldersManager.refreshFoldersInformation(oFolderList, oResult.Counts)
                if (aChangedFolders.length > 0) {
                  // foldersDbManager.setFolders({ iAccountId, oFolderList })
                  this.refreshMessagesInFolders(iAccountId, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
                }
              }
            )
          } else {
            oEvent.sender.send('mail-refresh', { oError })
          }
        },
      })
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
      if (typesUtils.isNonEmptyString(sSearch) || typesUtils.isNonEmptyString(sFilter)) {
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
              messagesManager.getMessagesWithThreads({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, aMessagesInfo, sApiHost, sAuthToken }).then(
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
