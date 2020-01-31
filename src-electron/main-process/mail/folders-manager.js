import _ from 'lodash'

import foldersDbManager from './folders-db-manager.js'

import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

export default {
  refreshFoldersInformation: function (oFolderList, aCountsFromServer) {
    let aChangedFolders = []

    function _recursive(oFoldersTree) {
      _.each(oFoldersTree, function (oFolder) {
        let aFolderCounts = aCountsFromServer[oFolder.FullName]
        if (aFolderCounts) {
          let iNewCount = aFolderCounts[0]
          let iUnseenCount = aFolderCounts[1]
          let sNextUid = aFolderCounts[2]
          let sHash = aFolderCounts[3]
          oFolder.HasChanges = false
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

    _recursive(oFolderList.Tree)

    return aChangedFolders
  },

  getFolder: function (oFolderList, sFolderFullName) {
    function _recursive(oFoldersTree) {
      let oFoundFolder = null
      _.each(oFoldersTree, function (oFolder) {
        if (oFolder.FullName === sFolderFullName) {
          oFoundFolder = oFolder
          return false // break each
        } else if ((0 === sFolderFullName.indexOf(oFolder.FullName)) && oFolder.SubFolders) {
          oFoundFolder = _recursive(oFolder.SubFolders)
        }
      })
      return oFoundFolder
    }
    return _recursive(oFolderList.Tree)
  },

  getMessagesInfo: function ({ iAccountId, sFolderFullName, sApiHost, sAuthToken }) {
    return new Promise((resolve, reject) => {
      foldersDbManager.getMessagesInfo({ iAccountId, sFolderFullName }).then(
        (aMessagesInfo) => {
          if (_.isArray(aMessagesInfo)) {
            resolve(aMessagesInfo)
          } else {
            let bDrafts = sFolderFullName.toLowerCase() === 'drafts'
            let bSpam = sFolderFullName.toLowerCase() === 'spam'
            let bTrash = sFolderFullName.toLowerCase() === 'trash'
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetMessagesInfo',
              oParameters: {
                AccountID: iAccountId,
                Folder: sFolderFullName,
                UseThreading: (bDrafts || bSpam || bTrash) ? false : true,
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
                      foldersDbManager.getFolders(iAccountId).then(
                        (oFolderList) => {
                          let oFolder = this.getFolder(oFolderList, sFolderFullName)
                          if (oFolder) {
                            delete oFolder.HasChanges
                          }
                          foldersDbManager.setFolders({iAccountId, oFolderList})
                        }
                      )
                    }
                  )
                } else {
                  reject({ sMethod: 'getMessagesInfo', oError })
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

  refreshMessagesInfo: function (iAccountId, sFolderFullName, sApiHost, sAuthToken) {
    return new Promise((resolve, reject) => {
      foldersDbManager.getMessagesInfo({ iAccountId, sFolderFullName }).then(
        (aMessagesInfoFromDb) => {
            let bDrafts = sFolderFullName.toLowerCase() === 'drafts'
            let bSpam = sFolderFullName.toLowerCase() === 'spam'
            let bTrash = sFolderFullName.toLowerCase() === 'trash'
            webApi.sendRequest({
              sApiHost,
              sAuthToken,
              sModule: 'Mail',
              sMethod: 'GetMessagesInfo',
              oParameters: {
                AccountID: iAccountId,
                Folder: sFolderFullName,
                UseThreading: (bDrafts || bSpam || bTrash) ? false : true,
                SortBy: 'arrival',
                SortOrder: 1,
                Search: '',
                Filter: '',
              },
              fCallback: (aMessagesInfoFromServer, oError) => {
                console.log('aMessagesInfoFromDb', aMessagesInfoFromDb)
                console.log('aMessagesInfoFromServer', aMessagesInfoFromServer)
                // if (_.isArray(aMessagesInfo)) {
                //   resolve(aMessagesInfo)
                //   foldersDbManager.setMessagesInfo({ iAccountId, sFolderFullName, aMessagesInfo }).then(
                //     () => {
                //       foldersDbManager.getFolders(iAccountId).then(
                //         (oFolderList) => {
                //           let oFolder = this.getFolder(oFolderList, sFolderFullName)
                //           if (oFolder) {
                //             delete oFolder.HasChanges
                //           }
                //           foldersDbManager.setFolders({iAccountId, oFolderList})
                //         }
                //       )
                //     }
                //   )
                // } else {
                //   reject({ sMethod: 'getMessagesInfo', oError })
                // }
              },
            })
        },
        (oResult) => {
          reject(oResult)
        }
      )
    })
  },
}
