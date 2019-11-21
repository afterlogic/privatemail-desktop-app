<template>
  <div>
    <template v-if="contacts.list.length === 0">
      <div class="pannel-hint" v-if="!contactsSyncing">No contacts</div>
      <div class="pannel-hint" v-if="contactsSyncing">Loading contact list...</div>
    </template>
    <q-list>
      <div v-for="contact in contacts.list" :key="contact.UUID">
        <q-item clickable v-ripple @click="setCurrentContactByUUID(contact.UUID)" 
            :class="{checked: isChecked(contact.UUID), selected: contact.UUID === selectedContact}">
          <q-item-section side>
            <q-checkbox v-model="aCheckedList" :val="contact.UUID" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-if="contact.FullName" lines="1">{{contact.FullName}}</q-item-label>
            <q-item-label v-else lines="1" class="contact-notext">No name</q-item-label>
            <q-item-label v-if="contact.ViewEmail" lines="1">{{contact.ViewEmail}}</q-item-label>
            <q-item-label v-else lines="1" class="contact-notext">No email address</q-item-label>
          </q-item-section>
          <q-item-section side v-if="contact.Storage === 'team' && contact.BusinessEmail === currentAccountEmail">
            <q-chip dense>It's me!</q-chip>
          </q-item-section>
        </q-item>
        <q-separator :class="{checked: isChecked(contact.UUID), selected: contact.UUID === selectedContact }" />
      </div>
    </q-list>
  </div>
</template>

<style lang="scss" scoped>
/* .contact {
  /* padding: 8px 13px; */
/* }  */

</style>

<script>
export default {
  name: 'ContactsList',
  props: ['allChecked', 'groupUUID'],
  data() {
    return {
      page: 1,
      perPage: 20,
      // aCheckedList: [],
      selectedContact: null,
    }
  },

  beforeMount: function () {
    let contact = this.$store.getters['contacts/getCurrentContact']
    if (contact.UUID) {
      this.selectedContact = contact.UUID
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
    },
    'currentPage': function() {
      this.startAsyncGetContacts(false)
    },
    'hasChanges': function () {
      if (this.hasChanges) {
        this.startAsyncGetContacts(false)
      }
    },
    'contacts.list': function () {
      this.setCurrentContactByUUID(this.selectedContact)
    },
    'allChecked': function() {
      if (this.allChecked) {
        let aContactsUUIDsList = []
        this.contacts.list.forEach(element => {
          aContactsUUIDsList.push(element.UUID)
        }); 
        this.aCheckedList = aContactsUUIDsList
      } else {
        this.aCheckedList = []
      }
    },
    'aCheckedList': function() {      
      if (this.aCheckedList.length === this.contacts.list.length && this.contacts.list.lenght) {
        this.$emit('allCheckChanged', true)
      } else if (this.aCheckedList.length === 0) {
        this.$emit('allCheckChanged', false)
      }

    },
    'groupUUID': function() {
      if (this.groupUUID) {
        let contactsToMoveInGroup = []
        this.aCheckedList.forEach(element => {
          let contact = _.find(this.contacts.list, element.UUID)
          contact ? contactsToMoveInGroup.push(contact) : null
        })

        if (contactsToMoveInGroup.length) {
          console.log(contactsToMoveInGroup)
        }
      } 
    },
  },

  computed: {
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
      }
    },
    currentPage () {
      return this.$store.getters['contacts/getСurrentPage']
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
      this.selectedContact = UUID
    },
    isChecked(UUID) {
      return !!_.find(this.aCheckedList, (el) => el === UUID)
    },
  },
}
</script>
