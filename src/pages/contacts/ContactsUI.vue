<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch full-height">
      <q-splitter v-model="splitterFolderModel" separator-class="main-split-separator" class="full-height full-width">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-md q-pb-md ">
              <q-btn flat no-caps no-wrap size=18px color="primary" class="full-width big-button" @click="createContact" label="New contact" />
            </div>
            <div class="col" style="overflow: hidden;">
              <q-scroll-area class="full-height full-width">
                <group-list />
              </q-scroll-area>
            </div>
          </div>
        </template>

        <template v-slot:after>
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
                    <contacts-list v-bind:allChecked="allChecked" @allCheckChanged="onCheckChange"/>
                  </q-scroll-area>
                </div>
                <div class="col-auto">
                  <Pagination :currentPage="currentPage" :itemsPerPage="contactsPerPage" :itemsCount="contactsCount" :changePage="changePage" />
                </div>
              </div>
            </template>
            <template v-slot:after>
              <div class="full-height bg-white text-grey-8 panel-rounded">
                <div class="pannel-hint non-selectable" v-if="!(showContact || showGroup || stateForCreatingContact || stateForCreatingGroup)">
                  No contact selected.
                </div>

                <template v-if="showContact && !stateForCreatingContact && !stateForCreatingGroup">
                  <contactView v-if="!editMode"/>
                  <contactEditView v-if="editMode" :contact="currentContact" />
                </template>

                <contactEditView v-if="stateForCreatingContact && !stateForCreatingGroup" />
                <!-- <contact-create-view v-if="stateForCreatingContact && !stateForCreatingGroup" /> -->

                <template v-if="showGroup && !showContact && !stateForCreatingContact && !stateForCreatingGroup">
                  <GroupView v-if="!currentGroup.editable"/>
                  <GroupEditView v-if="currentGroup.editable"/>
                </template>

                <!-- <contact-create-view v-if="stateForCreatingContact && !stateForCreatingGroup" /> -->
                <group-create-view v-if="stateForCreatingGroup && !stateForCreatingContact" />
              </div>
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import GroupList from './GroupList.vue'
import ContactsList from './ContactsList.vue'
import ContactListToolbar from './ContactListToolbar.vue'
import ContactView from './ContactView.vue'
import ContactEditView from './ContactEditView.vue'

import GroupView from './GroupView.vue'
import GroupEditView from './GroupEditView.vue'

import Pagination from '../Pagination.vue'
import GroupCreateView from './GroupCreateView.vue'

import CContact from 'src/modules/contacts/classes/CContact.js'
import CGroup from 'src/modules/contacts/classes/CGroup.js'

import hotkeys from 'src/utils/hotkeys.js'

export default {
  name: 'ContactsUI',

  components: {
    GroupList,
    ContactsList,
    ContactListToolbar,
    ContactView,
    ContactEditView,

    GroupView,
    GroupEditView,

    Pagination,
    GroupCreateView,
  },

  data () {
    return {
      splitterFolderModel: 20,
      splitterContactModel: 50,
      allChecked: false,
      searchInputText: '',
    }
  },

  computed: {
    editMode () {
      return this.$store.getters['contacts/isCurrentContactEditMode']
    },
    contacts () {
      return this.$store.getters['contacts/getContacts'].list
    },
    currentContact () {
      return this.$store.getters['contacts/getCurrentContact']
    },
    showContact () {
      return !!this.currentContact
    },
    currentGroup () {
      return this.$store.getters['contacts/getCurrentGroup']
    },
    showGroup () {
      let oGroupContainer = this.$store.getters['contacts/getCurrentGroup']
      return (oGroupContainer.group && oGroupContainer.group instanceof CGroup) ? true : false
    },
    stateForCreatingContact () {
      return this.$store.getters['contacts/getStateForCreatingContact']
    },
    stateForCreatingGroup () {
      return this.$store.getters['contacts/getStateForCreatingGroup']
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
    currentStorage() {
      return this.$store.getters['contacts/getCurrentStorage']
    },
    currentGroupUUID() {
      return this.$store.getters['contacts/getCurrentGroupUUID']
    },
    searchText () {
      return this.$store.getters['contacts/getSearchText']
    },
  },

  watch: {
    currentStorage: function () {
      this.searchInputText = ''
      this.search()
    },
    currentGroupUUID: function () {
      this.searchInputText = ''
      this.search()
    },
    searchText: function () {
      this.searchInputText = this.searchText
    },
    currentContact () {
      this.scrollToSelectedContact(false)
    },
  },

  mounted: function () {
    this.scrollToSelectedContact(true)
  },

  methods: {
    createContact() {
      this.$store.commit('contacts/changeStateForCreatingContact', true)
    },
    onCheckChange(value) {
      this.allChecked = value
    },
    changePage (iPage) {
      if (iPage !== this.currentPage) {
        this.$store.commit('contacts/setCurrentPage', iPage)
      }
    },
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
    scrollToSelectedContact (bMoveOnTop) {
      if (this.$refs.contactListScrollArea && this.currentContact ) {
        let iСurrentContactIndex = _.findIndex(this.contacts, (oContact) => {
          return oContact.UUID === this.currentContact.UUID
        })
        hotkeys.scrollToSelectedItem(this.$refs.contactListScrollArea, iСurrentContactIndex, this.contacts.length, bMoveOnTop)
      }
    },
  },
}
</script>
