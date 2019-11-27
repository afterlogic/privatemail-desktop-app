<template>
  <q-item-section v-if="oCurrentGroup" class="column full-height">
    <div class="head col-auto">
      <div class="head--labels">
        <q-item-label class="head--labels-name">View Group</q-item-label>
      </div>
      <div class="buttons">
        <q-btn no-wrap no-caps unelevated flat class="head--buttons-off" color="grey-7" label="Delete group" @click="askDeleteGroup" />
        <q-btn no-wrap no-caps unelevated flat class="head--buttons-off" color="grey-7" label="Edit group" @click="openEditGroup"/>
        <q-btn no-wrap no-caps unelevated color="primary" label="Email to this group" @click="emailToGroup" :disable="totalContactsCount === 0" />
      </div>
    </div>

    <div class="frame-top q-mx-md"></div>
    <div class="col">
      <div class="column full-height">
        <div class="col">
          <q-scroll-area class="full-height">
            <div class="frame-without-top q-mx-md">
              <q-item-label class="info-line" v-if="oCurrentGroup.Name"><span class="label-names">Group Name:</span> {{ oCurrentGroup.Name }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Email"><span class="label-names">Email: </span>{{ oCurrentGroup.Email }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Company"><span class="label-names">Company: </span>{{ oCurrentGroup.Company }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.State"><span class="label-names">State: </span>{{ oCurrentGroup.State }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.City"><span class="label-names">City: </span>{{ oCurrentGroup.City }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Street"><span class="label-names">Street: </span>{{ oCurrentGroup.Street }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Zip"><span class="label-names">Zip: </span>{{ oCurrentGroup.Zip }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Phone"><span class="label-names">Phone: </span>{{ oCurrentGroup.Phone }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Fax"><span class="label-names">Fax: </span>{{ oCurrentGroup.Fax }}</q-item-label>
              <q-item-label class="info-line" v-if="oCurrentGroup.Web"><span class="label-names">Web: </span>{{ oCurrentGroup.Web }}</q-item-label>
            </div>
          </q-scroll-area>
        </div>
      </div>
    </div>

    <q-dialog v-model="deleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Delete the group permanently?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Delete" color="primary" @click="deleteGroup" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-item-section>
</template>

<style scoped>
.head {
  padding: 15px 20px 21px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.head--labels-name {
  font-size: 18pt;
  font-weight: normal;
  white-space: normal;
  color: #555566;
}

.frame-top {
  height: 5px;
  border: 1px solid #ccc;
  border-bottom: 0;
  border-radius: 5px 5px 0px 0px;
}

.frame-without-top {
  border: 1px solid #ccc;
  border-top: 0px;
  border-radius: 0px 0px 5px 5px;
  min-height: 200px;
  padding: 8px 0px 12px;
}

.label-names {
  margin-right: 3%;
}

.head--buttons-off {
  border-radius: none;
  background: none;
  border: none;
  text-shadow: none;
}

.info-main {
  display: flex;
}

.info-line {
  margin: 10px 0px 20px 25px;
  font-size: 9pt;
}
</style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types'

import CGroup from 'src/modules/contacts/classes/CGroup.js'

export default {
  name: 'GroupView',

  data() {
    return {
      deleteConfirm: false,
    }
  },

  computed: {
    oCurrentGroup: function () {
      let oGroupContainer = this.$store.getters['contacts/getCurrentGroup']
      let oCurrentGroup = _.cloneDeep(oGroupContainer.group)
      return (oCurrentGroup && oCurrentGroup instanceof CGroup) ? oCurrentGroup : null
    },
    groupList: function () {
      return this.$store.getters['contacts/getGroups']
    },
    contactsCount: function () {
      let aCurrentContacts = this.$store.getters['contacts/getContacts'].list
      return _.isArray(aCurrentContacts) ? aCurrentContacts.length : 0
    },
    totalContactsCount: function () {
      return this.$store.getters['contacts/getContactsCount']
    },
  },

  watch: {
    'groupList': function () {
      let sCurrentUUID = this.$store.getters['contacts/getCurrentGroupUUID']
      let oGroup = _.find(this.groupList, function (oGroup) {
        return oGroup.UUID === sCurrentUUID
      })
      this.$store.commit('contacts/setCurrentGroup', oGroup)
    },
  },

  mounted: function () {
    this.initSubscriptions()
  },

  methods: {
    openEditGroup() {
      this.$store.dispatch('contacts/openEditGroup')
    },
    emailToGroup () {
      if (this.totalContactsCount === this.contactsCount) {
        let aContacts = this.$store.getters['contacts/getContacts'].list
        this.onGetGroupEmails(null, { aContacts })
      } else {
        ipcRenderer.send('contacts-get-all-group-contacts', {
          sStorage: 'all',
          sGroupUUID: this.oCurrentGroup.UUID,
        })
      }
    },
    onGetGroupEmails (oEvent, { aContacts, oRequestParams, oError }) {
      let aToAddr = []
      if (typesUtils.isNonEmptyArray(aContacts)) {
        _.each(aContacts, function (oContact) {
          let sToAddr = oContact.getFull()
          if (typesUtils.isNonEmptyString(sToAddr)) {
            aToAddr.push(sToAddr)
          }
        })
      }
      this.openCompose({ sToAddr: aToAddr.join(', ') })
    },
    askDeleteGroup () {
      this.deleteConfirm = true
    },
    deleteGroup () {
      ipcRenderer.send('contacts-delete-group', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        sUUID: this.oCurrentGroup.UUID,
      })
    },
    onDeleteGroup (oEvent, { bDeleted, oError }) {
      if (bDeleted) {
        this.$store.dispatch('contacts/asyncGetGroups')
        notification.showReport('Group has been deleted successfully')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while deleting group'))
      }
    },
    initSubscriptions () {
      ipcRenderer.on('contacts-get-all-group-contacts', this.onGetGroupEmails)
      ipcRenderer.on('contacts-delete-group', this.onDeleteGroup)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('contacts-get-all-group-contacts', this.onGetGroupEmails)
      ipcRenderer.removeListener('contacts-delete-group', this.onDeleteGroup)
    },
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },
}
</script>
