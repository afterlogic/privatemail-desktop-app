<template>
  <div class="row q-pa-sm items-center">
    <q-btn v-if="currentStorage === 'personal' || currentStorage === 'all' || currentGroupUUID !== ''" @click="createGroup" flat color="primary" icon="group_add">
      <q-tooltip>
        New Group
      </q-tooltip>
    </q-btn>

    <q-btn flat color="primary" icon="mail_outline" :disable="checkedContactsCount === 0" @click="emailToContacts">
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
        <q-item clickable v-close-popup v-ripple v-for="group in groupsList" :key="group.UUID" @click.native="addContactsToGroup(group.UUID)">
          <q-item-section>{{group.Name}}</q-item-section>
        </q-item>
        <q-item clickable @click="createGroup" v-ripple>
          <q-item-section>- New group -</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>

    <q-btn v-if="currentGroupUUID !== ''" flat color="primary" :disable="checkedContactsCount === 0" :label="checkedContactsCount > 0 ? checkedContactsCount : ''" 
        icon="remove_circle_outline" @click="removeContactsFromGroup">
      <q-tooltip>
        Remove from group
      </q-tooltip>
    </q-btn>

    <q-btn v-if="currentStorage === 'personal' && currentGroupUUID === ''" flat color="primary" 
        :disable="checkedContactsCount === 0" :label="checkedContactsCount > 0 ? checkedContactsCount : ''" icon="delete_outline" @click="askDeleteContacts">
      <q-tooltip>
        Delete
      </q-tooltip>
    </q-btn>

    <q-btn  v-if="currentStorage === 'personal' && currentGroupUUID === ''"
            :disable="checkedContactsCount === 0"
            flat color="primary" icon="adjust"
            @click="updateSharedContacts">
      <q-tooltip>
        Share
      </q-tooltip>
    </q-btn>

    <q-btn  v-if="currentStorage === 'shared' && currentGroupUUID === ''"
            :disable="checkedContactsCount === 0"
            flat color="primary" icon="remove_circle_outline"
            @click="updateSharedContacts">
      <q-tooltip>
        Unshare
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
      ipcRenderer.on('contacts-add-contacts-to-group', this.onAddContactsToGroup)
      ipcRenderer.on('contacts-remove-contacts-from-group', this.onRemoveContactsFromGroup)
      ipcRenderer.on('contacts-update-shared-contacts', this.onUpdateSharedContacts)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('contacts-refresh', this.onContactsRefresh)
      ipcRenderer.removeListener('contacts-delete-contacts', this.onDeleteContacts)
      ipcRenderer.removeListener('contacts-add-contacts-to-group', this.onAddContactsToGroup)
      ipcRenderer.removeListener('contacts-remove-contacts-from-group', this.onRemoveContactsFromGroup)
      ipcRenderer.removeListener('contacts-update-shared-contacts', this.onUpdateSharedContacts)
    },
    addContactsToGroup (sGroupUUID) {
      let aAllContacts = this.$store.getters['contacts/getContacts'].list
      let aContacts = _.filter(aAllContacts, (oContact) => {
        return _.indexOf(this.checkedContacts, oContact.UUID) !== -1
      })
      notification.showLoading('Adding contacts to the group...')
      ipcRenderer.send('contacts-add-contacts-to-group', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sGroupUUID,
        aContacts,
        aContactsUUIDs: this.checkedContacts,
      })
    },
    onAddContactsToGroup (oEvent, { bAdded, oError }) {
      notification.hideLoading()
      if (bAdded) {
        this.$store.commit('contacts/setHasChanges', true)
        notification.showReport('Contacts were added to the group successfully.')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding contacts to the group'))
      }
    },
    removeContactsFromGroup () {
      let sGroupUUID = this.currentGroupUUID
      let aAllContacts = this.$store.getters['contacts/getContacts'].list
      let aContacts = _.filter(aAllContacts, (oContact) => {
        return _.indexOf(this.checkedContacts, oContact.UUID) !== -1
      })
      notification.showLoading('Removing contacts from the group...')
      ipcRenderer.send('contacts-remove-contacts-from-group', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sGroupUUID,
        aContacts,
        aContactsUUIDs: this.checkedContacts,
      })
    },
    onRemoveContactsFromGroup (oEvent, oResult) {
      let { bRemoved, oError } = oResult
      notification.hideLoading()
      if (bRemoved) {
        this.$store.commit('contacts/setCheckedContacts', [])
        this.$store.commit('contacts/setHasChanges', true)
        notification.showReport('Contacts were removed from the group successfully.')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing contacts from the group'))
      }
    },
    createGroup () {
      let oCurrentContact = this.$store.getters['contacts/getCurrentContact'].contact
      if (oCurrentContact) {
        let aCheckedContacts = _.clone(this.$store.getters['contacts/getCheckedContacts'])
        aCheckedContacts.push(oCurrentContact.UUID)
        this.$store.commit('contacts/setCheckedContacts', aCheckedContacts)
        this.$store.dispatch('contacts/setCurrentContactByUUID', null)
      }
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
    emailToContacts () {
      let aAllContacts = this.$store.getters['contacts/getContacts'].list
      let aCheckedContactsUUIDs = _.clone(this.$store.getters['contacts/getCheckedContacts'])
      let aCheckedContacts = _.filter(aAllContacts, (oContact) => {
        return _.indexOf(aCheckedContactsUUIDs, oContact.UUID) !== -1
      })
      let aToAddr = []
      _.each(aCheckedContacts, function (oContact) {
        let sToAddr = oContact.getFull()
        if (typesUtils.isNonEmptyString(sToAddr)) {
          aToAddr.push(sToAddr)
        }
      })
      this.openCompose({ sToAddr: aToAddr.join(', ') })
    },
    onUpdateSharedContacts (oEvent, { bUpdateSharedContacts, oError }) {
      if (bUpdateSharedContacts) {
        this.$store.commit('contacts/setCheckedContacts', [])
        this.$store.commit('contacts/setHasChanges', true)
        if (this.currentStorage === 'personal') {
          notification.showReport('Contact(s) have been shared successfully')
        } else {
          notification.showReport('Contact(s) have been unshared successfully')
        }
      } else {
        if (this.currentStorage === 'personal') {
          notification.showError(errors.getText(oError, 'Error occurred while sharing contact(s)'))
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while unsharing contact(s)'))
        }
      }
    },
    updateSharedContacts () {
      ipcRenderer.send('contacts-update-shared-contacts', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sStorage: this.currentStorage,
        aContactsUUIDs: this.checkedContacts,
      })
    },
    dummyAction () {
      notification.showReport('There is no action here yet')
    },
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },
}
</script>
