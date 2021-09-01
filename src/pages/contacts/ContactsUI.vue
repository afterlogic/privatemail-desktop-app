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
          <router-view/>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import GroupList from './GroupList.vue'

import hotkeys from 'src/utils/hotkeys.js'

export default {
  name: 'ContactsUI',

  components: {
    GroupList,
  },

  data () {
    return {
      splitterFolderModel: 20,
    }
  },

  computed: {
    editMode () {
      return this.$store.getters['contacts/isCurrentContactEditMode']
    },
    importMode () {
      return this.$store.getters['contacts/getImportState']
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
    stateForCreatingContact () {
      return this.$store.getters['contacts/getStateForCreatingContact']
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
      if (this.stateForCreatingContact && !this.stateForCreatingGroup &&!this.importMode) {
        this.$store.commit('contacts/changeStateForCreatingContact', false)
      }
      this.scrollToSelectedContact(false)
    },
  },

  mounted: function () {
    this.$router.push('/contacts/groups/no-contact')
    this.scrollToSelectedContact(true)
  },

  methods: {
    createContact() {
      this.$store.commit('contacts/changeStateForCreatingContact', true)
      this.$router.push('/contacts/group/' + this.currentStorage + '/create')
    },
    search () {
      this.$store.commit('contacts/setSearchText', this.searchInputText)
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
