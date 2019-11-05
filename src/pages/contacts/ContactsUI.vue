<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-sm">
              <q-btn @click="createContact" label="New contact" flat no-caps size=18px color="primary" class="full-width big-button" />
            </div>
            <div class="col" style="overflow: hidden;">
              <q-scroll-area class="full-height full-widht">
                <group-list />
              </q-scroll-area>
            </div>
          </div>
        </template>

        <template v-slot:after>
          <q-splitter v-model="splitterMessageModel">
            <template v-slot:before>
              <div class="column full-height bg-white text-black panel-rounded">
                <div class="col-auto">
                  <contact-list-toolbar @groupsUUIDforChangeGroup="changeGroupByToolbar"/>
                  <q-toolbar style="width: 100%; background: #eee;">
                    <q-checkbox v-model="allChecked" />
                    <q-input outlined rounded v-model="searchText" v-on:keyup.enter="search" :dense=true style="width: 100%;">
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
                  <Pagination :currentPage="currentPage" :itemsPerPage="contactsPerPage" :itemsCount="contactsCount" :changePage="changePage"></Pagination>
                </div>
              </div>
            </template>
            <template v-slot:after>
              <!-- <q-scroll-area class="full-height bg-white text-black panel-rounded"> -->
                <div class="q-pa-md full-height bg-white text-black panel-rounded">
                  <!-- <div class="text-h4 q-mb-md">After</div>
                  <div v-for="n in 10" :key="n" class="q-my-md">{{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</div>
                  -->
                  <contact v-if="showContact" />
                  <group v-if="showGroup && !showContact" />
                </div>
              <!-- </q-scroll-area> -->
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
import Contact from './Contact.vue'
import Group from './Group.vue'
import Pagination from '../Pagination.vue'

import CContact from 'src/modules/contacts/classes/CContact.js'
import CGroup from 'src/modules/contacts/classes/CGroup.js'

export default {
  name: 'ContactsUI',
  components: {
    GroupList,
    ContactsList,
    ContactListToolbar,
    Contact,
    Group,
    Pagination,
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
    'allChecked': function (v) {
      // console.log(this.allChecked)
    },
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
    'showContact': function() {
      //console.log('showContact');
      let oContactContainer = this.$store.getters['contacts/getContactByUUID']
      return (oContactContainer.contact && oContactContainer.contact instanceof CContact) ? true : false
    },
    'showGroup': function() {
      //console.log('showGroup');
      let oGroupContainer = this.$store.getters['contacts/getCurrentGroup']
      return (oGroupContainer.group && oGroupContainer.group instanceof CGroup) ? true : false
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
      console.log('createContact')
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
