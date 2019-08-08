<template>
  <q-layout view="hHh LpR lfr">
    <q-header bordered class="bg-primary theme-text">
      <q-toolbar>
        <!-- <q-btn dense flat round icon="menu" @click="left = !left" /> -->

        <q-toolbar-title>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar> -->
          Title
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="showRight = !showRight" />
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/page1" label="Page One" />
        <q-route-tab to="/page2" label="Page Two" />
        <q-route-tab to="/page3" label="Page Three" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="showLeft" side="left" behavior="desktop" bordered>
      <!-- drawer content -->
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
      <div>text</div>
    </q-drawer>

    <q-drawer v-model="showRight" side="right" behavior="desktop" bordered>
      <!-- drawer content -->
      <div style="height: 800px;">Message view</div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from "quasar";

export default {
  name: "MyLayout",
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
