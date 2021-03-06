import { ipcMain } from 'electron'
import _ from 'lodash'

import appState from '../utils/app-state.js'
import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

import accountsDbManager from './accounts-db-manager.js'
import foldersManager from './folders-manager.js'
import foldersDbManager from './folders-db-manager.js'
import messagesManager from './messages-manager.js'
import messagesDbManager from './messages-db-manager.js'

export default {
  async _refreshMessagesInNotCurrentFolders (oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    for (const oTmpFolder of aChangedFolders) {
      if (oTmpFolder.FullName !== sCurrentFolderFullName) {
        await foldersManager.refreshMessagesInfo(oEvent, iAccountId, bUseThreading, oTmpFolder.FullName, oTmpFolder.Type, sApiHost, sAuthToken).then(()=>{}, ()=>{})
      }
    }
  },

  async _deleteFoldersInformation (iAccountId, aFoldersToDelete) {
    for (const oTmpFolder of aFoldersToDelete) {
      await foldersDbManager.deleteMessagesInfo({ iAccountId, sFolderFullName: oTmpFolder.FullName }).then(()=>{}, ()=>{})
    }
  },

  _refreshMessagesInFolders (oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken) {
    let oCurrentFolder = _.find(aChangedFolders, function (oTmpFolder) {
      return oTmpFolder.FullName === sCurrentFolderFullName
    })
    if (oCurrentFolder) {
      foldersManager.refreshMessagesInfo(oEvent, iAccountId, bUseThreading, sCurrentFolderFullName, oCurrentFolder.Type, sApiHost, sAuthToken).then(
        (bHasChangesInCurrentFolder) => {
          oEvent.sender.send('mail-refresh', { bHasChanges: true, bHasChangesInCurrentFolder, sFolderFullName: sCurrentFolderFullName })
          this._refreshMessagesInNotCurrentFolders(oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
        },
        (oResult) => {
          oEvent.sender.send('mail-refresh', oResult)
        }
      )
    } else {
      oEvent.sender.send('mail-refresh', { bHasChanges: true, bHasChangesInCurrentFolder: false, sFolderFullName: sCurrentFolderFullName })
      this._refreshMessagesInNotCurrentFolders(oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
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
                  this._refreshMessagesInNotCurrentFolders(oEvent, iAccountId, bUseThreading, aFoldersToRetrieve, '', sApiHost, sAuthToken)
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
    let sLastFoldersInfoTime = appState.setLastFoldersInfoTime(iAccountId)
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
        if (appState.isLastFoldersInfoTime(iAccountId, sLastFoldersInfoTime)) {
          if (oResult && oResult.Counts) {
            foldersDbManager.getFolders(iAccountId).then(
              (oFolderList) => {
                let aChangedFolders = foldersManager.refreshFoldersInformation(oFolderList, oResult.Counts)
                if (aChangedFolders.length > 0) {
                  foldersDbManager.setFolders(iAccountId, oFolderList)
                  this._refreshMessagesInFolders(oEvent, iAccountId, bUseThreading, aChangedFolders, sCurrentFolderFullName, sApiHost, sAuthToken)
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

    ipcMain.on('mail-get-folders', (oEvent, { iAccountId, sApiHost, sAuthToken, bEditAccount}) => {
      foldersDbManager.getFolders(iAccountId).then(
        (oFolderList) => {
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetFolders',
              oParameters: { AccountID: iAccountId },
              fCallback: (oResult, oError) => {
                let oFlatFoldersFromDb = oFolderList && oFolderList.Tree ? foldersManager.getFlatFolders(oFolderList.Tree) : {}
                if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
                  let oFolderList = foldersManager.prepareFolderListFromServer(iAccountId, oResult.Namespace || '', oResult.Folders, oFlatFoldersFromDb, [], [])
                  foldersDbManager.setFolders(iAccountId, oFolderList)
                  if (!bEditAccount) {
                    oEvent.sender.send('mail-get-folders', oFolderList)
                  } else {
                    oEvent.sender.send('mail-get-folders', oFolderList, bEditAccount)
                  }
                } else {
                  oEvent.sender.send('mail-get-folders', { oError })
                }
              },
            })
        },
        (oResult) => {
          oEvent.sender.send('mail-get-folders', oResult, bEditAccount)
        }
      )
    })

    ipcMain.on('mail-get-messages', (oEvent, { iAccountId, bUseThreading, sFolderFullName, iFolderType, iPage, iMessagesPerPage, sSearch, sFilter, sApiHost, sAuthToken, bStarredType = false }) => {
      if (typesUtils.isNonEmptyString(sSearch) || typesUtils.isNonEmptyString(sFilter)) {
        messagesDbManager.getFilteredMessages({ iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, sFilter }).then(
          ({ aMessages, iTotalCount, oAdvancedSearch }) => {
            if (!bStarredType) {
              oEvent.sender.send('mail-get-messages', { iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, oAdvancedSearch, sFilter, aMessages, iTotalCount })
            } else {
              oEvent.sender.send('mail-get-messages', { iAccountId, sFolderFullName, iPage, iMessagesPerPage, sSearch, oAdvancedSearch, sFilter, aMessages, iTotalCount, bStarredType })
            }
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
      appState.resetLastFoldersInfoTime(iAccountId)
      appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
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
          appState.resetLastFoldersInfoTime(iAccountId)
          appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
          if (bResult) {
            foldersManager.deleteMessages(iAccountId, sFolderFullName, aUids).then(
              () => {
                oEvent.sender.send('mail-delete-messages', { bResult, iAccountId, sFolderFullName, aUids, oError })
              },
              (oResult) => {
                oEvent.sender.send('mail-delete-messages', _.extend({ iAccountId, sFolderFullName, aUids }, oResult))
              }
            )
          } else {
            oEvent.sender.send('mail-delete-messages', { bResult, iAccountId, sFolderFullName, aUids, oError })
          }
        },
      })
    })

    ipcMain.on('mail-empty-folder', (oEvent, { iAccountId, sFolderFullName, sApiHost, sAuthToken }) => {
      appState.resetLastFoldersInfoTime(iAccountId)
      appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'ClearFolder',
        oParameters: {
          AccountID: iAccountId,
          Folder: sFolderFullName,
        },
        fCallback: async (bResult, oError) => {
          appState.resetLastFoldersInfoTime(iAccountId)
          appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
          if (bResult) {
            await foldersDbManager.deleteAllMessages({ iAccountId, sFolderFullName })
            await messagesDbManager.deleteAllMessages({ iAccountId, sFolderFullName })
          }
          oEvent.sender.send('mail-empty-folder', { bResult, iAccountId, sFolderFullName, oError })
        },
      })
    })

    ipcMain.on('mail-move-messages', (oEvent, { iAccountId, sFolderFullName, sToFolderFullName, aUids, sApiHost, sAuthToken }) => {
      appState.resetLastFoldersInfoTime(iAccountId)
      appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
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
          appState.resetLastFoldersInfoTime(iAccountId)
          appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
          if (bResult) {
            foldersManager.deleteMessages(iAccountId, sFolderFullName, aUids).then(
              () => {
                oEvent.sender.send('mail-move-messages', { bResult, iAccountId, sFolderFullName, sToFolderFullName, aUids, oError })
              },
              (oResult) => {
                oEvent.sender.send('mail-move-messages', _.assignIn({ iAccountId, sFolderFullName, sToFolderFullName, aUids }, oResult))
              }
            )
          } else {
            oEvent.sender.send('mail-move-messages', { bResult, iAccountId, sFolderFullName, sToFolderFullName, aUids, oError })
          }
        },
      })
    })

    ipcMain.on('mail-set-messages-seen', (oEvent, { iAccountId, sFolderFullName, aUids, bIsSeen, sApiHost, sAuthToken }) => {
      appState.resetLastFoldersInfoTime(iAccountId)
      appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
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
        fCallback: async (bResult, oError) => {
          appState.resetLastFoldersInfoTime(iAccountId)
          appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
          if (bResult) {
            if (bAllMessages) {
              await messagesDbManager.setAllMessagesSeen({ iAccountId, sFolderFullName, bIsSeen })
              await foldersDbManager.setAllMessagesSeen({ iAccountId, sFolderFullName, bIsSeen })
            } else {
              await messagesDbManager.setMessagesSeen({ iAccountId, sFolderFullName, aUids, bIsSeen })
              await foldersDbManager.setMessagesSeen({ iAccountId, sFolderFullName, aUids, bIsSeen })
            }
          }
          oEvent.sender.send('mail-set-messages-seen', { bResult, iAccountId, sFolderFullName, aUids, bIsSeen, oError })
        },
      })
    })

    ipcMain.on('mail-set-messages-flagged', (oEvent, { iAccountId, sFolderFullName, sUid, bFlagged, sApiHost, sAuthToken }) => {
      appState.resetLastFoldersInfoTime(iAccountId)
      appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
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
        fCallback: async (bResult, oError) => {
          appState.resetLastFoldersInfoTime(iAccountId)
          appState.resetLastMessagesInfoTime(iAccountId, sFolderFullName)
          if (bResult) {
            await messagesDbManager.setMessageFlagged({ iAccountId, sFolderFullName, sUid, bFlagged })
            await foldersDbManager.setMessageFlagged({ iAccountId, sFolderFullName, sUid, bFlagged })
          }
          oEvent.sender.send('mail-set-messages-flagged', { bResult, iAccountId, sFolderFullName, sUid, bFlagged, oError })
        },
      })
    })

    ipcMain.on('mail-message-remove-confirm-addressee', (oEvent, { iAccountId, sFolderFullName, sUid }) => {
      messagesDbManager.removeMessageConfirmAddressee({ iAccountId, sFolderFullName, sUid }).then(
        () => {
          oEvent.sender.send('mail-message-remove-confirm-addressee', { bResult: true })
        },
        (oResult) => {
          oEvent.sender.send('mail-message-remove-confirm-addressee', oResult)
        }
      )
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
            accountsDbManager.getAccount({ iAccountId }).then(
              (oAccount) => {
                let bThreadingChanged = oAccount.UseThreading !== oResult.UseThreading
                if (bThreadingChanged) {
                  foldersManager.markAllFolderHasChanges(iAccountId).then(() => {
                    oEvent.sender.send('mail-save-account-settings', { bResult, iAccountId, bUseThreading: oResult.UseThreading, bSaveRepliesToCurrFolder: oResult.SaveRepliesToCurrFolder, oError })
                  }, () => {
                    oEvent.sender.send('mail-save-account-settings', { bResult, iAccountId, bUseThreading: oResult.UseThreading, bSaveRepliesToCurrFolder: oResult.SaveRepliesToCurrFolder, oError })
                  })
                  accountsDbManager.saveAccountSettings({
                    iAccountId: oResult.AccountID,
                    bUseThreading: oResult.UseThreading,
                    bSaveRepliesToCurrFolder: oResult.SaveRepliesToCurrFolder,
                  })
                } else {
                  oEvent.sender.send('mail-save-account-settings', { bResult, iAccountId, bUseThreading: oResult.UseThreading, bSaveRepliesToCurrFolder: oResult.SaveRepliesToCurrFolder, oError })
                }
              },
              (oResult) => {
                oEvent.sender.send('mail-save-account-settings', oResult)
              }
            )
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
            foldersDbManager.removeAccount(iAccountId)
            messagesDbManager.removeAccount(iAccountId)
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

    ipcMain.on('mail-add-new-account-full', (oEvent, { sName, sEmail, sLogin, sPassword, iServerId, sImapServer, iImapPort, bImapSsl, sSmtpServer, iSmtpPort, bSmtpSsl, bSmtpAuth, sApiHost, sAuthToken }) => {
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
            ServerId: iServerId,
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

    ipcMain.on('mail-get-aliases', (oEvent, { sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'CpanelIntegrator',
        sMethod: 'GetAliases',
        oParameters: {},
        fCallback: (oResult, oError) => {
          if (oResult && _.isArray(oResult.ObjAliases)) {
            accountsDbManager.setAliases(oResult.ObjAliases)
            oEvent.sender.send('mail-get-aliases', { aAliasesData: oResult.ObjAliases })
          } else {
            accountsDbManager.getAliases().then(
              (aAliasesData) => {
                oEvent.sender.send('mail-get-aliases', { aAliasesData })
              }
            )
          }
        },
      })
    })

    ipcMain.on('mail-save-alias-settings', (oEvent, { iAccountId, iAliasId, sName, bNoSignature, sSignature, sApiHost, sAuthToken }) => {
      let sMethod = 'UpdateAlias'
      let oParameters = {
        AccountID: iAccountId,
        FriendlyName: sName,
        EntityId: iAliasId
      }
      if (typeof bNoSignature === 'boolean' && typeof sSignature === 'string') {
        sMethod = 'UpdateSignature'
        oParameters = {
          AccountID: iAccountId,
          UseSignature: !bNoSignature,
          Signature: sSignature,
          AliasId: iAliasId,
        }
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'CpanelIntegrator',
        sMethod,
        oParameters,
        fCallback: (bResult, oError) => {
          if (bResult) {
            oEvent.sender.send('mail-save-alias-settings', { bResult, iAccountId, iAliasId, sName, bNoSignature, sSignature, oError })
          } else {
            oEvent.sender.send('mail-save-alias-settings', { bResult, oError })
          }
        },
      })
    })

    ipcMain.on('mail-add-new-alias', (oEvent, { sAliasName, sAliasDomain, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'CpanelIntegrator',
        sMethod: 'AddNewAlias',
        oParameters: {
          AliasName: sAliasName,
          AliasDomain: sAliasDomain,
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-add-new-alias', { bResult, oError })
        },
      })
    })

    ipcMain.on('mail-remove-alias', (oEvent, { sAliasEmail, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'CpanelIntegrator',
        sMethod: 'DeleteAliases',
        oParameters: {
          Aliases: [sAliasEmail],
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-remove-alias', { bResult, oError })
        },
      })
    })

    ipcMain.on('mail-get-identities', (oEvent, { sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetIdentities',
        oParameters: {},
        fCallback: (aResult, oError) => {
          if (_.isArray(aResult)) {
            accountsDbManager.setIdentities(aResult)
            oEvent.sender.send('mail-get-identities', { aIdentitiesData: aResult })
          } else {
            accountsDbManager.getIdentities().then(
              (aIdentitiesData) => {
                oEvent.sender.send('mail-get-identities', { aIdentitiesData })
              }
            )
          }
        },
      })
    })

    ipcMain.on('mail-get-servers', (oEvent, { sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetServers',
        oParameters: {},
        fCallback: (aResult, oError) => {
          if (_.isArray(aResult)) {
            accountsDbManager.setServers(aResult)
            oEvent.sender.send('mail-get-servers', { aServersData: aResult })
          } else {
            accountsDbManager.getServers().then(
              (aServersData) => {
                oEvent.sender.send('mail-get-servers', { aServersData })
              }
            )
          }
        },
      })
    })

    ipcMain.on('mail-save-identity-settings', (oEvent, { iAccountId, iIdentityId, bDefault, sName, sEmail, bNoSignature, sSignature, sApiHost, sAuthToken }) => {
      let bAccountPart = iIdentityId === 0
      let oParameters = {
        AccountID: iAccountId,
        Default: bDefault,
        FriendlyName: sName,
        AccountPart: bAccountPart
      }
      if (!bAccountPart) {
        oParameters.Email = sEmail
        oParameters.EntityId = iIdentityId
      }
      let sMethod = 'UpdateIdentity'
      if (typeof bNoSignature === 'boolean' && typeof sSignature === 'string') {
        sMethod = 'UpdateSignature'
        oParameters = {
          AccountID: iAccountId,
          UseSignature: !bNoSignature,
          Signature: sSignature,
        }
        if (!bAccountPart) {
          oParameters.IdentityId = iIdentityId
        }
      }
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod,
        oParameters,
        fCallback: (bResult, oError) => {
          if (bResult) {
            if (bAccountPart) {
              accountsDbManager.saveAccountSettings({
                iAccountId,
                sFriendlyName: sName,
                bNoSignature,
                sSignature,
              })
            }
            oEvent.sender.send('mail-save-identity-settings', { bResult, iAccountId, iIdentityId, bDefault, sName, sEmail, bNoSignature, sSignature, oError })
          } else {
            oEvent.sender.send('mail-save-identity-settings', { bResult, oError })
          }
        },
      })
    })

    ipcMain.on('mail-add-new-identity', (oEvent, { iAccountId, sName, sEmail, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'CreateIdentity',
        oParameters: {
          AccountID: iAccountId,
          Default: false,
          FriendlyName: sName,
          AccountPart: false,
          Email: sEmail,
        },
        fCallback: (iNewIdentityId, oError) => {
          if (typeof iNewIdentityId === 'number') {
            oEvent.sender.send('mail-add-new-identity', { bResult: true, iNewIdentityId, iAccountId })
          } else {
            oEvent.sender.send('mail-add-new-identity', { bResult: false, oError })
          }
        },
      })
    })

    ipcMain.on('mail-remove-identity', (oEvent, { iAccountId, iIdentityId, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'DeleteIdentity',
        oParameters: {
          AccountID: iAccountId,
          EntityId: iIdentityId,
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-remove-identity', { bResult, oError })
        },
      })
    })

    ipcMain.on('mail-change-password', (oEvent, { iAccountId, sCurrentPassword, sNewPassword, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'ChangePassword',
        oParameters: {
          AccountId: iAccountId,
          CurrentPassword: sCurrentPassword,
          NewPassword: sNewPassword,
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-change-password', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-save-note', (oEvent, { iAccountId, sFolderFullName, messageUid, sApiHost, sAuthToken, sText, sSubject }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'MailNotesPlugin',
        sMethod: 'SaveNote',
        oParameters: {
          AccountID: iAccountId,
          FolderFullName: sFolderFullName,
          MessageUid: messageUid,
          Text: sText,
          Subject: sSubject
        },
        fCallback: (bResult) => {
          oEvent.sender.send('mail-save-note', {bResult})
        },
      })
    })
    ipcMain.on('mail-subscribe-folder', (oEvent, { sApiHost, sAuthToken, iAccountId, sFolderName, bSetAction }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'SubscribeFolder',
        oParameters: {
          AccountID: iAccountId,
          Folder: sFolderName,
          SetAction: bSetAction
        },
        fCallback: (bResult) => {
          if (bResult) {
            oEvent.sender.send('mail-subscribe-folder-reject', {bResult})
          }
        },
      })
    })
    ipcMain.on('mail-delete-folder', (oEvent, { sApiHost, sAuthToken, iAccountId, sFolderFullName }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'DeleteFolder',
        oParameters: {
          AccountID: iAccountId,
          Folder: sFolderFullName
        },
        fCallback: (bResult, bError) => {
          if (bResult) {
            oEvent.sender.send('mail-delete-folder', {bResult, bError})
          }
        },
      })
    })
    ipcMain.on('mail-create-folder', (oEvent, { sFolderParentFullNameRaw, sFolderName, sDelimiter, iAccountId, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'CreateFolder',
        oParameters: {
          AccountID: iAccountId,
          FolderNameInUtf8: sFolderName,
          FolderParentFullNameRaw: sFolderParentFullNameRaw,
          Delimiter: sDelimiter

        },
        fCallback: (bResult, oError) => {
            oEvent.sender.send('mail-create-folder', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-setup-system-folder', (oEvent, { sApiHost, sAuthToken, oParameters }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'SetupSystemFolders',
        oParameters: oParameters,
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-setup-system-folder', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-change-folder-name', (oEvent, { sApiHost, sAuthToken, iAccountId, sPrevFolderFullName, sNewFolderFullName }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'RenameFolder',
        oParameters: {
          AccountID: iAccountId,
          PrevFolderFullNameRaw: sPrevFolderFullName,
          NewFolderNameInUtf8: sNewFolderFullName
        },
        fCallback: (bResult, bError) => {
          if (bResult) {
            oEvent.sender.send('mail-change-folder-name', {bResult, bError})
          }
        },
      })
    })
    ipcMain.on('mail-update-forward', (oEvent, { sApiHost, sAuthToken, oParameters }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'UpdateForward',
        oParameters: oParameters,
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-update-forward', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-get-forward', (oEvent, { sApiHost, sAuthToken, iAccountId }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetForward',
        oParameters: {
          AccountID: iAccountId
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-get-forward', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-update-autoresponder', (oEvent, { sApiHost, sAuthToken, oParameters }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'UpdateAutoresponder',
        oParameters: oParameters,
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-update-autoresponder', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-get-autoresponder', (oEvent, { sApiHost, sAuthToken, iAccountId }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetAutoresponder',
        oParameters: {
          AccountID: iAccountId
        },
        fCallback: (bResult, oError) => {
          oEvent.sender.send('mail-get-autoresponder', { bResult, oError })
        },
      })
    })
    ipcMain.on('mail-get-quota', (oEvent, { iAccountId, sApiHost, sAuthToken }) => {
      webApi.sendRequest({
        sApiHost,
        sAuthToken,
        sModule: 'Mail',
        sMethod: 'GetQuota',
        oParameters: {
          AccountID: iAccountId
        },
        fCallback: async (oResult, oError) => {
          oEvent.sender.send('mail-get-quota', { oResult, iAccountId, oError })
        },
      })
    })
  },
}
