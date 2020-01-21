<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex content-center justify-center full-height theme-text">
      <div class="login-form column q-ma-xl" style="min-width: 400px">
        <div class="col-auto q-px-md flex justify-center">
          <img class="logo" alt="Private Mail" src="~assets/private-mail-logo.svg" />
        </div>
        <div class="col">
          <div class="column panel-rounded q-px-md q-pb-md q-gutter-y-md bg-white text-black" style="min-width: 400px">
            <q-input outlined v-if="showHost" v-model="host" label="Host" v-on:keyup.enter="logIn" />
            <q-input outlined v-model="login" label="Login" v-on:keyup.enter="logIn" ref="login" />
            <q-input outlined v-model="password" label="Password" type="password" v-on:keyup.enter="logIn" />
            <span class="pannel-hint--link" v-if="showHost" @click="showHost=false">Less options</span>
            <q-btn color="primary" v-if="loading" size="20px" label="Signing In ..." no-caps disable />
            <q-btn @click="logIn()" color="primary" v-else size="20px" label="Sign In" no-caps/>
          </div>
        </div>
      </div>
      <q-dialog v-model="enterPinDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <span class="text-h6">Enter PIN</span>
          </q-card-section>
          <q-card-section class="row items-center">
            <span class="q-ml-sm">To protect your security, you need to type a PIN code.</span>
          </q-card-section>
          <q-card-section class="row items-center">
            <q-input v-model="twoFactorPin" label="PIN" v-on:keyup.enter="verifyPin" class="verify-pin-input" ref="verifyPinInput" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Verify PIN" color="primary" @click="verifyPin" v-if="!verifying" />
            <q-btn flat label="Verifying PIN..." color="primary" v-if="verifying" />
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
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
.verify-pin-input {
  width: 100%;
  margin-left: 10px;
}
</style>

<script>
import { ipcRenderer } from 'electron'
import axios from 'axios'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi.js'

export default {
  name: 'LoginUI',

  data () {
    return {
      host: '', // 'https://test.afterlogic.com',
      login: 'test@afterlogic.com',
      password: '',
      loading: false,
      showHost: false,
      hosts: {},

      bNeedSecondAttempt: false,
      sApiHostAttempt: '',

      enterPinDialog: false,
      twoFactorPin: '',
      twoFactorData: {},
      verifying: false,
    }
  },

  mounted () {
    this.$store.dispatch('user/logout')
    this.$store.dispatch('mail/logout')
    this.$store.dispatch('contacts/logout')
    this.host = this.$store.getters['main/getApiHost'] ? this.$store.getters['main/getApiHost'] : this.host
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
        } else if (typesUtils.isNonEmptyString(this.hosts[sEmail])) {
          this.host = this.hosts[sEmail]
          this.continueLogIn()
        } else {
          let sUrl = ''
          axios.get('https://test.afterlogic.com/autodiscover.php?email=' + sEmail)
            .then((oResponse) => {
              sUrl = typesUtils.pString(oResponse && oResponse.data && oResponse.data.url)
            })
            .finally(() => {
              if (typesUtils.isNonEmptyString(sUrl)) {
                this.hosts[sEmail] = sUrl
                this.host = this.hosts[sEmail]
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
            this.twoFactorData = oParameters
            this.twoFactorPin = ''
            this.enterPinDialog = true

            await this.$nextTick()
            if (this.$refs.verifyPinInput) {
              this.$refs.verifyPinInput.focus()
            }
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
    verifyPin () {
      this.verifying = true
      webApi.sendRequest({
        sApiHost: this.sApiHostAttempt,
        sModule: 'TwoFactorAuth',
        sMethod: 'VerifyPin',
        oParameters: _.assign({ 'Pin': this.twoFactorPin }, this.twoFactorData),
        fCallback: (oResult, oError) => {
          this.verifying = false
          if (oResult && oResult.AuthToken) {
            this.handleAuthToken(oResult.AuthToken)
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while trying to sign in.'))
          }
        },
      })
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
