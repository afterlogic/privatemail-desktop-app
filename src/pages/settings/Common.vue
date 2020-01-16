<template>
  <div>
    <div class="text-h4 q-mb-md">Common settings</div>
    <q-separator spaced />
    <!-- <div class="theme-text theme-bg" style="widht: 100px; height: 100px;">
      Some text
    </div> -->
    <q-list style="max-width: 500px;">
      <!-- <q-item>
        <q-item-section side center style="min-width: 100px;">
          Theme
        </q-item-section>
        <q-item-section style="flex-direction: row; justify-content: flex-start;" class="q-gutter-sm">
          <q-radio v-model="themeValue" val="light" label="Light" />
          <q-radio v-model="themeValue" val="dark" label="Dark" />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side center style="min-width: 100px;">
          Language
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="languageValue" :options="languagesList" dense style="width: 100%;"/>
        </q-item-section>
      </q-item> -->

      <q-item>
        <q-item-section side center style="min-width: 100px;">
          Refresh every
        </q-item-section>
        <q-item-section>
          <q-select
            outlined dense style="width: 100%;"
            emit-value
            v-model="iAutoRefreshIntervalMinutes"
            :options="aAutoRefreshIntervalMinutesList" />
        </q-item-section>
      </q-item>


      <q-item>
        <q-item-section side center>
          Time format
        </q-item-section>
        <q-item-section>
          <q-btn-toggle
              v-model="iTimeFormat"
              spread
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              :options="aTimeFormatList"
            />
        </q-item-section>
      </q-item>

      <!-- <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="bAllowDesktopNotifications" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable desktop notifications</q-item-label>
        </q-item-section>
      </q-item> -->
    </q-list>
    <q-separator spaced />
    <q-btn v-if="!bSaving" color="primary" label="Save" align="right" @click="save" />
    <q-btn v-if="bSaving" color="primary" label="Saving..." align="right" />
  </div>

</template>

<style lang="scss">
</style>

<script>
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

export default {
  name: 'CommonSettings',

  data () {
    return {
      themeValue: '',
      themesList: [
        'light',
        'dark',
      ],
      languageValue: null,
      languagesList: [
        {
          label: 'English',
          value: 'en-GB',
          description: 'English language'
        },
        {
          label: 'Русский',
          value: 'ru-RU',
          description: 'Русский язык'
        },
      ],
      iAutoRefreshIntervalMinutes: 1,
      aAutoRefreshIntervalMinutesList: [
        {
          label: 'Off',
          value: 0,
        },
        {
          label: '1 minute',
          value: 1,
        },
        {
          label: '3 minutes',
          value: 3,
        },
        {
          label: '5 minutes',
          value: 5,
        },
        {
          label: '10 minutes',
          value: 10,
        },
        {
          label: '15 minutes',
          value: 15,
        },
        {
          label: '20 minutes',
          value: 20,
        },
        {
          label: '30 minutes',
          value: 30,
        },
      ],
      iTimeFormat: 1,
      aTimeFormatList: [
        {
          label: '1PM',
          value: 1,
        },
        {
          label: '13:00',
          value: 0,
        },
      ],
      bAllowDesktopNotifications: false,

      bSaving: false,
    }
  },

  mounted () {
    this.themeValue = this.$store.state.main.theme
  },

  watch: {
    '$store.state.main.theme': function (v) {
      this.themeValue = v
    },
  },

  methods: {
    save () {
      // this.$store.commit('main/setTheme', this.themeValue)

      this.bSaving = true
      webApi.sendRequest({
        sModule: 'Core',
        sMethod: 'UpdateSettings',
        oParameters: {
          TimeFormat: this.iTimeFormat,
          AutoRefreshIntervalMinutes: this.iAutoRefreshIntervalMinutes,
          // AllowDesktopNotifications: this.bAllowDesktopNotifications,
        },
        fCallback: (bResult, oError) => {
          this.bSaving = false
          if (bResult) {
            notification.showReport('Settings have been updated successfully.')
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
          }
        },
      })
    },
  },
}
</script>
