import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

function _getIconName(type, folderFullName) {
  var iconName = ''
  switch (type) {
    case 1:
      iconName = 'mail' // inbox
      break
    case 2:
      iconName = 'send' // sent
      break
    case 3:
      iconName = 'insert_drive_file' // drafts
      break
    case 4:
      iconName = 'error' // spam
      break
    case 5:
      iconName = 'delete' // trash
      break
    case 7:
      iconName = 'star' // starred
      break
  }
  if (folderFullName === 'Notes') {
    iconName = 'edit'
  }
  return iconName;
}

function _prepareFolderList(folderList, oldFoldersByNames) {
  var newFoldersByNames = []
  var newFoldersNames = []

  function _recursive(folderList) {
    var newFolderList = []
    _.each(folderList, function (folder) {
      var oldFolder = oldFoldersByNames[folder.FullName]
      var newFolder = {
        FullName: folder.FullName,
        Name: folder.Name,
        Type: folder.Type,
        IconName: _getIconName(folder.Type, folder.FullName),
        Count: oldFolder ? oldFolder.Count : 0,
        UnseenCount: oldFolder ? oldFolder.UnseenCount : 0,
        NextUid: oldFolder ? oldFolder.NextUid : '',
        Hash: oldFolder ? oldFolder.Hash : folder.FullName,
      }
      newFolder.SubFolders = (folder.SubFolders && folder.SubFolders['@Collection']) ? _recursive(folder.SubFolders['@Collection']) : []
      newFolderList.push(newFolder)
      newFoldersByNames[newFolder.FullName] = newFolder
      newFoldersNames.push(newFolder.FullName)
    })

    return newFolderList
  }

  var newFolderList = _recursive(folderList)

  return {
    folderList: newFolderList,
    foldersByNames: newFoldersByNames,
    foldersNames: newFoldersNames,
  }
}

function _prepareFoldersByNames(folderList) {
  var newFoldersByNames = []

  function _recursive(folderList) {
    _.each(folderList, function (folder) {
      newFoldersByNames[folder.FullName] = folder
    })
  }
  _recursive(folderList)
  
  return newFoldersByNames
}

export default {
  namespaced: true,
  state: {
    syncing: false,
    account: null,
    folderList: null,
    foldersByNames: null,
    foldersNames: null,
    foldersCount: 0,
    foldersNamespace: '',
  },
  mutations: {
    setSyncing (state, payload) {
      state.syncing = payload
    },
    setAccount (state, payload) {
      state.account = payload
    },
    setFolderList (state, payload) {
      state.folderList = payload
    },
    setFoldersCount (state, payload) {
      state.foldersCount = payload
    },
    setFoldersNamespace (state, payload) {
      state.foldersNamespace = payload
    },
    setFoldersByNames (state, payload) {
      state.foldersByNames = payload
    },
    setFoldersNames (state, payload) {
      state.foldersNames = payload
    },
    setFoldersRelevantInformation (state, payload) {
      _.each(payload, function (folderCounts, folderFullName) {
        if (state.foldersByNames[folderFullName]) {
          state.foldersByNames[folderFullName].Count = folderCounts[0]
          state.foldersByNames[folderFullName].UnseenCount = folderCounts[1]
          state.foldersByNames[folderFullName].NextUid = folderCounts[2]
          state.foldersByNames[folderFullName].Hash = folderCounts[3]
        }
      })
    },
  },
  actions: {
    logout ({ commit }) {
      commit('setAccount', null)
      commit('setFolderList', null)
      commit('setFoldersCount', 0)
      commit('setFoldersNamespace', '')
      commit('setFoldersByNames', null)
      commit('setFoldersNames', null)
    },
    asyncGetFoldersRelevantInformation ({ state, commit }) {
      if (state.account) {
        commit('setSyncing', true)
        webApi.sendRequest('Mail', 'GetRelevantFoldersInformation', {AccountID: state.account.AccountID, Folders: state.foldersNames, UseListStatusIfPossible: true}, (result, error) => {
          commit('setSyncing', false)
          if (result && result.Counts) {
            commit('setFoldersRelevantInformation', result.Counts)
          } else {
            notification.showError(errors.getText(error, 'Error occurred while getting folders relevant information'))
          }
        })
      } else {
        commit('setSyncing', false)
      }
    },
    asyncGetFolderList ({ state, commit, dispatch }) {
      if (state.account) {
        commit('setSyncing', true)
        webApi.sendRequest('Mail', 'GetFolders', {AccountID: state.account.AccountID}, (result, error) => {
          if (result && result.Folders && result.Folders['@Collection']) {
            var folderListData = _prepareFolderList(result.Folders['@Collection'], state.foldersByNames || [])
            commit('setFolderList', folderListData.folderList)
            commit('setFoldersCount', result.Folders['@Count'])
            commit('setFoldersNamespace', result.Folders.Namespace)
            commit('setFoldersByNames', folderListData.foldersByNames)
            commit('setFoldersNames', folderListData.foldersNames)
            dispatch('asyncGetFoldersRelevantInformation')
          } else {
            commit('setSyncing', false)
            notification.showError(errors.getText(error, 'Error occurred while getting folder list'))
          }
        })
      }
    },
    asyncGetSettings ({ state, commit, dispatch }) {
      if (_.isEmpty(state.foldersByNames) && !_.isEmpty(state.foldersNames)) {
        commit('setFoldersByNames', _prepareFoldersByNames(state.folderList))
      }
      webApi.sendRequest('Mail', 'GetSettings', {}, (result, error) => {
        if (result) {
          if (result.Accounts && result.Accounts[0]) {
            commit('setAccount', result.Accounts[0])
            dispatch('asyncGetFolderList')
          }
        } else {
          notification.showError(errors.getText(error, 'Error occurred while getting mail settings'))
        }
      })
    },
  },
  getters: {
    getSyncing (state) {
      return state.syncing
    },
    getAccount (state) {
      return state.account
    },
    getFolderList (state) {
      return state.folderList
    },
  },
}
