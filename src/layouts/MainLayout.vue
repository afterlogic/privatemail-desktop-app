<template>
  <q-layout view="hHh LpR lfr" class="bg-black text-white">
    <q-header bordered>
      <!-- <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-btn dense flat round icon="menu" @click="showRight = !showRight" />
      </q-toolbar> -->
      <q-btn @click="logIn()" label="Login" />
      <q-tabs align="left" class="q-pa-md" v-if="isAuthorized">
        {{isLoginedIn}}
        <q-route-tab to="/mail" label="Mail" />
        <q-route-tab to="/contacts" label="Contacts" />
        <q-route-tab to="/files" label="Files" />
        <q-route-tab to="/calendar" label="Calendar" />
        <q-space />
        <q-route-tab to="/settings" label="Settings" />
        <q-route-tab to="/" label="Log out" />
      </q-tabs>
    </q-header>
    <router-view />
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {

    };
  },
  mounted () {
    this.$store.dispatch('logout')
  },
  computed: {
    isAuthorized: function () {
      // return true;
      return this.$store.state.authorized;
    }
  },
  methods: {
    logIn () {
      this.$store.dispatch('login')
    }
  }
};
</script>

<style></style>
