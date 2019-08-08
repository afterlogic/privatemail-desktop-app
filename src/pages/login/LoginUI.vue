<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex content-center justify-center full-height theme-text">
      <div class="login-form column q-ma-xl" style="min-width: 400px">
        <div class="col-auto q-px-md flex justify-center">
          <img class="logo" alt="Private Mail" src="~assets/private-mail-logo.svg" />
        </div>
        <div class="col">
          <div class="column panel-rounded q-px-md q-pb-md q-gutter-y-md bg-white text-black" style="min-width: 400px">
            <q-input outlined v-model="login" label="Login" />
            <q-input outlined v-model="password" label="Password" />
            <q-btn @click="logIn()" color="primary" size="20px" label="Login"/>
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
export default {
  name: "LoginUI",
  data () {
    return {
      login: '',
      password: ''
    }
  },
  mounted () {
    this.$store.dispatch('user/logout')
  },
  computed: {
    isAuthorized: function () {
      // return true;
      return this.$store.state.user.authorized;
    }
  },
  methods: {
    logIn() {
      console.log('click login')
      this.$store.dispatch('user/login')
      this.$router.push({ path: '/mail' });
    }
  }
};
</script>
