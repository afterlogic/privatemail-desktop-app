import _ from 'lodash'

import foldersDbManager from './folders-db-manager.js'

import typesUtils from '../../../src/utils/types.js'
import webApi from '../webApi.js'

export default {
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
          if (typesUtils.isNonEmptyArray(aMessagesInfo)) {
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
                console.log('aMessagesInfo', aMessagesInfo)
                console.log('oError', oError)
                if (_.isArray(aMessagesInfo)) {
                  resolve(aMessagesInfo)
                  foldersDbManager.setMessagesInfo({ iAccountId, sFolderFullName, oMessagesInfo }).then(
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
}
