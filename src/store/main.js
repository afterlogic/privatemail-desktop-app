export default {
  namespaced: true,
  state: {
    apiHost: '',
    lastLogin: '',
    theme: 'dark',
    openPgpKeys: [],
  },
  mutations: {
    setApiHost (state, sApiHost) {
      state.apiHost = sApiHost
    },
    setLastLogin (state, sLastLogin) {
      state.lastLogin = sLastLogin
    },
    setOpenPgpKeys (state, aOpenPgpKeys) {
      state.openPgpKeys = aOpenPgpKeys
    },
    setTheme (state, v) {
      state.theme = v
    },
  },
  actions: {
    clearAll ({ commit }) {
      commit('setApiHost', '')
      commit('setLastLogin', '')
      commit('setTheme', 'dark')
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
  },
}
