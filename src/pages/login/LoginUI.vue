<template>
  <q-page-container style="height: 100vh non-selectable">
    <q-page class="flex content-center justify-center full-height theme-text">
      <div class="login-form column q-ma-xl" style="min-width: 400px">
        <div class="col-auto q-px-md flex justify-center non-selectable">
          <img class="logo" alt="PrivateMail" src="~assets/private-mail-logo.svg" />
        </div>
        <div class="col">
          <div class="column panel-rounded q-px-md q-pb-md q-gutter-y-md bg-white text-grey-8 non-selectable" style="min-width: 400px">
            <q-input outlined v-if="showHost" v-model="host" label="Server" v-on:keyup.enter="logIn" />
            <q-input outlined v-model="login" label="Login" v-on:keyup.enter="logIn" ref="login" />
            <q-input outlined v-model="password" label="Password" type="password" v-on:keyup.enter="logIn" />
            <span class="pannel-hint--link" v-if="showHost" @click="showHost=false">Less options</span>
            <q-btn unelevated color="primary" no-caps disable size="20px" v-if="loading" label="Signing In ..." />
            <q-btn unelevated color="primary" no-caps size="20px" v-else label="Sign In" @click="logIn" />
          </div>
        </div>
      </div>
      <VerifyTwoFactorDialog ref="VerifyTwoFactorDialog"></VerifyTwoFactorDialog>
    </q-page>
  </q-page-container>
</template>

<style lang="scss" scoped>
.login-form {
  padding: 200px 0px;
}
.logo {
  max-width: 300px;
  margin-top: -200px;
}
</style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi.js'

import VerifyTwoFactorDialog from './VerifyTwoFactorDialog.vue'

export default {
  name: 'LoginUI',

  components: {
    VerifyTwoFactorDialog,
  },

  data () {
    return {
      host: '',
      login: '',
      password: '',
      loading: false,
      showHost: false,

      bNeedSecondAttempt: false,
      sApiHostAttempt: '',
    }
  },

  mounted () {
    this.$store.dispatch('user/logout')
    this.$store.dispatch('mail/logout')
    this.$store.dispatch('contacts/logout')
    this.login = this.$store.getters['main/getLastLogin'] ? this.$store.getters['main/getLastLogin'] : this.login
  },

  methods: {
    logIn() {
      if (!this.loading) {
        let sEmail = this.login
        if (this.showHost) {
          if (typesUtils.isNonEmptyString(this.host)) {
            this.continueLogIn()
          } else {
            notification.showReport('Please fill up host field.')
          }
        } else {
          ipcRenderer.once('main-get-host', (oEvent, oData) => {
            let sUrl = typesUtils.pString(oData && oData.url)
            if (typesUtils.isNonEmptyString(sUrl)) {
              this.host = sUrl
              this.continueLogIn()
            } else {
              this.showHost = true
              if (typesUtils.isNonEmptyString(this.host)) {
                notification.showReport('Please check the host and try signing in again.')
              } else {
                notification.showReport('Please fill up host field.')
              }
            }
          })
          ipcRenderer.send('main-get-host', { sEmail })
        }
      }
    },
    trySignIn () {
      ipcRenderer.send('logout', { sApiHost: this.sApiHostAttempt })

      let oParameters = {
        Login: this.login,
        Password: this.password,
      }
      this.loading = true
      webApi.sendRequest({
        sApiHost: this.sApiHostAttempt,
        sModule: 'Core',
        sMethod: 'Login',
        oParameters,
        fCallback: async (oResult, oError) => {
          this.loading = false
          if (oResult && oResult.AuthToken) {
            this.handleAuthToken(oResult.AuthToken)
          } else if (oResult && oResult.TwoFactorAuth) {
            this.$refs.VerifyTwoFactorDialog.open(oResult.TwoFactorAuth, oParameters, this.sApiHostAttempt, this.handleAuthToken)
          } else {
            this.catchSignInError(oError)
          }
        },
      })
    },
    catchSignInError (oError) {
      if (this.bNeedSecondAttempt) {
        this.bNeedSecondAttempt = false
        this.sApiHostAttempt = 'http://' + this.host
        this.trySignIn(this.sApiHostAttempt)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while trying to sign in.'))
      }
    },
    continueLogIn() {
      this.bNeedSecondAttempt = false
      if (0 === this.host.indexOf('https://') || 0 === this.host.indexOf('http://')) {
        this.sApiHostAttempt = this.host
        this.trySignIn()
      } else {
        this.bNeedSecondAttempt = true
        this.sApiHostAttempt = 'https://' + this.host
        this.trySignIn()
      }
    },
    handleAuthToken (sAuthToken) {
      if (this.sApiHostAttempt !== this.$store.getters['main/getApiHost'] || this.login !== this.$store.getters['main/getLastLogin']) {
        ipcRenderer.once('db-remove-all', (oEvent, { bRemoved, sError }) => {
          if (bRemoved) {
            this.$store.commit('main/setNewUserData', { sApiHost: this.sApiHostAttempt, sLogin: this.login })

            this.$store.dispatch('user/login', sAuthToken)
            ipcRenderer.send('init', { sApiHost: this.sApiHostAttempt, sAuthToken })
            this.$router.push({ path: '/mail' })
          } else {
            notification.showError(sError || 'DB was not removed')
          }
        })
        ipcRenderer.send('db-remove-all')
      } else {
        this.$store.dispatch('user/login', sAuthToken)
        ipcRenderer.send('init', { sApiHost: this.sApiHostAttempt, sAuthToken })
        this.$router.push({ path: '/mail' })
      }
    },
  },
}
</script>
