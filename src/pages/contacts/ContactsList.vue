<template>
  <div>
    <template v-if="searchText !== ''">
      <span class="pannel-hint--link" @click="clearSearch">Clear search</span>
      <div class="pannel-hint">Search results for "{{ searchText }}" in contacts:</div>
    </template>
    <template v-if="contacts.length === 0">
      <div class="pannel-hint" v-if="!contactsSyncing">No contacts</div>
      <div class="pannel-hint" v-if="contactsSyncing">Loading contact list...</div>
    </template>
    <q-list>
      <div v-for="contact in contacts" :key="contact.UUID" class="non-selectable">
        <q-item v-if="!contact.Deleted" clickable v-ripple class="contact-list-item q-py-md" @click="function (oMouseEvent) { setCurrentContactByUUID(contact.UUID, oMouseEvent) }"
            :class="{checked: isChecked(contact.UUID), selected: contact.UUID === currentContactUuid}">
          <q-item-section side>
            <q-checkbox v-model="aCheckedList" :val="contact.UUID" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-if="contact.FullName" lines="1" class="text-body1">{{contact.FullName}}</q-item-label>
            <q-item-label v-else lines="1" class="nodata non-selectable">No name</q-item-label>
            <q-item-label v-if="contact.ViewEmail" lines="1">{{contact.ViewEmail}}</q-item-label>
            <q-item-label v-else lines="1" class="nodata non-selectable">No email address</q-item-label>
          </q-item-section>
          <q-item-section side v-if="contact.Storage === 'team' && contact.BusinessEmail === currentAccountEmail">
            <q-chip dense>It's me!</q-chip>
          </q-item-section>
          <q-item-section side class="storage-type" v-if="contact.OpenPgpKeyUser">
             <q-icon v-if="contact.OpenPgpKeyUser" color="grey-4" name="vpn_key" />
          </q-item-section>
          <q-item-section side class="storage-type" v-if="currentStorage === 'all'">
             <q-icon v-if="contact.Storage === 'personal'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path class="svg-icon" d="m 12,6 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z" /></svg>
              </q-icon>
              <q-icon v-else-if="contact.Storage === 'shared'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path class="svg-icon" d="m 12,3 c -4.9587181,0 -9,4.0412819 -9,9 0,4.958718 4.0412819,9 9,9 4.958718,0 9,-4.041282 9,-9 0,-4.9587181 -4.041282,-9 -9,-9 z m 0,2 c 3.877838,0 7,3.1221621 7,7 0,3.877838 -3.122162,7 -7,7 C 8.1221621,19 5,15.877838 5,12 5,8.1221621 8.1221621,5 12,5 Z m 0,1 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z" /></svg>
              </q-icon>
              <q-icon v-else-if="contact.Storage === 'team'" color="grey-4" name="business_center" />
          </q-item-section>
        </q-item>
        <q-separator v-if="!contact.Deleted" :class="{checked: isChecked(contact.UUID), selected: contact.UUID === currentContactUuid }" />
      </div>
    </q-list>
  </div>
</template>

<style lang="scss" scoped>
/* .contact {
  /* padding: 8px 13px; */
/* }  */
.storage-type .svg-icon {
  fill: $grey-4;
}

.contact-list-item {
  .q-item__label + .q-item__label {
    margin-top: 8px;
  }
}
</style>

<script>

export default {
  name: 'ContactsList',

  props: ['allChecked'],

  data() {
    return {
      page: 1,
      perPage: 20,

      sLastCheckedUuid: '',
    }
  },

  watch: {
    editMode(val) {
      if (val) {
        this.$router.push(`edit`)
      }
    },
    'currentGroup.editable': function (val) {
      if (val) {
        this.$router.push(`group-edit`)
      }
    },
    stateForCreatingGroup (val) {
      if (val) {
        this.$router.push(`/contacts/group/'${this.currentGroupUUID}'/group-create`)
      }
    },
    importMode(val) {
      if (val) {
        this.$router.push(`/contacts/group/'${this.currentGroupUUID}'/import`)
      }
    },
    'currentStorage': function() {
      this.startAsyncGetContacts(true)
      this.aCheckedList = []
      this.setCurrentContactByUUID(null)
    },
    'currentGroupUUID': function() {
      this.startAsyncGetContacts(true)
      this.aCheckedList = []
      this.setCurrentContactByUUID(null)
    },
    'searchText': function() {
      this.startAsyncGetContacts(true)
      this.aCheckedList = []
    },
    'currentPage': function() {
      this.startAsyncGetContacts(false)
      this.aCheckedList = []
    },
    'hasChanges': function () {
      if (this.hasChanges) {
        this.startAsyncGetContacts(false)
      }
    },
    allChecked: function () {
      if (this.allChecked) {
        let aContactsUUIDsList = []
        this.contacts.forEach(element => {
          aContactsUUIDsList.push(element.UUID)
        })
        this.aCheckedList = aContactsUUIDsList
      } else {
        this.aCheckedList = []
      }
    },
    aCheckedList: function () {
      if (this.aCheckedList.length === this.contacts.length && this.contacts.lenght) {
        this.$emit('allCheckChanged', true)
      } else if (this.aCheckedList.length === 0) {
        this.$emit('allCheckChanged', false)
      }
    },
  },

  computed: {
    importMode () {
      return this.$store.getters['contacts/getImportState']
    },
    stateForCreatingGroup () {
      return this.$store.getters['contacts/getStateForCreatingGroup']
    },
    currentGroup () {
      return this.$store.getters['contacts/getCurrentGroup']
    },
    editMode () {
      return this.$store.getters['contacts/isCurrentContactEditMode']
    },
    currentContactUuid () {
      return this.$store.getters['contacts/getCurrentContactUUID']
    },
    currentAccountEmail () {
      return this.$store.getters['mail/getCurrentAccountEmail']
    },
    currentStorage () {
      return this.$store.getters['contacts/getCurrentStorage']
    },
    currentGroupUUID () {
      return this.$store.getters['contacts/getCurrentGroupUUID']
    },
    hasChanges () {
      return this.$store.getters['contacts/getHasChanges']
    },
    contacts () {
      return this.$store.getters['contacts/getContacts'].list
    },
    aCheckedList: {
      get () {
        return this.$store.getters['contacts/getCheckedContacts']
      },
      set (aNewCheckedContacts) {
        let aUuidsDiff = _.difference(aNewCheckedContacts, this.aCheckedList)
        if (aUuidsDiff.length === 1) {
          this.sLastCheckedUuid = aUuidsDiff[0]
        }
        this.$store.commit('contacts/setCheckedContacts', aNewCheckedContacts)
      },
    },
    currentPage () {
      return this.$store.getters['contacts/getCurrentPage']
    },
    searchText () {
      return this.$store.getters['contacts/getSearchText']
    },
    contactsSyncing () {
      return this.$store.getters['contacts/getSyncing'] || this.$store.getters['contacts/getLoading']
    },
  },

  mounted: function () {
    this.startAsyncGetContacts()
  },

  methods: {
    startAsyncGetContacts (bResetPage) {
      if (bResetPage) {
        this.$store.commit('contacts/setCurrentPage', 1)
      }
      this.$store.dispatch('contacts/asyncGetContacts')
    },
    setCurrentContactByUUID(sUUID, oMouseEvent) {
      if (oMouseEvent) {
        if (oMouseEvent.isTrusted) {
          if (oMouseEvent.ctrlKey) {
            this.aCheckedList = _.union(this.aCheckedList, [sUUID])
          } else if (oMouseEvent.shiftKey) {
            let aUuids = _.map(this.contacts, function (oContact) {
              return oContact.UUID
            })
            let iLastCheckedIndex = aUuids.indexOf(this.sLastCheckedUuid)
            let iCurrCheckedIndex = aUuids.indexOf(sUUID)
            if (iLastCheckedIndex !== -1 && iCurrCheckedIndex !== -1) {
              let iStartIndex = Math.min(iLastCheckedIndex, iCurrCheckedIndex)
              let iEndIndex = Math.max(iLastCheckedIndex, iCurrCheckedIndex)
              let aUidsToCheck = aUuids.slice(iStartIndex, iEndIndex + 1)
              if (aUidsToCheck.length > 0) {
                this.aCheckedList = _.union(this.aCheckedList, aUidsToCheck)
              }
            }
          } else {
            this.$store.dispatch('contacts/setCurrentContactByUUID', sUUID)
          }
          this.sLastCheckedUuid = sUUID
        }
        if (this.$route.path !== `/contacts/group/${this.currentStorage}/${sUUID}/view`) {
          this.$router.push(`/contacts/group/${this.currentStorage}/${sUUID}/view`)
        }
      } else {
        this.$store.dispatch('contacts/setCurrentContactByUUID', sUUID)
        this.sLastCheckedUuid = sUUID
      }
    },
    isChecked(sUUID) {
      return this.aCheckedList.indexOf(sUUID) !== -1
    },
    clearSearch () {
      this.$emit('clearSearch')
      this.$store.commit('contacts/setSearchText', '')
    },
  },
}
</script>
