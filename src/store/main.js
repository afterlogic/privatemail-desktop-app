export default {
  namespaced: true,
  state: {
    apiHost: '',
    theme: 'dark',
  },
  mutations: {
    setApiHost (state, sApiHost) {
      state.apiHost = sApiHost
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
  },
}
