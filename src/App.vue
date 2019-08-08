<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import theming from './css/theming'

export default {
  name: "App",
  watch: {
    '$store.state.main.theme': function (v) {
      this.setThemeColors(v);
    },
  },
  mounted () {
    this.setThemeColors(this.$store.state.main.theme);
  },
  methods: {
    setThemeColors (v) {
      if (v === 'light') {
        theming.setLightThemeColors()
      } else {
        theming.setDarkhemeColors()
      }
    },
  }
};


</script>

<style lang="scss">
.theme-text {
  color: var(--q-color-t-text);
}
.theme-bg {
  background-color: var(--q-color-t-background);
}
.big-button {
  border: 2px solid var(--q-color-primary);
  background: var(--q-color-primary-dark);
}

.main-tabs {
  background: var(--q-color-t-gradient-start);
  color: var(--q-color-t-text);
}

.bg-accent-dark {
  background: #6d5d7e;
}
.panel-rounded {
  border-radius: 0px;
}
</style>
