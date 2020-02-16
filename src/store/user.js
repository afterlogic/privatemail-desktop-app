import typesUtils from 'src/utils/types.js'

export default {
  namespaced: true,
  state: {
    authToken: '',
    userId: 0,
    userName: '',
    userPublicId: '',
    userRole: 4, // Anonymous
    userTenantId: 0,
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
    setUserData (state, oUserData) {
      state.userId = oUserData.Id
      state.userName = oUserData.Name
      state.userPublicId = oUserData.PublicId
      state.userRole = oUserData.Role
      state.userTenantId = oUserData.TenantId
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
    getUserPublicId (state) {
      return state.userPublicId
    },
  },
}
