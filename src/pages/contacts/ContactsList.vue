<template>
  <div>
    <template v-if="searchText !== ''">
      <span class="pannel-hint--link" @click="clearSearch">Clear search</span>
      <div class="pannel-hint">Search results for "{{ searchText }}" in contacts:</div>
    </template>
    <template v-if="contacts.list.length === 0">
      <div class="pannel-hint" v-if="!contactsSyncing">No contacts</div>
      <div class="pannel-hint" v-if="contactsSyncing">Loading contact list...</div>
    </template>
    <q-list>
      <div v-for="contact in contacts.list" :key="contact.UUID">
        <q-item clickable v-ripple class="contact-list-item q-py-md" @click="setCurrentContactByUUID(contact.UUID)" 
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
        <q-separator :class="{checked: isChecked(contact.UUID), selected: contact.UUID === currentContactUuid }" />
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
import typesUtils from 'src/utils/types.js'

export default {
  name: 'ContactsList',

  props: ['allChecked'],

  data() {
    return {
      page: 1,
      perPage: 20,
    }
  },

  watch: {
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
        this.contacts.list.forEach(element => {
          aContactsUUIDsList.push(element.UUID)
        })
        this.aCheckedList = aContactsUUIDsList
      } else {
        this.aCheckedList = []
      }
    },
    aCheckedList: function () {
      if (this.aCheckedList.length === this.contacts.list.length && this.contacts.list.lenght) {
        this.$emit('allCheckChanged', true)
      } else if (this.aCheckedList.length === 0) {
        this.$emit('allCheckChanged', false)
      }
    },
  },

  computed: {
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
      return this.$store.getters['contacts/getContacts']
    },
    aCheckedList: {
      get () {
        return this.$store.getters['contacts/getCheckedContacts']
      },
      set (value) {
        this.$store.commit('contacts/setCheckedContacts', value)
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

  methods: {
    startAsyncGetContacts (bResetPage) {
      if (bResetPage) {
        this.$store.commit('contacts/setCurrentPage', 1)
      }
      this.$store.dispatch('contacts/asyncGetContacts')
    },
    setCurrentContactByUUID(UUID) {
      this.$store.dispatch('contacts/setCurrentContactByUUID', UUID)
    },
    isChecked(UUID) {
      return !!_.find(this.aCheckedList, (el) => el === UUID)
    },
    clearSearch () {
      this.$store.commit('contacts/setSearchText', '')
    },
  },
}
</script>
