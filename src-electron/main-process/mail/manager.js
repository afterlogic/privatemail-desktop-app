import { ipcMain } from 'electron'
import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

import accountsDbManager from './accounts-db-manager.js'
import foldersManager from './folders-manager.js'
import foldersDbManager from './folders-db-manager.js'
import messagesManager from './messages-manager.js'
import messagesDbManager from './messages-db-manager.js'

export default {
  _refreshMessagesInNotCurrentFolders: async function (iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    _.each(aChangedFolders, async function (oTmpFolder) {
      if (oTmpFolder.FullName !== sCurrentFolderFullName) {
        await foldersManager.refreshMessagesInfo(iAccountId, bUseThreading, oTmpFolder.FullName, oTmpFolder.Type, sApiHost, sAuthToken)
      }
    })
  },

  _deleteFoldersInformation: async function (iAccountId, aFoldersToDelete) {
    _.each(aFoldersToDelete, async function (oTmpFolder) {
      await foldersDbManager.deleteMessagesInfo({ iAccountId, sFolderFullName: oTmpFolder.FullName })
    })
  },

  refreshMessagesInFolders: function (oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    let oCurrentFolder = _.find(aChangedFolders, function (oTmpFolder) {
      return oTmpFolder.FullName === sCurrentFolderFullName
    })
    if (oCurrentFolder) {
      foldersManager.refreshMessagesInfo(iAccountId, bUseThreading, sCurrentFolderFullName, oCurrentFolder.Type, sApiHost, sAuthToken).then(
        (bHasChangesInCurrentFolder) => {
          oEvent.sender.send('mail-refresh', { bHasChanges: true, bHasChangesInCurrentFolder, sFolderFullName: sCurrentFolderFullName })
          this._refreshMessagesInNotCurrentFolders(iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
        },
        (oResult) => {
          oEvent.sender.send('mail-refresh', oResult)
        }
      )
    } else {
      oEvent.sender.send('mail-refresh', { bHasChanges: true, bHasChangesInCurrentFolder: false, sFolderFullName: sCurrentFolderFullName })
    }
  },

  _refreshFolderTreeFromServer: function (oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken) {
    webApi.sendRequest({
      sApiHost,
      sAuthToken,
      sModule: 'Mail',
      sMethod: 'GetFolders',
      oParameters: { AccountID: iAccountId },
      fCallback: (oResult, oError) => {
        if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
          foldersDbManager.getFolders(iAccountId).then(
            (oFolderListFromDb) => {
              let aFoldersToRetrieve = []
              let aFoldersToDelete = []
              let oFlatFoldersFromDb = oFolderListFromDb && oFolderListFromDb.Tree ? foldersManager.getFlatFolders(oFolderListFromDb.Tree) : {}
              let oNewFolderList = foldersManager.prepareFolderListFromServer(iAccountId, oResult.Namespace || '', oResult.Folders, oFlatFoldersFromDb, aFoldersToRetrieve, aFoldersToDelete)
              foldersDbManager.setFolders(iAccountId, oNewFolderList).then(
                () => {
                  this._refreshMessagesInNotCurrentFolders(iAccountId, bUseThreading, aFoldersToRetrieve, '', sApiHost, sAuthToken)
                  this._deleteFoldersInformation(iAccountId, aFoldersToDelete)
                  this._refreshFoldersInformationFromServer(oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken)
                },
                () => {
                  this._refreshFoldersInformationFromServer(oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken)
                },
              )
            },
            (oResult) => {
              this._refreshFoldersInformationFromServer(oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken)
            }
          )
        } else {
          this._refreshFoldersInformationFromServer(oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken)
        }
      },
    })
  },

  _refreshFoldersInformationFromServer: function (oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken) {
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
                foldersDbManager.setFolders(iAccountId, oFolderList)
                this.refreshMessagesInFolders(oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
              } else {
                oEvent.sender.send('mail-refresh', { bHasChanges: false, bHasChangesInCurrentFolder: false, sFolderFullName: sCurrentFolderFullName })
              }
            },
            (oResult) => {
              oEvent.sender.send('mail-refresh', oResult)
            }
          )
        } else {
          oEvent.sender.send('mail-refresh', { oError })
        }
      },
    })
  },

  initSubscriptions: function () {
    ipcMain.on('mail-refresh', (oEvent, { iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, bAllFolders, sApiHost, sAuthToken }) => {
      if (bAllFolders) {
        this._refreshFolderTreeFromServer(oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken)
      } else {
        this._refreshFoldersInformationFromServer(oEvent, iAccountId, bUseThreading, aFoldersToRefresh, sCurrentFolderFullName, sApiHost, sAuthToken)
      }
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
                  let oFolderList = foldersManager.prepareFolderListFromServer(iAccountId, oResult.Namespace || '', oResult.Folders, {}, [], [])
                  foldersDbManager.setFolders(iAccountId, oFolderList)
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

    ipcMain.on('mail-get-messages', (oEvent, { iAccountId, bUseThreading, sFolderFullName, iFolderType, iPage, iMessagesPerPage, sSearch, sFilter, sApiHost, sAuthToken }) => {
      if (typesUtils.isNonEmptyString(sSearch) || typesUtils.isNonEmptyString(sFilter)) {
        messagesDbManager.getFilteredMessages({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, sFilter }).then(
          ({ aMessages, iTotalCount, oAdvancedSearch }) => {
            oEvent.sender.send('mail-get-messages', { iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, oAdvancedSearch, sFilter, aMessages, iTotalCount })
          },
          (oResult) => {
            oEvent.sender.send('mail-get-messages', oResult)
          }
        )
      } else if (typesUtils.isNonEmptyString(sFolderFullName)) {
        foldersManager.getMessagesInfo({ iAccountId, bUseThreading, sFolderFullName, iFolderType, sApiHost, sAuthToken }).then(
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
      } else {
        oEvent.sender.send('mail-get-messages', { sError: 'The folder is empty.' })
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

    ipcMain.on('mail-save-account-settings', (oEvent, { iAccountId, bUseThreading, bSaveRepliesToCurrFolder, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'UpdateAccount',
        oParameters: {
          AccountID: iAccountId,
          UseThreading: bUseThreading,
          SaveRepliesToCurrFolder: bSaveRepliesToCurrFolder,
        },
        fCallback: (oResult, oError) => {
          let bResult = !!oResult
          if (bResult) {
            accountsDbManager.saveAccountSettings(oResult.AccountID, oResult.UseThreading, oResult.SaveRepliesToCurrFolder)
            oEvent.sender.send('mail-save-account-settings', { bResult, iAccountId, bUseThreading: oResult.UseThreading, bSaveRepliesToCurrFolder: oResult.SaveRepliesToCurrFolder, oError })
          } else {
            oEvent.sender.send('mail-save-account-settings', { bResult, oError })
          }
        },
      })
    })

    ipcMain.on('mail-remove-account', (oEvent, { iAccountId, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'DeleteAccount',
        oParameters: {
          AccountID: iAccountId,
        },
        fCallback: (bResult, oError) => {
          if (bResult) {
            accountsDbManager.removeAccount(iAccountId)
          }
          oEvent.sender.send('mail-remove-account', { bResult, iAccountId, oError })
        },
      })
    })

    ipcMain.on('mail-add-new-account', (oEvent, { sName, sEmail, sMainAccountDomain, sPassword, sApiHost, sAuthToken }) => {
      let sNewAccountDomain = _.trim(sEmail).split('@')[1]
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetMailServerByDomain',
        oParameters: {
          'Domain': sNewAccountDomain,
          'AllowWildcardDomain': true,
        },
        fCallback: (oResult, oError) => {
          let oServer = null
          if (oResult && typeof oResult.Server !== 'undefined' && typeof oResult.FoundWithWildcard !== 'undefined') {
            if (oResult.FoundWithWildcard) {
              if (sNewAccountDomain === sMainAccountDomain) {
                oServer = oResult.Server
              }
            } else {
              oServer = oResult.Server
            }
          }
          if (oServer) {
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'CreateAccount',
              oParameters: {
                'FriendlyName': sName,
                'Email': sEmail,
                'IncomingLogin': sEmail,
                'IncomingPassword': sPassword,
                'Server': {
                  'ServerId': oServer.ServerId
                }
              },
              fCallback: (oResult, oError) => {
                if (oResult) {
                  accountsDbManager.addAccount(oResult)
                  oEvent.sender.send('mail-add-new-account', { bResult: true, oAccountData: oResult })
                } else {
                  oEvent.sender.send('mail-add-new-account', { bResult: false, oError })
                }
              },
            })
          } else if (oError) {
            oEvent.sender.send('mail-add-new-account', { bResult: false, oError })
          } else {
            oEvent.sender.send('mail-add-new-account', { bResult: false, bUnknownDomain: true })
          }
        },
      })
    })

    ipcMain.on('mail-add-new-account-full', (oEvent, { sName, sEmail, sLogin, sPassword, sImapServer, iImapPort, bImapSsl, sSmtpServer, iSmtpPort, bSmtpSsl, bSmtpAuth, sApiHost, sAuthToken }) => {
      let sSmtpAuthTypeUseUserCredentials = '2'
      let sSmtpAuthTypeNoAuthentication = '0'
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'CreateAccount',
        oParameters: {
          FriendlyName: sName,
          Email: sEmail,
          IncomingLogin: sLogin,
          IncomingPassword: sPassword,
          Server: {
            ServerId: 0,
            Name: sImapServer,
            IncomingServer: sImapServer,
            IncomingPort: iImapPort,
            IncomingUseSsl: bImapSsl,
            OutgoingServer: sSmtpServer,
            OutgoingPort: iSmtpPort,
            OutgoingUseSsl: bSmtpSsl,
            Domains: '',
            SmtpAuthType: bSmtpAuth ? sSmtpAuthTypeUseUserCredentials : sSmtpAuthTypeNoAuthentication,
            SmtpLogin: '',
            SmtpPassword: '',
            EnableSieve: false,
            SievePort: 4190,
            EnableThreading: true,
            UseFullEmailAddressAsLogin: true,
            SetExternalAccessServers: false,
          },
        },
        fCallback: (oResult, oError) => {
          if (oResult) {
            accountsDbManager.addAccount(oResult)
            oEvent.sender.send('mail-add-new-account', { bResult: true, oAccountData: oResult })
          } else {
            oEvent.sender.send('mail-add-new-account', { bResult: false, oError })
          }
        },
      })
    })
  },
}
