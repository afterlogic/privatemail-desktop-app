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
  },
  getters: {
    getAuthToken (state) {
      return state.authToken
    },
    isAuthorized (state) {
      return state.authorized
    },
  },
}
