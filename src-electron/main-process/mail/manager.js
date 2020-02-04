import { ipcMain } from 'electron'
import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

import foldersManager from './folders-manager.js'
import foldersDbManager from './folders-db-manager.js'
import messagesManager from './messages-manager.js'
import messagesDbManager from './messages-db-manager.js'

export default {
  refreshMessagesInNotCurrentFolders: async function (oEvent, iAccountId, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    _.each(aChangedFolders, async function (oTmpFolder) {
      if (oTmpFolder.FullName !== sCurrentFolderFullName) {
        let bHasChanges = await foldersManager.refreshMessagesInfo(iAccountId, oTmpFolder.FullName, sApiHost, sAuthToken)
      }
    })
  },

  refreshMessagesInFolders: function (oEvent, iAccountId, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    let oCurrentFolder = _.find(aChangedFolders, function (oTmpFolder) {
      return oTmpFolder.FullName === sCurrentFolderFullName
    })
    if (oCurrentFolder) {
      foldersManager.refreshMessagesInfo(iAccountId, sCurrentFolderFullName, sApiHost, sAuthToken).then(
        (bHasChangesInCurrentFolder) => {
          oEvent.sender.send('mail-refresh', { bHasChanges: true, bHasChangesInCurrentFolder, sFolderFullName: sCurrentFolderFullName })
          this.refreshMessagesInNotCurrentFolders(oEvent, iAccountId, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
        },
        (oResult) => {
          oEvent.sender.send('mail-refresh', oResult)
        }
      )
    } else {
      oEvent.sender.send('mail-refresh', { bHasChanges: true, bHasChangesInCurrentFolder: false, sFolderFullName: sCurrentFolderFullName })
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
                  foldersDbManager.setFolders({ iAccountId, oFolderList })
                  this.refreshMessagesInFolders(oEvent, iAccountId, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
                } else {
                  oEvent.sender.send('mail-refresh', { bHasChanges: false, bHasChangesInCurrentFolder: false, sFolderFullName: sCurrentFolderFullName })
                }
              }
            )
          } else {
            oEvent.sender.send('mail-refresh', { oError })
          }
        },
      })
    })

    ipcMain.on('mail-get-folders', (oEvent, { iAccountId, sApiHost, sAuthToken }) => {
      foldersDbManager.getFolders(iAccountId).then(
        (oFolderList) => {
          if (_.isEmpty(oFolderList)) {
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetFolders',
              oParameters: { AccountID: iAccountId },
              fCallback: (oResult, oError) => {
                if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
                  let oFolderList = foldersManager.prepareFolderListFromServer(iAccountId, oResult.Namespace || '', oResult.Folders, {})
                  foldersDbManager.setFolders({ iAccountId, oFolderList })
                  oEvent.sender.send('mail-get-folders', oFolderList)
                } else {
                  oEvent.sender.send('mail-get-folders', { oError })
                }
              },
            })
          } else {
            oEvent.sender.send('mail-get-folders', oFolderList)
          }
        },
        (oResult) => {
          oEvent.sender.send('mail-get-folders', oResult)
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

    ipcMain.on('mail-delete-messages', (oEvent, { iAccountId, sFolderFullName, aUids, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'DeleteMessages',
        oParameters: {
          AccountID: iAccountId,
          Folder: sFolderFullName,
          Uids: aUids.join(','),
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-delete-messages', { bResult, oError })
        },
      })
    })

    ipcMain.on('mail-move-messages', (oEvent, { iAccountId, sFolderFullName, sToFolderFullName, aUids, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'MoveMessages',
        oParameters: {
          AccountID: iAccountId,
          Folder: sFolderFullName,
          ToFolder: sToFolderFullName,
          Uids: aUids.join(','),
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-move-messages', { bResult, oError })
        },
      })
    })

    ipcMain.on('mail-set-messages-seen', (oEvent, { iAccountId, sFolderFullName, aUids, bIsSeen, sApiHost, sAuthToken }) => {
      let bAllMessages = !typesUtils.isNonEmptyArray(aUids)
      let sMethod = bAllMessages ? 'SetAllMessagesSeen' : 'SetMessagesSeen'
      let oParameters = {
        AccountID: iAccountId,
        Folder: sFolderFullName,
        SetAction: bIsSeen,
      }
      if (!bAllMessages) {
        oParameters.Uids = aUids.join(',')
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod,
        oParameters,
        fCallback: (bResult, oError) => {
          if (bResult) {
            if (bAllMessages) {
              messagesDbManager.setAllMessagesSeen({ iAccountId, sFolderFullName, bIsSeen })
              foldersDbManager.setAllMessagesSeen({ iAccountId, sFolderFullName, bIsSeen })
            } else {
              messagesDbManager.setMessagesSeen({ iAccountId, sFolderFullName, aUids, bIsSeen })
              foldersDbManager.setMessagesSeen({ iAccountId, sFolderFullName, aUids, bIsSeen })
            }
          }
        },
      })
    })

    ipcMain.on('mail-set-messages-flagged', (oEvent, { iAccountId, sFolderFullName, sUid, bFlagged, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'SetMessageFlagged',
        oParameters: {
          AccountID: iAccountId,
          Folder: sFolderFullName,
          Uids: sUid,
          SetAction: bFlagged,
        },
        fCallback: (bResult, oError) => {
          if (bResult) {
            messagesDbManager.setMessageFlagged({ iAccountId, sFolderFullName, sUid, bFlagged })
            foldersDbManager.setMessageFlagged({ iAccountId, sFolderFullName, sUid, bFlagged })
          }
        },
      })
    })
  },
}
