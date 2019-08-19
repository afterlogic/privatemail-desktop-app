import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

export default {
  namespaced: true,
  state: {
    account: null,
    folderList: null,
    foldersCount: 0,
    foldersNamespace: '',
  },
  mutations: {
    setAccount (state, payload) {
      state.account = payload
    },
    setFolderList (state, payload) {
      state.folderList = payload.collection
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
      state.foldersCount = payload.count
      state.foldersNamespace = payload.namespace
    },
  },
  actions: {
    asyncSetFolderList ({ state, commit }) {
      if (state.account) {
        webApi.sendRequest('Mail', 'GetFolders', {AccountID: state.account.AccountID}, (result, error) => {
          if (result && result.Folders && result.Folders['@Collection']) {
            commit('setFolderList', {
              collection: result.Folders['@Collection'],
              count: result.Folders['@Count'],
              namespace: result.Namespace,
            })
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
