import Vue from 'vue'
import Vuex from 'vuex'
// import createPersistedState from 'vuex-persistedstate'
// import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  // strict: process.env.NODE_ENV !== 'production',

  // credentials.namepath means that credentials.login and credentials.password will not be saved to local storage
  // plugins: [createPersistedState()],
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
})
