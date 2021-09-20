<template>
  <q-splitter v-model="splitterContactModel" separator-class="main-split-separator">
    <template v-slot:before>
      <div class="column full-height bg-white text-grey-8 panel-rounded">
        <div class="col-auto">
          <contact-list-toolbar ref="contactsListToolbar" />
          <q-toolbar class="q-px-md q-py-sm full-width bg-grey-3">
            <q-checkbox v-model="allChecked" />
            <q-input outlined rounded dense bg-color="white" class="search-field" v-model="searchInputText" v-on:keyup.enter="search" style="width: 100%;">
              <template v-slot:prepend>
                <q-icon name="search" ></q-icon>
              </template>
              <!-- <template v-slot:after>
                <q-btn round dense flat icon="send" ></q-btn>
              </template> -->
            </q-input>
          </q-toolbar>
        </div>
        <div class="col" @keydown="onKeydown">
          <q-scroll-area ref="contactListScrollArea" class="full-height">
            <contacts-list v-bind:allChecked="allChecked" @allCheckChanged="onCheckChange" @clearSearch="searchInputText = ''"/>
          </q-scroll-area>
        </div>
        <div class="col-auto">
          <Pagination :currentPage="currentPage" :itemsPerPage="contactsPerPage" :itemsCount="contactsCount" :changePage="changePage" />
        </div>
      </div>
    </template>
    <template v-slot:after>
      <div class="full-height bg-white text-grey-8 panel-rounded">
        <router-view :contact="contact"></router-view>
      </div>
    </template>
  </q-splitter>
</template>

<script>
import hotkeys from "../../utils/hotkeys";

import Pagination from '../Pagination.vue'
import ContactsList from './ContactsList.vue'
import ContactListToolbar from './ContactListToolbar.vue'

export default {
  name: 'ContactsView',
  components: {
    ContactsList,
    ContactListToolbar,
    Pagination
  },
  data () {
    return {
      splitterContactModel: 50,
      allChecked: false,
      searchInputText: '',
    }
  },
  computed: {
    contact: function() {
      return this.$store.getters['contacts/getCurrentContact']
    },
    currentPage () {
      return this.$store.getters['contacts/getCurrentPage']
    },
    contactsPerPage () {
      return this.$store.getters['contacts/getContactsPerPage']
    },
    contactsCount () {
      return this.$store.getters['contacts/getContactsCount']
    },
  },
  methods: {
    search () {
      this.$store.commit('contacts/setSearchText', this.searchInputText)
    },
    onKeydown (oKeyboardEvent) {
      if (!hotkeys.isTextFieldFocused()) {
        let iKeyCode = oKeyboardEvent.keyCode
        if (!oKeyboardEvent.altKey && !oKeyboardEvent.ctrlKey && !oKeyboardEvent.shiftKey) {
          if (this.currentContact && (iKeyCode === 33 || iKeyCode === 34 || iKeyCode === 35 || iKeyCode === 36 || iKeyCode === 38 || iKeyCode === 40)) {
            let iСurrentContactIndex = _.findIndex(this.contacts, (oContact) => {
              return oContact.UUID === this.currentContact.UUID
            })
            let iNewContactIndex = -1
            switch (iKeyCode) {
              case 34: // page down
              case 35: // end
                iNewContactIndex = this.contacts.length - 1
                break
              case 33: // page up
              case 36: // home
                iNewContactIndex = 0
                break
              case 38: // up
                iNewContactIndex = iСurrentContactIndex - 1
                break
              case 40: // down
                iNewContactIndex = iСurrentContactIndex + 1
                break
            }
            if (iNewContactIndex >= 0 && iNewContactIndex < this.contacts.length) {
              let oNewContact = this.contacts[iNewContactIndex]
              this.$store.dispatch('contacts/setCurrentContactByUUID', oNewContact.UUID)
            }
            oKeyboardEvent.preventDefault()
          }

          if (iKeyCode === 46) { // delete
            if (this.$refs.contactsListToolbar && _.isFunction(this.$refs.contactsListToolbar.askDeleteContacts)) {
              this.$refs.contactsListToolbar.askDeleteContacts()
            }
            oKeyboardEvent.preventDefault()
          }
        }
      }
    },
    onCheckChange(value) {
      this.allChecked = value
    },
    changePage (iPage) {
      if (iPage !== this.currentPage) {
        this.$store.commit('contacts/setCurrentPage', iPage)
      }
    },
  }
}
</script>

<style scoped>

</style>
