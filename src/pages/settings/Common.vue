<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Common settings</div>
    <q-separator spaced />
    <!-- <div class="theme-text theme-bg" style="widht: 100px; height: 100px;">
      Some text
    </div> -->
    <q-list class="non-selectable" style="max-width: 500px;">
      <!--<q-item>
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
            v-model="oAutoRefreshIntervalMinutes"
            :options="aAutoRefreshIntervalMinutesList">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section class="non-selectable">
                  <q-item-label v-html="scope.opt.label" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side center>
          Time format
        </q-item-section>
        <q-item-section>
          <q-btn-toggle
              v-model="iTimeFormat"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="primary"
              class="custom-toggle"
              :options="aTimeFormatList"
            />
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section side center style="min-width: 100px;">
          Theme
        </q-item-section>
        <q-item-section style="flex-direction: row; justify-content: flex-start;" class="q-gutter-sm">
          <q-radio v-model="themeValue" val="light" label="Light" />
          <q-radio v-model="themeValue" val="dark" label="Dark" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="bAllowDesktopNotifications" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable desktop notifications</q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="bMinimizeToTray" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Minimize to tray</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <div class="q-pa-md">
        <q-btn unelevated v-if="!bSaving" color="primary" label="Save" align="right" @click="save" />
        <q-btn unelevated v-if="bSaving" color="primary" label="Saving..." align="right" />
    </div>
  </div>

</template>

<style lang="scss">
.custom-toggle {
  border: 1px solid var(--q-color-primary);
  align-self: flex-start;
}

</style>

<script>
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

import coreSettings from 'src/modules/core/settings.js'

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
      oAutoRefreshIntervalMinutes: null,
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

      bMinimizeToTray: true,

      bSaving: false,
    }
  },

  mounted () {
    this.themeValue = this.$store.state.main.theme
    this.bMinimizeToTray = this.$store.state.main.minimizeToTray
    this.iTimeFormat = coreSettings.iTimeFormat
    this.bAllowDesktopNotifications = coreSettings.bAllowDesktopNotifications
    this.oAutoRefreshIntervalMinutes = _.find(this.aAutoRefreshIntervalMinutesList, function (oAutoRefreshIntervalMinutes) {
      return coreSettings.iAutoRefreshIntervalMinutes === oAutoRefreshIntervalMinutes.value
    }) || null
  },

  watch: {
    '$store.state.main.theme': function (v) {
      this.themeValue = v
    },
    '$store.state.main.minimizeToTray': function (bMinimizeToTray) {
      this.bMinimizeToTray = bMinimizeToTray
    },
  },

  methods: {
    save () {
      this.$store.commit('main/setTheme', this.themeValue)
      this.$store.commit('main/setMinimizeToTray', this.bMinimizeToTray)

      this.bSaving = true
      webApi.sendRequest({
        sModule: 'Core',
        sMethod: 'UpdateSettings',
        oParameters: {
          TimeFormat: this.iTimeFormat,
          AutoRefreshIntervalMinutes: this.oAutoRefreshIntervalMinutes ? this.oAutoRefreshIntervalMinutes.value : 0,
          AllowDesktopNotifications: this.bAllowDesktopNotifications,
        },
        fCallback: (bResult, oError) => {
          this.bSaving = false
          if (bResult) {
            coreSettings.setTimeFormat(this.iTimeFormat)
            coreSettings.setAllowDesktopNotifications(this.bAllowDesktopNotifications)
            coreSettings.setAutoRefreshIntervalMinutes(this.oAutoRefreshIntervalMinutes ? this.oAutoRefreshIntervalMinutes.value : 0)
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
