export default {
  namespaced: true,
  state: {
    authorized: '',
  },
  mutations: {
    setAuthorized (state, v) {
      state.authorized = !!v
    }
  },
  actions: {
    login ({ commit }) {
      commit('setAuthorized', true)
    },

    logout ({ commit }) {
      commit('setAuthorized', false)
    },
  }
}
  // strict: process.env.NODE_ENV !== 'production',

  // credentials.namepath means that credentials.login and credentials.password will not be saved to local storage
  // plugins: [createPersistedState()],
