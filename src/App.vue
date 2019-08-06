<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { colors } from 'quasar'

colors.setBrand('primary', '#000')
colors.setBrand('secondary', '#33F')
colors.setBrand('accent', '#BC4799')
colors.setBrand('positive', '#33F')
colors.setBrand('negative', '#33F')
colors.setBrand('info', '#33F')
colors.setBrand('warning', '#33F')

export default {
  name: "App"
};
</script>

<style lang="scss">
.text-brand {
  color: #fff;
}
.bg-accent-dark {
  background: rgb(150, 77, 128);

}
.bg-brand {
  background: #000;
}
.panel-rounded {
  border-radius: 5px;
}
</style>
