<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      some text2
      <img alt="Quasar logo" src="~assets/quasar-logo-full.svg"  />
      <q-btn @click="login()" label="Login"/>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
export default {
  name: "LoginUI",
  data () {
    return {
      left: true,
      right: true
    }
  },
  methods: {
    login() {
      this.$router.push({ path: '/mail' });
    }
  }
};
</script>
