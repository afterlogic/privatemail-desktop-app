export default {
  namespaced: true,
  state: {
    authorized: false,
    authToken: '',
  },
  mutations: {
    setAuthorized (state, v) {
      state.authorized = !!v
    },
    setAuthToken (state, v) {
      state.authToken = v
    },
  },
  actions: {
    login ({ commit }, authToken) {
      commit('setAuthToken', authToken)
      commit('setAuthorized', true)
    },

    logout ({ commit }) {
      commit('setAuthToken', '')
      commit('setAuthorized', false)
    },
  }
}
  // strict: process.env.NODE_ENV !== 'production',

  // credentials.namepath means that credentials.login and credentials.password will not be saved to local storage
  // plugins: [createPersistedState()],
