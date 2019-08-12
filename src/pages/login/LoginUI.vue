<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex content-center justify-center full-height theme-text">
      <div class="login-form column q-ma-xl" style="min-width: 400px">
        <div class="col-auto q-px-md flex justify-center">
          <img class="logo" alt="Private Mail" src="~assets/private-mail-logo.svg" />
        </div>
        <div class="col">
          <div class="column panel-rounded q-px-md q-pb-md q-gutter-y-md bg-white text-black" style="min-width: 400px">
            <q-input outlined v-model="login" label="Login" v-on:keyup.enter="logIn" />
            <q-input outlined v-model="password" label="Password" type="password" v-on:keyup.enter="logIn" />
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
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

export default {
  name: 'LoginUI',
  data () {
    return {
      login: '',
      password: '',
      loading: false,
    }
  },
  mounted () {
    this.$store.dispatch('user/logout')
  },
  computed: {
    isAuthorized: function () {
      return this.$store.state.user.authorized
    }
  },
  methods: {
    logIn() {
      if (!this.loading) {
        var parameters = {
          Login: this.login,
          Password: this.password,
        }
        this.loading = true
        webApi.sendRequest('Core', 'Login', parameters, (result, error) => {
          this.loading = false
          if (result && result.AuthToken) {
            this.$store.dispatch('user/login', result.AuthToken)
            this.$router.push({ path: '/mail' })
          } else {
            notification.showError(errors.getText(error, 'Error occurred while trying to sign in'))
          }
        })
      }
    }
  }
}
</script>
