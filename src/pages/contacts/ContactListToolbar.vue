<template>
  <div class="row q-pa-sm items-center">
    <span v-if="currentStorage === 'personal' || currentStorage === 'all' || currentGroupUUID !== ''">
      <q-btn flat color="primary" icon="group_add" @click="createGroup" />
      <q-tooltip>New Group</q-tooltip>
    </span>

    <span>
      <q-btn flat color="primary" icon="mail_outline" :disable="checkedContactsCount === 0" @click="emailToContacts" />
      <q-tooltip>New Message</q-tooltip>
    </span>

    <span>
      <q-btn-dropdown flat color="primary" icon="folder_open" :disable="checkedContactsCount === 0">
        <q-list class="non-selectable">
          <q-item clickable v-close-popup v-ripple v-for="group in groupsList" :key="group.UUID" @click.native="addContactsToGroup(group.UUID)">
            <q-item-section>{{group.Name}}</q-item-section>
          </q-item>
          <q-item clickable @click="createGroup" v-ripple>
            <q-item-section>- New group -</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-tooltip>Add Contacts to</q-tooltip>
    </span>

    <span v-if="currentGroupUUID !== ''">
      <q-btn flat color="primary" icon="remove_circle_outline" :label="checkedContactsCount > 0 ? checkedContactsCount : ''"
        :disable="checkedContactsCount === 0" @click="removeContactsFromGroup" />
      <q-tooltip>Remove from group</q-tooltip>
    </span>

    <span v-if="currentStorage === 'personal' && currentGroupUUID === ''">
      <q-btn flat color="primary" icon="delete_outline" :label="checkedContactsCount > 0 ? checkedContactsCount : ''"
        :disable="checkedContactsCount === 0" @click="askDeleteContacts" />
      <q-tooltip>Delete</q-tooltip>
    </span>

    <span v-if="currentStorage === 'personal' && currentGroupUUID === '' && isShareStorage">
      <q-btn flat color="primary"
        :disable="checkedContactsCount === 0" @click="updateSharedContacts">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
          <path class="share-svg-icon" d="m 12,3 c -4.9587181,0 -9,4.0412819 -9,9 0,4.958718 4.0412819,9 9,9 4.958718,0 9,-4.041282 9,-9 0,-4.9587181 -4.041282,-9 -9,-9 z m 0,2 c 3.877838,0 7,3.1221621 7,7 0,3.877838 -3.122162,7 -7,7 C 8.1221621,19 5,15.877838 5,12 5,8.1221621 8.1221621,5 12,5 Z m 0,1 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z" />
        </svg>
      </q-btn>
      <q-tooltip>Share</q-tooltip>
    </span>

    <span v-if="currentStorage === 'shared' && currentGroupUUID === ''">
      <q-btn flat color="primary"
        :disable="checkedContactsCount === 0" @click="updateSharedContacts">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
          <path class="share-svg-icon" d="m 12,3 c -4.9587181,0 -9,4.0412819 -9,9 0,4.958718 4.0412819,9 9,9 4.958718,0 9,-4.041282 9,-9 0,-0.598129 -0.06171,-1.182097 -0.173828,-1.748047 l -1.830078,1.830078 C 18.951873,15.921282 15.850103,19 12,19 8.1221621,19 5,15.877838 5,12 5,8.1446263 8.0870032,5.039791 11.933594,5.0039062 l 1.828125,-1.828125 C 13.191585,3.0619259 12.602868,3 12,3 Z m 6.585938,1 -2.125,2.125 -2.117188,-2.1171875 -1.414062,1.4140625 2.117187,2.1171875 -2.117187,2.1171875 1.414062,1.414062 2.117188,-2.117187 2.125,2.125 L 20,9.6640625 l -2.125,-2.125 2.125,-2.125 z M 12,6 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-0.03364 -0.0053,-0.0661 -0.0059,-0.09961 l -1.533203,-1.533203 -0.607422,0.607421 C 15.940127,11.30356 16,11.642587 16,12 c 0,2.220984 -1.779016,4 -4,4 -2.2209836,0 -4,-1.779016 -4,-4 0,-2.2209836 1.7790164,-4 4,-4 0.357413,0 0.696441,0.059914 1.025391,0.1464844 L 13.632812,7.5390625 12.099609,6.0058594 C 12.066098,6.0053015 12.033638,6 12,6 Z" />
        </svg>
      </q-btn>
      <q-tooltip>
        Unshare
      </q-tooltip>
    </span>

     <span>
      <q-btn-dropdown flat color="primary" icon="import_export" v-if="importExportFormats.length">
        <q-list class="non-selectable">
          <q-item v-if="importExportFormats.indexOf('csv') + 1" clickable @click="exportContacts('csv')" :disable="contactsCount === 0">
            <q-item-section>
              <q-item-label>Export as CSV</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="importExportFormats.indexOf('vcf') + 1" clickable @click="exportContacts('vcf')" :disable="contactsCount === 0">
            <q-item-section>
              <q-item-label>Export as VCF</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable @click="openImportContacts" v-if="currentStorage !== 'team' || currentGroupUUID !== ''">
            <q-item-section>
              <q-item-label>Import</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-tooltip>
        More
      </q-tooltip>
    </span>

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
  .share-svg-icon {
    fill: rgb(188, 71, 153);
  }
</style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

import coreSettings from 'src/modules/core/settings.js'
import webApi from "../../utils/webApi";
import contactsSettings from "../../modules/contacts/settings";
export default {
  name: 'ContactsListToolbar',

  data () {
    return {
      deleteConfirm: false,
      iRefreshTimer: 0,
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
    isShareStorage () {
      let storageList = JSON.stringify(this.$store.getters['contacts/getStorageList'])
      return storageList.indexOf('share') !== -1
    },
    importExportFormats () {
      return contactsSettings.contactsSettingImportExportFormats
    }
  },

  mounted: function () {
    this.initSubscriptions()
    this.sync()
  },

  methods: {
    sync () {
      clearTimeout(this.iRefreshTimer)
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
      if (coreSettings.iAutoRefreshIntervalMinutes > 0) {
        clearTimeout(this.iRefreshTimer)
        this.iRefreshTimer = setTimeout(this.sync, coreSettings.iAutoRefreshIntervalMinutes * 60000)
      }
    },
    onDeleteContacts (oEvent, { bDeleted, oError }) {
      if (bDeleted) {
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
      let sCurrentContactUuid = this.$store.getters['contacts/getCurrentContactUUID']
      if (typesUtils.isNonEmptyString(sCurrentContactUuid)) {
        let aCheckedContacts = _.clone(this.$store.getters['contacts/getCheckedContacts'])
        aCheckedContacts.push(sCurrentContactUuid)
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
      this.$store.commit('contacts/markContactsDeleted', this.checkedContacts)
      this.$store.commit('contacts/setCheckedContacts', [])
    },
    emailToContacts () {
      let aAllContacts = this.$store.getters['contacts/getContacts'].list
      let aCheckedContactsUUIDs = _.clone(this.$store.getters['contacts/getCheckedContacts'])
      let aCheckedContacts = _.filter(aAllContacts, (oContact) => {
        return _.indexOf(aCheckedContactsUUIDs, oContact.UUID) !== -1
      })
      let aToContacts = []
      _.each(aCheckedContacts, function (oContact) {
        if (typesUtils.isNonEmptyString(oContact.ViewEmail)) {
          aToContacts.push({
            full: oContact.getFull(),
            email: _.trim(oContact.ViewEmail),
            name: _.trim(oContact.FullName),
            id: oContact.EntityId,
            hasPgpKey: !!oContact.PublicPgpKey,
            pgpEncrypt: oContact.PgpEncryptMessages,
            pgpSign: oContact.PgpSignMessages,
          })
        }
      })
      this.openCompose({ aToContacts })
    },
    onUpdateSharedContacts (oEvent, { bUpdateSharedContacts, oError }) {
      if (bUpdateSharedContacts) {
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
      this.$store.commit('contacts/markContactsDeleted', this.checkedContacts)
      this.$store.commit('contacts/setCheckedContacts', [])
    },
    openImportContacts() {
      this.$store.dispatch('contacts/openImportContacts')
    },
    exportContacts(format) {
      let fileName = 'export.' + format
      let contacts = this.checkedContacts.length ? this.checkedContacts : []
      let oParameters = {
        Format: format,
        Storage: this.currentStorage,
        GroupUUID: this.currentGroupUUID,
        ContactUUIDs: contacts,
      }
      webApi.downloadExportFile(oParameters, fileName)
    }
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },

}
</script>
