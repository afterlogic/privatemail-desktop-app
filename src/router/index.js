import Vue from 'vue'
import VueRouter from 'vue-router'
import store from 'src/store'
import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

const router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,

  // Leave these as is and change from quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
})
router.beforeEach((to, from, next) => {
  if (store.getters['mail/getHasChanges']) {
    store.commit('mail/setSelectedItem', {route: to.fullPath})
    store.commit('mail/setTriggerChangesDialogue', true)
  } else {
    next()
  }
})
export default router
