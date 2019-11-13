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
          <q-splitter v-model="splitterMessageModel" separator-class="main-split-separator">
            <template v-slot:before>
              <div class="column full-height bg-white text-black panel-rounded">
                <div class="col-auto">
                  <contact-list-toolbar @groupsUUIDforChangeGroup="changeGroupByToolbar"/>
                  <q-toolbar style="width: 100%; background: #eee;">
                    <q-checkbox v-model="allChecked" />
                    <q-input outlined rounded dense bg-color="white" class="search-field" v-model="searchText" v-on:keyup.enter="search" style="width: 100%;">
                      <template v-slot:prepend>
                        <q-icon name="search" ></q-icon>
                      </template>
                      <!-- <template v-slot:after>
                        <q-btn round dense flat icon="send" ></q-btn>
                      </template> -->
                    </q-input>
                  </q-toolbar>
                </div>
                <div class="col">
                  <q-scroll-area class="full-height">
                    <contacts-list v-bind:allChecked="allChecked" v-bind:groupUUID="groupUUID" @allCheckChanged="onCheckChange"/>
                  </q-scroll-area>
                </div>
                <div class="col-auto">
                  <Pagination :currentPage="currentPage" :itemsPerPage="contactsPerPage" :itemsCount="contactsCount" :changePage="changePage" />
                </div>
              </div>
            </template>
            <template v-slot:after>
              <div class="full-height bg-white text-black panel-rounded">
                <div class="pannel-hint" v-if="!(showContact || showGroup || stateForCreatingContact || stateForCreatingContact)">
                  No contact selected.
                </div>

                <template v-if="showContact && !stateForCreatingContact && !stateForCreatingGroup">
                  <contactView v-if="!currentContact.editable"/>
                  <contactEditView v-if="currentContact.editable"/>
                </template>

                <template v-if="showGroup && !showContact && !stateForCreatingContact && !stateForCreatingGroup">
                  <GroupView v-if="!currentGroup.editable"/>
                  <GroupEditView v-if="currentGroup.editable"/>
                </template>

                <contact-create-view v-if="stateForCreatingContact && !stateForCreatingGroup" />
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
import ContactCreateView from './ContactCreateView.vue'
import GroupCreateView from './GroupCreateView.vue'

import CContact from 'src/modules/contacts/classes/CContact.js'
import CGroup from 'src/modules/contacts/classes/CGroup.js'

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
    ContactCreateView,
    GroupCreateView,
  },
  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      allChecked: false,
      searchText: '',
      groupUUID: '',
    }
  },
  watch: {
    currentStorage: function () {
      this.searchText = ''
      this.search()
    },
    currentGroupUUID: function () {
      this.searchText = ''
      this.search()
    },
  },
  computed: {
    currentContact () {
      return this.$store.getters['contacts/getCurrentContact']
    },
    showContact () {
      let oContactContainer = this.$store.getters['contacts/getCurrentContact']
      return (oContactContainer.contact && oContactContainer.contact instanceof CContact) ? true : false
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
      return this.$store.getters['contacts/getСurrentPage']
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
  },
  methods: {
    createContact() {
      this.$store.commit('contacts/changeStateForCreatingContact', true)
    },
    onCheckChange(value) {
      this.allChecked = value
    },
    changeGroupByToolbar (UUID) {
      this.groupUUID = UUID
    },
    changePage (iPage) {
      if (iPage !== this.currentPage) {
        this.$store.commit('contacts/setCurrentPage', iPage)
      }
    },
    search () {
      this.$store.commit('contacts/setSearchText', this.searchText)
    },
  },
}
</script>
