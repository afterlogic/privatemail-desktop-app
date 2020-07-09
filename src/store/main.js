import _ from 'lodash'

import typesUtils from 'src/utils/types.js'

export default {
  namespaced: true,
  state: {
    apiHost: '',
    lastLogin: '',
    theme: 'dark',
    minimizeToTray: true,
    openPgpKeys: [],
  },
  mutations: {
    setApiHost (state, sApiHost) {
      state.apiHost = sApiHost
    },
    setLastLogin (state, sLastLogin) {
      state.lastLogin = sLastLogin
    },
    addOpenPgpKeys (state, aOpenPgpKeys) {
      state.openPgpKeys = _.union(state.openPgpKeys, aOpenPgpKeys)
    },
    deleteOpenPgpKey (state, sKeyId) {
      state.openPgpKeys = _.filter(state.openPgpKeys, function (oKey) {
        return oKey.sId !== sKeyId
      })
    },
    setTheme (state, v) {
      state.theme = v
    },
    setMinimizeToTray (state, bMinimizeToTray) {
      state.minimizeToTray = !!bMinimizeToTray
    },
    setDataFromServer (state, oDataFromServer) {
      if (typesUtils.isNonEmptyObject(oDataFromServer)) {
        state.apiHost = typesUtils.pString(oDataFromServer.apiHost, state.apiHost)
        state.lastLogin = typesUtils.pString(oDataFromServer.lastLogin, state.lastLogin)
        state.openPgpKeys = typesUtils.pArray(oDataFromServer.openPgpKeys, state.openPgpKeys)
        state.theme = typesUtils.pString(oDataFromServer.theme, state.theme)
        state.minimizeToTray = typesUtils.pBool(oDataFromServer.minimizeToTray, state.minimizeToTray)
      }
    },
    setNewUserData (state, { sApiHost, sLogin }) {
      state.apiHost = typesUtils.pString(sApiHost)
      state.lastLogin = typesUtils.pString(sLogin)
      state.openPgpKeys = []
      state.theme = 'dark'
      state.minimizeToTray = true
    },
  },
  actions: {
    clearAll ({ commit }) {
      commit('setNewUserData', { sApiHost: '', sLogin: '' })
    },
    toggleTheme ({ commit, state }) {
      if (state.theme === 'light') {
        commit('setTheme', 'dark')
      } else {
        commit('setTheme', 'light')
      }
    },
  },
  getters: {
    getApiHost (state) {
      return state.apiHost
    },
    getLastLogin (state) {
      return state.lastLogin
    },
    getOpenPgpKeys (state) {
      return state.openPgpKeys
    },
    getDataToSave (state) {
      return {
        apiHost: state.apiHost,
        lastLogin: state.lastLogin,
        openPgpKeys: state.openPgpKeys,
        theme: state.theme,
        minimizeToTray: state.minimizeToTray,
      }
    },
  },
}
