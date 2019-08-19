import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

export default {
  namespaced: true,
  state: {
    account: null,
    folderList: null,
    foldersByNames: null,
    foldersNames: null,
    foldersCount: 0,
    foldersNamespace: '',
  },
  mutations: {
    setAccount (state, payload) {
      state.account = payload
    },
    setFolderList (state, payload) {
      state.folderList = payload
      _.each(state.folderList, function (folder) {
        folder.IconName = ''
        switch (folder.Type) {
          case 1:
            folder.IconName = 'mail' // inbox
            break
          case 2:
            folder.IconName = 'send' // sent
            break
          case 3:
            folder.IconName = 'insert_drive_file' // drafts
            break
          case 4:
            folder.IconName = 'error' // spam
            break
          case 5:
            folder.IconName = 'delete' // trash
            break
          case 7:
            folder.IconName = 'star' // starred
            break
        }
        if (folder.FullName === 'Notes') {
          folder.IconName = 'edit'
        }
        folder.UnseenCount = 0
      })
    },
    setFoldersCount (state, payload) {
      state.foldersCount = payload
    },
    setFoldersNamespace (state, payload) {
      state.foldersNamespace = payload
    },
    setFoldersNames (state) {
      var foldersNames = []
      var foldersByNames = []
      _.each(state.folderList, function (folder) {
        foldersByNames[folder.FullName] = folder
        foldersNames.push(folder.FullName)
        if (folder.SubFolders) {
          _.each(folder.SubFolders['@Collection'], function (subfolder) {
            foldersByNames[folder.FullName] = folder
            foldersNames.push(subfolder.FullName)
          })
        }
      })
      state.foldersByNames = foldersByNames
      state.foldersNames = foldersNames
    },
  },
  actions: {
    asyncSetFoldersRelevantInformation ({ state, commit }) {
      if (state.account) {
        webApi.sendRequest('Mail', 'GetRelevantFoldersInformation', {AccountID: state.account.AccountID, Folders: state.foldersNames, UseListStatusIfPossible: true}, (result, error) => {
          if (result && result.Counts) {
            _.each(result.Counts, function (folderCounts, folderFullName) {
              if (state.foldersByNames[folderFullName]) {
                state.foldersByNames[folderFullName].Count = folderCounts[0]
                state.foldersByNames[folderFullName].UnseenCount = folderCounts[1]
                console.log('folderFullName', folderFullName, 'UnseenCount', state.foldersByNames[folderFullName].UnseenCount)
                state.foldersByNames[folderFullName].NextUid = folderCounts[2]
                state.foldersByNames[folderFullName].Hash = folderCounts[3]
              }
            })
            commit('setFolderList', state.folderList)
          } else {
            notification.showError(errors.getText(error, 'Error occurred while getting folders relevant information'))
          }
        })
      }
    },
    asyncSetFolderList ({ state, commit, dispatch }) {
      if (state.account) {
        webApi.sendRequest('Mail', 'GetFolders', {AccountID: state.account.AccountID}, (result, error) => {
          if (result && result.Folders && result.Folders['@Collection']) {
            commit('setFolderList', result.Folders['@Collection'])
            commit('setFoldersCount', result.Folders['@Count'])
            commit('setFoldersNamespace', result.Folders.Namespace)
            commit('setFoldersNames')
            dispatch('asyncSetFoldersRelevantInformation')
          } else {
            notification.showError(errors.getText(error, 'Error occurred while getting folder list'))
          }
        })
      }
    },
    asyncGetSettings ({ commit, dispatch }) {
      webApi.sendRequest('Mail', 'GetSettings', {}, (result, error) => {
        if (result) {
          if (result.Accounts && result.Accounts[0]) {
            commit('setAccount', result.Accounts[0])
            dispatch('asyncSetFolderList')
          }
        } else {
          notification.showError(errors.getText(error, 'Error occurred while getting mail settings'))
        }
      })
    },
  },
  getters: {
    getAccount (state) {
      return state.account
    },
    getFolderList (state) {
      return state.folderList
    },
  },
}
