import _ from 'lodash'

import appState from '../utils/app-state.js'
import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

import foldersDbManager from './folders-db-manager.js'
import messagesDbManager from './messages-db-manager.js'

import mailEnums from '../../../src/modules/mail/enums.js'

function _getIconName (sType, sFolderFullName) {
  let sIconName = ''
  switch (sType) {
    case mailEnums.FolderType.Inbox:
      sIconName = 'mail'
      break
    case mailEnums.FolderType.Sent:
      sIconName = 'send'
      break
    case mailEnums.FolderType.Drafts:
      sIconName = 'insert_drive_file'
      break
    case mailEnums.FolderType.Spam:
      sIconName = 'error'
      break
    case mailEnums.FolderType.Trash:
      sIconName = 'delete'
      break
    case mailEnums.FolderType.Starred:
      sIconName = 'star'
      break
  }
  if (sFolderFullName === 'Notes') {
    sIconName = 'edit'
  }
  return sIconName
}

export default {
  getFlatFolders: function (oFolderList) {
    let oFlatFolders = {}

    function _recursive(aFoldersTree) {
      _.each(aFoldersTree, function (oFolder) {
        oFlatFolders[oFolder.FullName] = oFolder

        if (oFolder.SubFolders && oFolder.SubFolders) {
          _recursive(oFolder.SubFolders)
        }
      })
    }

    _recursive(oFolderList)

    return oFlatFolders
  },

  prepareFolderListFromServer: function (iAccountId, sNamespace, oFolderListFromServer, oOldFoldersByNames, aFoldersToRetrieve, aFoldersToDelete) {
    function _recursive(aFoldersTree) {
      let aNewFoldersTree = []
      let bHasSubscribed = false
      _.each(aFoldersTree, function (oFolderFromServer) {
        let oOldFolder = oOldFoldersByNames[oFolderFromServer.FullNameRaw]
        delete oOldFoldersByNames[oFolderFromServer.FullNameRaw]
        let oNewFolder = {
          FullName: oFolderFromServer.FullNameRaw,
          Name: oFolderFromServer.Name,
          Type: oFolderFromServer.Type,
          Delimiter: oFolderFromServer.Delimiter,
          Namespaced: oFolderFromServer.FullNameRaw + oFolderFromServer.Delimiter === sNamespace,
          IconName: _getIconName(oFolderFromServer.Type, oFolderFromServer.FullNameRaw),
          IsSubscribed: oFolderFromServer.IsSubscribed,
          IsSelectable: oFolderFromServer.IsSelectable,
          Exists: oFolderFromServer.Exists,
          HasChanges: oOldFolder ? oOldFolder.HasChanges : false,
          Count: oOldFolder ? oOldFolder.Count : 0,
          UnseenCount: oOldFolder ? oOldFolder.UnseenCount : 0,
          NextUid: oOldFolder ? oOldFolder.NextUid : '',
          Hash: oOldFolder ? oOldFolder.Hash : oFolderFromServer.FullNameRaw,
        }

        oNewFolder.SubFolders = []
        oNewFolder.HasSubscribed = false
        if (oFolderFromServer.SubFolders && oFolderFromServer.SubFolders['@Collection']) {
          let oSubFoldersData = _recursive(oFolderFromServer.SubFolders['@Collection'])
          oNewFolder.SubFolders = oSubFoldersData.Tree
          oNewFolder.HasSubscribed = oSubFoldersData.HasSubscribed
        }
        bHasSubscribed = bHasSubscribed || oNewFolder.Exists && oNewFolder.IsSubscribed || oNewFolder.HasSubscribed

        if (!oOldFolder) {
          aFoldersToRetrieve.push(oNewFolder)
        }
        aNewFoldersTree.push(oNewFolder)
      })

      return {
        Tree: aNewFoldersTree,
        HasSubscribed: bHasSubscribed,
      }
    }

    let aResultNewFoldersData = _recursive(oFolderListFromServer['@Collection'])

    _.each(oOldFoldersByNames, function (oFolderToDelete) {
      aFoldersToDelete.push(oFolderToDelete)
    })

    return {
      AccountId: iAccountId,
      Namespace: sNamespace,
      Count: oFolderListFromServer['@Count'] || 0,
      Tree: aResultNewFoldersData.Tree,
    }
  },

  refreshFoldersInformation: function (oFolderList, aCountsFromServer) {
    let aChangedFolders = []

    function _recursive(oFoldersTree) {
      _.each(oFoldersTree, (oFolder) => {
        let aFolderCounts = aCountsFromServer[oFolder.FullName]
        if (aFolderCounts) {
          let iNewCount = aFolderCounts[0]
          let iUnseenCount = aFolderCounts[1]
          let sNextUid = aFolderCounts[2]
          let sHash = aFolderCounts[3]
          if (iNewCount !== oFolder.Count || iUnseenCount !== oFolder.UnseenCount || sNextUid !== oFolder.NextUid || sHash !== oFolder.Hash) {
            oFolder.HasChanges = true
          }
          oFolder.Count = iNewCount
          oFolder.UnseenCount = iUnseenCount
          oFolder.NextUid = sNextUid
          oFolder.Hash = sHash
        }
        if (oFolder.SubFolders) {
          _recursive(oFolder.SubFolders)
        }
        if (oFolder.HasChanges) {
          aChangedFolders.push(oFolder)
        }
      })
    }

    _recursive(oFolderList && oFolderList.Tree || {})

    return aChangedFolders
  },

  getFolder: function (oFolderList, sFolderFullName) {
    function _recursive(oFoldersTree) {
      let oFoundFolder = null
      _.each(oFoldersTree, (oFolder) => {
        if (oFolder.FullName === sFolderFullName) {
          oFoundFolder = oFolder
          return false // break each
        } else if ((0 === sFolderFullName.indexOf(oFolder.FullName)) && oFolder.SubFolders) {
          oFoundFolder = _recursive(oFolder.SubFolders)
        }
      })
      return oFoundFolder
    }
    return _recursive(oFolderList && oFolderList.Tree || {})
  },

  _getUseThreadingForFolder: function (iFolderType) {
    let bUseThreading = true
    if (iFolderType === mailEnums.FolderType.Drafts || iFolderType === mailEnums.FolderType.Spam || iFolderType === mailEnums.FolderType.Trash) {
      bUseThreading = false
    }
    return bUseThreading
  },

  getMessagesInfo: function ({ iAccountId, bUseThreading, sFolderFullName, iFolderType, sApiHost, sAuthToken }) {
    return new Promise((resolve, reject) => {
      foldersDbManager.getMessagesInfo({ iAccountId, sFolderFullName }).then(
        (aMessagesInfo) => {
          if (_.isArray(aMessagesInfo)) {
            resolve(aMessagesInfo)
          } else {
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetMessagesInfo',
              oParameters: {
                AccountID: iAccountId,
                Folder: sFolderFullName,
                UseThreading: bUseThreading && this._getUseThreadingForFolder(iFolderType),
                SortBy: 'arrival',
                SortOrder: 1,
                Search: '',
                Filter: '',
              },
              fCallback: (aMessagesInfo, oError) => {
                if (_.isArray(aMessagesInfo)) {
                  resolve(aMessagesInfo)
                  foldersDbManager.setMessagesInfo({ iAccountId, sFolderFullName, aMessagesInfo }).then(
                    () => {
                      this._markFolderWithoutChanges({ iAccountId, sFolderFullName })
                    }
                  )
                } else {
                  reject({ sMethod: 'getMessagesInfo', oError, sError: 'No messages info was given from server for "' + sFolderFullName + '" folder' })
                }
              },
            })
          }
        },
        (oResult) => {
          reject(oResult)
        }
      )
    })
  },

  refreshMessagesInfo: function (iAccountId, bUseThreading, sFolderFullName, iFolderType, sApiHost, sAuthToken) {
    return new Promise((resolve, reject) => {
      let sLastMessagesInfoTime = appState.setLastMessagesInfoTime(iAccountId, sFolderFullName)
      foldersDbManager.getMessagesInfo({ iAccountId, sFolderFullName }).then(
        (aMessagesInfoFromDb) => {
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetMessagesInfo',
              oParameters: {
                AccountID: iAccountId,
                Folder: sFolderFullName,
                UseThreading: bUseThreading && this._getUseThreadingForFolder(iFolderType),
                SortBy: 'arrival',
                SortOrder: 1,
                Search: '',
                Filter: '',
              },
              fCallback: (aMessagesInfoFromServer, oError) => {
                if (appState.isLastMessagesInfoTime(iAccountId, sFolderFullName, sLastMessagesInfoTime)) {
                  let { aUidsToDelete, aMessagesInfoToSync, aUidsToRetrieve } = this._updateMessagesInfo(aMessagesInfoFromDb, aMessagesInfoFromServer)
                  this.deleteMessages({ iAccountId, sFolderFullName, aUids: aUidsToDelete }).then(
                    () => {
                      this._syncMessages({ iAccountId, sFolderFullName, aMessagesInfoToSync }).then(
                        () => {
                          this._retrieveMessages({ iAccountId, sFolderFullName, aUids: aUidsToRetrieve, sApiHost, sAuthToken }).then(
                            () => {
                              foldersDbManager.setMessagesInfo({ iAccountId, sFolderFullName, aMessagesInfo: aMessagesInfoFromServer }).then(
                                () => {
                                  let bHasChanges = typesUtils.isNonEmptyArray(aUidsToDelete) || typesUtils.isNonEmptyArray(aMessagesInfoToSync) || typesUtils.isNonEmptyArray(aUidsToRetrieve)
                                  this._markFolderWithoutChanges({ iAccountId, sFolderFullName }).then(
                                    () => {
                                      resolve(bHasChanges)
                                    },
                                    reject
                                  )
                                },
                                reject
                              )
                            },
                            reject
                          )
                        },
                        reject
                      )
                    },
                    reject
                  )
                }
              },
            })
        },
        (oResult) => {
          reject(oResult)
        }
      )
    })
  },

  deleteMessages: function ({ iAccountId, sFolderFullName, aUids }) {
    return new Promise((resolve, reject) => {
      if (!_.isArray(aUids)) {
        reject({ sMethod: 'deleteMessages', sError: 'aUids is not an Array' })
      }
      else if (aUids.length === 0) {
        resolve()
      }
      else {
        foldersDbManager.deleteMessages({ iAccountId, sFolderFullName, aUids }).then(
          () => {
            messagesDbManager.deleteMessages({ iAccountId, sFolderFullName, aUids }).then(resolve, reject)
          }, reject)
      }
    })
  },

  _syncMessages: function ({ iAccountId, sFolderFullName, aMessagesInfoToSync }) {
    return new Promise((resolve, reject) => {
      if (!_.isArray(aMessagesInfoToSync)) {
        reject({ sMethod: '_syncMessages', sError: 'aMessagesInfoToSync is not an Array' })
      }
      else if (aMessagesInfoToSync.length === 0) {
        resolve()
      }
      else {
        let aUids = _.map(aMessagesInfoToSync, function (oMessageInfo) {
          return oMessageInfo.uid
        })
        messagesDbManager.getMessagesByUids({ iAccountId, sFolderFullName, aUids }).then(
          (aMessages) => {
            _.each(aMessages, (oMessage) => {
              let oMessageInfo = _.find(aMessagesInfoToSync, (oTmpMessageInfo) => {
                return oTmpMessageInfo.uid === oMessage.Uid
              })
              if (oMessageInfo) {
                oMessage.IsSeen = (oMessageInfo.flags.indexOf('\\seen') >= 0)
                oMessage.IsFlagged = (oMessageInfo.flags.indexOf('\\flagged') >= 0)
                oMessage.IsAnswered = (oMessageInfo.flags.indexOf('\\answered') >= 0)
                oMessage.IsForwarded = (oMessageInfo.flags.indexOf('$forwarded') >= 0)
              }
            })
            messagesDbManager.setMessagesFlags({ aMessages }).then(resolve, reject)
          },
          reject
        )
      }
    })
  },

  _retrieveMessages: function ({ iAccountId, sFolderFullName, aUids, sApiHost, sAuthToken }) {
    return new Promise(async (resolve, reject) => {
      if (!_.isArray(aUids)) {
        reject({ sMethod: '_retrieveMessages', sError: 'aUids is not an Array' })
      }
      else if (aUids.length === 0) {
        resolve()
      }
      else {
        messagesDbManager.getMessagesUidsByUids({ iAccountId, sFolderFullName, aUids }).then(
          async (aUidsFromDb) => {
            if (!_.isArray(aUidsFromDb)) {
              aUidsFromDb = []
            }
            let aUidsNotInDb = _.difference(aUids, aUidsFromDb)
            let iChunkLen = 50
            for (let iIndex = 0, iUidsCount = aUidsNotInDb.length; iIndex < iUidsCount; iIndex += iChunkLen) {
              let aUidsChunk = aUidsNotInDb.slice(iIndex, iIndex + iChunkLen)
              await this._retrievePartOfMessages({ iAccountId, sFolderFullName, aUids: aUidsChunk, sApiHost, sAuthToken })
            }
            resolve()
          },
          (oResult) => {
            reject(oResult)
          }
        )
      }
    })
  },

  _retrievePartOfMessages: function ({ iAccountId, sFolderFullName, aUids, sApiHost, sAuthToken }) {
    return new Promise((resolve, reject) => {
      if (!_.isArray(aUids)) {
        reject({ sMethod: '_retrieveMessages', sError: 'aUids is not an Array' })
      }
      else if (aUids.length === 0) {
        resolve()
      }
      else {
        let oParameters = {
          AccountID: iAccountId,
          Folder: sFolderFullName,
          Uids: aUids,
        }
        webApi.sendRequest({
          sApiHost,
          sAuthToken,
          sModule: 'Mail',
          sMethod: 'GetMessagesBodies',
          oParameters,
          fCallback: (aMessagesFromServer, oError) => {
            if (aMessagesFromServer && _.isArray(aMessagesFromServer)) {
              messagesDbManager.setMessages({ iAccountId, aMessages: aMessagesFromServer }).then(resolve, reject)
            } else {
              reject({ sMethod: '_retrieveMessages', oError })
            }
          },
        })
      }
    })
  },

  _markFolderWithoutChanges: function ({ iAccountId, sFolderFullName }) {
    return new Promise((resolve, reject) => {
      foldersDbManager.getFolders(iAccountId).then(
        (oFolderList) => {
          if (oFolderList && oFolderList.Tree) {
            let oFolder = this.getFolder(oFolderList, sFolderFullName)
            if (oFolder) {
              oFolder.HasChanges = false
            }
            foldersDbManager.setFolders(iAccountId, oFolderList).then(resolve, reject)
          }
        },
        reject
      )
    })
  },

  _getAllMessagesInfo: function (aMessagesInfo) {
    if (_.isArray(aMessagesInfo)) {
      let aAllThreadsInfo = []
      _.each(aMessagesInfo, (oMessageInfo) => {
        if (_.isArray(oMessageInfo.thread)) {
          aAllThreadsInfo = aAllThreadsInfo.concat(oMessageInfo.thread)
        }
      })
      return aMessagesInfo.concat(aAllThreadsInfo)
    }
    return []
  },
  
  _updateMessagesInfo: function (aOldMessagesInfo, aNewMessagesInfo) {
    let aAllNewMessagesInfo = this._getAllMessagesInfo(aNewMessagesInfo)
    let aUidsToRetrieve = []
    let aMessagesInfoToSync = []
    let aUidsToDelete = []
    if (!_.isArray(aOldMessagesInfo)) {
      aUidsToRetrieve = _.map(aAllNewMessagesInfo, (oMessageInfo) => {
        return oMessageInfo.uid
      })
    } else {
      let aAllOldMessagesInfo = this._getAllMessagesInfo(aOldMessagesInfo)
      _.each(aAllNewMessagesInfo, (oNewInfo) => {
        let iOldInfoIndex = _.findIndex(aAllOldMessagesInfo, (oOldInfo) => {
          return oNewInfo.uid === oOldInfo.uid
        })
        if (iOldInfoIndex === -1) {
          aUidsToRetrieve.push(oNewInfo.uid)
        } else {
          let oOldInfo = aAllOldMessagesInfo[iOldInfoIndex]
          if (!_.isEqual(oNewInfo.flags, oOldInfo.flags)) {
            aMessagesInfoToSync.push(oNewInfo)
          }
          aAllOldMessagesInfo.splice(iOldInfoIndex, 1);
        }
      })
  
      aUidsToDelete = _.map(aAllOldMessagesInfo, (oMessageInfo) => {
        return oMessageInfo.uid
      })
    }
    return { aUidsToDelete, aMessagesInfoToSync, aUidsToRetrieve }
  }
}
