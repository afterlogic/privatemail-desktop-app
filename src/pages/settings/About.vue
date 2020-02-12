<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">About</div>
    <q-separator spaced />
    <div class="q-pa-md" style="background: #f0f0f0; text-align: center; display: inline-block; padding: 20px; border-radius: 10px;" >
        <b style="font-size: 120%;">PrivateMail for Windows</b>
        <div>Version {{version}}</div>
        <div class="non-selectable" style="margin: 1em 0px 2em;">
          <img src="~assets/app-icon.svg" style="width: 64px;"/>
        <!-- <span style="background: var(--q-color-t-background); display: inline-block; padding: 20px; border-radius: 10px;"> -->
            <!-- <img src="~assets/private-mail-logo-small.svg" /> -->
        <!-- </span> -->
        </div>
        <div>
            <a target="_blank" href="https://privatemail.com/terms.php">Terms of service</a>
        </div>
        <div>
            <a target="_blank" href="https://privatemail.com/privacy.php">Privacy policy</a>
        </div>
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import {version} from '../../../package.json'

export default {
  data () {
    return {
        version: version
    }
  },
}
</script>
