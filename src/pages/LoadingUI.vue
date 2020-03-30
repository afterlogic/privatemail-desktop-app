<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex content-center justify-center full-height theme-text">
    </q-page>
  </q-page-container>
</template>

<style lang="scss" scoped>

</style>

<script>
import { ipcRenderer } from 'electron'
import { QSpinnerGears } from 'quasar'

import _ from 'lodash'
import moment from 'moment'

import notification from 'src/utils/notification.js'

export default {
  name: 'LoadingUI',

  data () {
    return {
      oMigrationInfo: {},
      iTimeout: -1,
      bShowMigrateTime: false,
    }
  },

  computed: {
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
  },

  beforeDestroy: function () {
    clearTimeout(this.iTimeout)
    this.$q.loading.hide()
    ipcRenderer.removeAllListeners('main-migration')
  },

  mounted () {
    this.$q.loading.show({
      spinnerColor: 'primary',
    })
    ipcRenderer.on('main-migration', (event, oMigrationInfo) => {
      this.oMigrationInfo = oMigrationInfo
      if (_.isObject(this.oMigrationInfo) && !_.isEmpty(this.oMigrationInfo)) {
        this.showMigrationInfo()
        if (this.oMigrationInfo.bFinished) {
          this.getUserData()
        }
      } else {
        this.getUserData()
      }
    })
    ipcRenderer.send('main-migration')
  },

  methods: {
    getUserData () {
      ipcRenderer.once('main-get-user-data', (event, oUserData) => {
        if (!this.oMigrationInfo.sError) {
          if (oUserData) {
            this.$store.commit('main/setDataFromServer', oUserData.main)
            this.$store.commit('user/setDataFromServer', oUserData.user)
            let bAuthorized = this.$store.getters['user/isAuthorized']
            if (bAuthorized) {
              if (!this.currentAccount) {
                this.$store.dispatch('mail/asyncGetSettings', () => {
                  let sCurrentPath = this.$router.currentRoute && this.$router.currentRoute.path ? this.$router.currentRoute.path : ''
                  if (this.currentAccount) {
                    if (sCurrentPath !== '/mail') {
                      ipcRenderer.send('init', { sApiHost: this.$store.getters['main/getApiHost'], sAuthToken: this.$store.getters['user/getAuthToken'] })
                      this.$router.push({ path: '/mail' })
                    }
                  } else {
                    if (sCurrentPath !== '/login') {
                      this.$router.push({ path: '/login' })
                    }
                  }
                })
              } else {
                ipcRenderer.send('init', { sApiHost: this.$store.getters['main/getApiHost'], sAuthToken: this.$store.getters['user/getAuthToken'] })
                this.$router.push({ path: '/mail' })
              }
            } else {
              this.$router.push({ path: '/login' })
            }
          } else {
            this.$router.push({ path: '/login' })
          }
        }
      })
      ipcRenderer.send('main-get-user-data')
    },
    showMigrationInfo () {
      clearTimeout(this.iTimeout)
      let { iStartedTime, iApproximateTimeSeconds, bFinished, sError } = this.oMigrationInfo
      if (sError) {
        this.$q.loading.hide()
        notification.showError('Error occured while migration: ' + sError, 0)
      } else if (bFinished) {
        this.$q.loading.show({
          spinnerColor: 'primary',
        })
      } else {
        let iNowTime = moment().unix()
        let sMessage = 'Performing database update...<br/>Please wait until the update will be finished.'
        if (this.bShowMigrateTime && _.isInteger(iApproximateTimeSeconds) && iNowTime - iStartedTime > 10) {
          let iLeftTime = (iApproximateTimeSeconds + iStartedTime) - iNowTime
          if (iLeftTime > 60) {
            sMessage = 'Performing database update...<br/>Approximately ' + Math.round(iLeftTime / 60) +  ' minutes are left...'
          } else if (iLeftTime > 0) {
            sMessage = 'Performing database update...<br/>Approximately ' + iLeftTime +  ' seconds are left...'
          } else {
            sMessage = 'Performing database update...<br/>Some extra time is required'
          }
        }
        this.bShowMigrateTime = !this.bShowMigrateTime
        this.$q.loading.show({
          spinner: QSpinnerGears,
          spinnerColor: 'primary',
          message: sMessage,
        })
        this.iTimeout = setTimeout(() => {
          this.showMigrationInfo()
        }, 20000)
      }
    },
  },
}
</script>
