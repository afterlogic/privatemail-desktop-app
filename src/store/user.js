import typesUtils from 'src/utils/types.js'

export default {
  namespaced: true,
  state: {
    authToken: '',
  },
  mutations: {
    setAuthToken (state, v) {
      state.authToken = v
    },
    setDataFromServer (state, oDataFromServer) {
      if (typesUtils.isNonEmptyObject(oDataFromServer)) {
        state.authToken = typesUtils.pString(oDataFromServer.authToken, state.authToken)
      }
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
    getDataToSave (state) {
      return {
        authToken: state.authToken,
      }
    },
  },
}
