<template>
  <q-toolbar>
    <q-btn flat color="primary" icon="group_add" />
    <q-btn flat color="primary" icon="mail_outline" />
    <q-btn-dropdown flat color="primary" icon="folder_open">
      <q-list>
        <q-item clickable v-ripple v-for="group in groupsList" :key="group.id">
          <q-item-section>{{group.name}}</q-item-section>
        </q-item>
        <q-item clickable v-ripple>
          <q-item-section>- New group -</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-btn flat color="primary" icon="delete_outline" />
    <q-btn-dropdown flat color="primary" icon="import_export">
      <q-list>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Export as CSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Export as VCF</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>
            <q-item-label>Import</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-space/>
    <q-btn flat color="primary" icon="sync" @click="sync" v-if="!contactsSyncing">
      <q-tooltip>
        Refresh
      </q-tooltip>
    </q-btn>
    <q-spinner color="primary" size="1.5em" @click="sync" v-if="contactsSyncing">
      <q-tooltip>
        Refresh
      </q-tooltip>
    </q-spinner>
  </q-toolbar>
</template>

<style></style>

<script>
import { groups } from '../../contactsData.js'
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

export default {
  name: 'ContactsListToolbar',
  components: {
  },
  data () {
    return {
      groupsList: [],
    }
  },

  computed: {
    contactsSyncing () {
      return this.$store.getters['contacts/getSyncing']
    },
    currentStorage () {
      return this.$store.getters['contacts/getCurrentStorage']
    },
  },

  mounted () {
    this.groupsList = groups

    this.initSubscriptions()
    this.sync()
  },

  methods: {
    sync () {
      this.$store.commit('contacts/setSyncing', true)
      ipcRenderer.send('contacts-refresh', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sStorage: this.$store.getters['contacts/getCurrentStorage'],
      })
    },
    onContactsRefresh (event, { bHasChanges, sStorage, oError }) {
      this.$store.commit('contacts/setSyncing', false)
      if (_.isBoolean(bHasChanges)) {
        if (bHasChanges && sStorage === this.currentStorage) {
          this.$store.commit('contacts/setHasChanges', true)
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while refreshing of contacts'))
      }
    },
    initSubscriptions () {
      ipcRenderer.on('contacts-refresh', this.onContactsRefresh)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('contacts-refresh', this.onContactsRefresh)
    },
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },
}
</script>
