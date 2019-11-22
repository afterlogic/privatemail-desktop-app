<template>
  <div class="row q-pa-sm items-center">
    <q-btn v-if="currentStorage !== 'team' || currentGroupUUID !== ''" @click="createGroup" flat color="primary" icon="group_add">
      <q-tooltip>
        New Group
      </q-tooltip>
    </q-btn>

    <q-btn flat color="primary" icon="mail_outline" :disable="checkedContactsCount === 0" @click="dummyAction">
      <q-tooltip>
        New Message
      </q-tooltip>
    </q-btn>

    <q-btn-dropdown :disable="checkedContactsCount === 0" flat color="primary" icon="folder_open">
      <template v-slot:label>
        <q-tooltip>
          Add Contacts to
        </q-tooltip>
      </template>
      <q-list>
        <q-item clickable v-ripple v-for="group in groupsList" :key="group.id" @click="selectGroupForContactsList(group.UUID)">
          <q-item-section>{{group.Name}}</q-item-section>
        </q-item>
        <q-item clickable @click="createGroup" v-ripple>
          <q-item-section>- New group -</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn v-if="currentStorage === 'personal' && currentGroupUUID === ''" flat color="primary" :disable="checkedContactsCount === 0" :label="checkedContactsCount > 0 ? checkedContactsCount : ''" icon="delete_outline" @click="askDeleteContacts">
      <q-tooltip>
        Delete
      </q-tooltip>
    </q-btn>

    <q-btn-dropdown flat color="primary" icon="import_export">
      <template v-slot:label>
        <q-tooltip>
          More
        </q-tooltip>
      </template>
      <q-list>
        <q-item clickable @click="dummyAction" :disable="contactsCount === 0">
          <q-item-section>
            <q-item-label>Export as CSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dummyAction" :disable="contactsCount === 0">
          <q-item-section>
            <q-item-label>Export as VCF</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="dummyAction" v-if="currentStorage !== 'team' || currentGroupUUID !== ''">
          <q-item-section>
            <q-item-label>Import</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-space/>

    <span>
      <q-btn flat color="primary" icon="sync" :loading=contactsSyncing @click="sync" />
      <q-tooltip>
        Refresh
      </q-tooltip>
    </span>

    <q-dialog v-model="deleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Delete selected contact(s) permanently?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Delete" color="primary" @click="deleteContacts" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
  .q-chip {
    min-width: 2em;
    justify-content: center;
    background: var(--q-color-primary);
    color: #fff;
  }
</style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

export default {
  name: 'ContactsListToolbar',

  data () {
    return {
      deleteConfirm: false,
    }
  },

  computed: {
    stateForCreatingGroup: function() {
      return this.$store.getters['contacts/getStateForCreatingGroup']
    },
    contactsSyncing () {
      return this.$store.getters['contacts/getSyncing'] || this.$store.getters['contacts/getLoading']
    },
    currentStorage () {
      return this.$store.getters['contacts/getCurrentStorage']
    },
    currentGroupUUID () {
      return this.$store.getters['contacts/getCurrentGroupUUID']
    },
    groupsList () {
      return this.$store.getters['contacts/getGroups']
    },
    contactsCount () {
      return this.$store.getters['contacts/getContactsCount']
    },
    checkedContacts () {
      let aCheckedContacts = this.$store.getters['contacts/getCheckedContacts']
      if (typesUtils.isNonEmptyArray(aCheckedContacts)) {
        return aCheckedContacts
      }
      let sCurrentContactUUID = this.$store.getters['contacts/getCurrentContactUUID']
      if (typesUtils.isNonEmptyString(sCurrentContactUUID)) {
        return [sCurrentContactUUID]
      }
      return []
    },
    checkedContactsCount () {
      return this.checkedContacts.length
    },
  },

  mounted: function () {
    this.initSubscriptions()
    this.sync()
  },

  methods: {
    sync () {
      this.$store.commit('contacts/setSyncing', true)
      ipcRenderer.send('contacts-refresh', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sStorage: this.currentStorage,
      })
    },
    onContactsRefresh (event, { bHasChanges, sStorage, oError }) {
      if (_.isBoolean(bHasChanges)) {
        if (sStorage === this.currentStorage || this.currentStorage === 'all') {
          if (bHasChanges) {
            this.$store.commit('contacts/setHasChanges', true)
          }
          this.$store.commit('contacts/setSyncing', false)
        }
      } else {
        this.$store.commit('contacts/setSyncing', false)
        notification.showError(errors.getText(oError, 'Error occurred while refreshing contacts'))
      }
    },
    onDeleteContacts (oEvent, { bDeleted, oError }) {
      if (bDeleted) {
        this.$store.commit('contacts/setCheckedContacts', [])
        this.$store.commit('contacts/setHasChanges', true)
        notification.showReport('Contact(s) have been deleted successfully')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while deleting contact(s)'))
      }
    },
    initSubscriptions () {
      ipcRenderer.on('contacts-refresh', this.onContactsRefresh)
      ipcRenderer.on('contacts-delete-contacts', this.onDeleteContacts)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('contacts-refresh', this.onContactsRefresh)
      ipcRenderer.removeListener('contacts-delete-contacts', this.onDeleteContacts)
    },
    selectGroupForContactsList (UUID) {
      this.$emit('groupsUUIDforChangeGroup', UUID)
    },
    createGroup() {
      this.$store.commit('contacts/changeStateForCreatingGroup', true)
    },
    askDeleteContacts () {
      if (this.checkedContactsCount > 0) {
        this.deleteConfirm = true
      } else {
        notification.showReport('Check at least one contact to delete')
      }
    },
    deleteContacts () {
      ipcRenderer.send('contacts-delete-contacts', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sStorage: this.currentStorage,
        aContactsUUIDs: this.checkedContacts,
      })
    },
    dummyAction() {
      notification.showReport('There is no action here yet')
    }
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },
}
</script>
