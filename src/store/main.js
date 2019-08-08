export default {
  namespaced: true,
  state: {
    theme: 'dark',
  },
  mutations: {
    setTheme (state, v) {
      state.theme = v
    }
  },
  actions: {
    toggleTheme ({ commit, state }) {
      if (state.theme === 'light') {
        commit('setTheme', 'dark')
      } else {
        commit('setTheme', 'light')
      }
    },
  }
}
  // strict: process.env.NODE_ENV !== 'production',

  // credentials.namepath means that credentials.login and credentials.password will not be saved to local storage
  // plugins: [createPersistedState()],
