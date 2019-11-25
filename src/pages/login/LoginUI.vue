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
            <q-input outlined v-model="login" label="Login" v-on:keyup.enter="logIn" />
            <q-input outlined v-model="password" label="Password" type="password" v-on:keyup.enter="logIn" />
            <span class="pannel-hint--link" v-if="showHost" @click="showHost=false">Less options</span>
            <q-btn color="primary" v-if="loading" size="20px" label="Signing In ..." no-caps disable />
            <q-btn @click="logIn()" color="primary" v-else size="20px" label="Sign In" no-caps/>
          </div>
        </div>
      </div>
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
          if (typesUtils.isNonEmptyString(sUrl)) {
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
    continueLogIn() {
      function _catchSignInError (oError) {
        if (bNeedSecondAttempt) {
          bNeedSecondAttempt = false
          _trySignIn('http://' + sApiHost)
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while trying to sign in.'))
        }
      }

      let _trySignIn = (sApiHost) => {
        ipcRenderer.send('logout', { sApiHost })

        let oParameters = {
          Login: this.login,
          Password: this.password,
        }
        this.loading = true
        webApi.sendRequest({
          sApiHost,
          sModule: 'Core',
          sMethod: 'Login',
          oParameters,
          fCallback: (oResult, oError) => {
            this.loading = false
            if (oResult && oResult.AuthToken) {
              if (sApiHost !== this.$store.getters['main/getApiHost'] || this.login !== this.$store.getters['main/getLastLogin']) {
                ipcRenderer.send('db-remove-all')
                this.$store.commit('main/setApiHost', sApiHost)
                this.$store.commit('main/setLastLogin', this.login)
              }
              this.$store.dispatch('user/login', oResult.AuthToken)
              ipcRenderer.send('init', { sApiHost, sAuthToken: oResult.AuthToken })
              this.$router.push({ path: '/mail' })
            } else {
              _catchSignInError(oError)
            }
          },
        })
      }

      let bNeedSecondAttempt = false
      let sApiHost = this.host
      if (0 === sApiHost.indexOf('https://') || 0 === sApiHost.indexOf('http://')) {
        _trySignIn(sApiHost)
      } else {
        bNeedSecondAttempt = true
        _trySignIn('https://' + sApiHost)
      }
    },
  },
}
</script>
