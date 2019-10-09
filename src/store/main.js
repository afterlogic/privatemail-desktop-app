export default {
  namespaced: true,
  state: {
    apiHost: '',
    lastLogin: '',
    theme: 'dark',
  },
  mutations: {
    setApiHost (state, sApiHost) {
      state.apiHost = sApiHost
    },
    setLastLogin (state, sLastLogin) {
      state.lastLogin = sLastLogin
    },
    setTheme (state, v) {
      state.theme = v
    },
  },
  actions: {
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
  },
}
