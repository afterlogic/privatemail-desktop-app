export default {
  namespaced: true,
  state: {
    authToken: '',
  },
  mutations: {
    setAuthToken (state, v) {
      state.authToken = v
    },
  },
  actions: {
    login ({ commit }, authToken) {
      commit('setAuthToken', authToken)
    },

    logout ({ commit }) {
      commit('setAuthToken', '')
    },
  },
  getters: {
    getAuthToken (state) {
      return state.authToken
    },
    isAuthorized (state) {
      return state.authToken !== ''
    },
  },
}
