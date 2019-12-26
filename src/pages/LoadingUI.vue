<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex content-center justify-center full-height theme-text">
      <div class="login-form column q-ma-xl" style="min-width: 400px">
        <div class="col-auto q-px-md flex justify-center">
          <q-spinner color="primary" size="3em" />
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<style lang="scss" scoped>

</style>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'LoadingUI',

  data () {
    return {
    }
  },

  computed: {
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
  },

  watch: {
    currentAccount: function () {
      let sCurrentPath = this.$router.currentRoute && this.$router.currentRoute.path ? this.$router.currentRoute.path : ''
      if (this.currentAccount && sCurrentPath !== '/mail') {
        this.$router.push({ path: '/mail' })
      }
    },
  },

  mounted () {
    ipcRenderer.once('main-get-user-data', (event, oUserData) => {
      if (oUserData) {
        this.$store.commit('main/setDataFromServer', oUserData.main)
        this.$store.commit('user/setDataFromServer', oUserData.user)
        let bAuthorized = this.$store.getters['user/isAuthorized']
        if (bAuthorized) {
          if (!this.currentAccount) {
            this.$store.dispatch('mail/asyncGetSettings', false)
          } else {
            this.$router.push({ path: '/mail' })
          }
        } else {
          this.$router.push({ path: '/login' })
        }
      }
    })
    ipcRenderer.send('main-get-user-data')
  },
}
</script>
