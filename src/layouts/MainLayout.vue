<template>
  <q-layout view="hHh LpR lfr">
    <q-header bordered class="bg-primary text-white">
      <!-- <q-toolbar>
        <q-btn dense flat round icon="menu" @click="left = !left" />
        <q-btn dense flat round icon="menu" @click="showRight = !showRight" />
      </q-toolbar> -->

      <q-tabs align="left">
        <q-route-tab to="/" label="Mail" />
        <q-route-tab to="/contacts" label="Contacts" />
        <q-route-tab to="/files" label="Files" />
        <q-route-tab to="/calendar" label="Calendar" />
        <q-route-tab to="/settings" label="Settings" />
      </q-tabs>
    </q-header>
    <router-view />
  </q-layout>
</template>

<script>
import { openURL } from "quasar";

export default {
  name: "MainLayout",
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      showLeft: true,
      showRight: true
    };
  },
  methods: {
    openURL
  }
};
</script>

<style></style>
