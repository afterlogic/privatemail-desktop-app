<template>
  <div class="row q-pa-sm items-center">
    <q-btn @click="createGroup" flat color="primary" icon="group_add" />
    <q-btn flat color="primary" icon="mail_outline" />
    <q-btn-dropdown flat color="primary" icon="folder_open">
      <q-list>
        <q-item clickable v-ripple v-for="group in groupsList" :key="group.id" @click="selectGroupForContactsList(group.UUID)">
          <q-item-section>{{group.Name}}</q-item-section>
        </q-item>
        <q-item clickable @click="createGroup" v-ripple>
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
    <q-btn flat color="primary" icon="sync" :loading=contactsSyncing @click="sync">
      <q-tooltip>
        Refresh
      </q-tooltip>
    </q-btn>
  </div>
</template>

<style></style>

<script>
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
    'stateForCreatingGroup': function() {
      return this.$store.getters['contacts/getStateForCreatingGroup']
    },
    contactsSyncing () {
      return this.$store.getters['contacts/getSyncing'] || this.$store.getters['contacts/getLoading']
    },
    currentStorage () {
      return this.$store.getters['contacts/getCurrentStorage']
    },
  },

  mounted: function () {
    this.groupsList = this.$store.getters['contacts/getGroups']

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
      if (_.isBoolean(bHasChanges)) {
        if (sStorage === this.currentStorage) {
          if (bHasChanges) {
            this.$store.commit('contacts/setHasChanges', true)
          }
          this.$store.commit('contacts/setSyncing', false)
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

    selectGroupForContactsList (UUID) {
      this.$emit('groupsUUIDforChangeGroup', UUID)
    },

    createGroup() {
      this.$store.commit('contacts/changeStateForCreatingGroup', true)
    },
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },
}
</script>
