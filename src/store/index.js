import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import user from './user.js'
import main from './main.js'
import mail from './mail/index.js'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: ['user', 'main', 'mail.messagesCache'],
  })],
  modules: {
    main,
    user,
    mail,
  },

  // enable strict mode (adds overhead!)
  // for dev mode only
  strict: process.env.DEV
})
