<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <folder-list />
        </template>

        <template v-slot:after>
           <mail-list-toolbar />
            <q-toolbar style="width: 100%; background: #eee;">
              <q-checkbox v-model="checkboxVal" />
              <q-input outlined rounded v-model="searchText" :dense=true style="width: 100%;">
                <template v-slot:prepend>
                  <q-icon name="search" ></q-icon>
                </template>
                <!-- <template v-slot:after>
                  <q-btn round dense flat icon="send" ></q-btn>
                </template> -->
              </q-input>
            </q-toolbar>
            <q-scroll-area style="height: calc(100% - 110px);">
              <contacts-list />
            </q-scroll-area>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import FolderList from "components/FolderList.vue"
import ContactsList from "components/ContactsList.vue"
import MailListToolbar from "components/MailListToolbar.vue"

export default {
  name: "FilesUI",
  components: {
    FolderList,
    ContactsList,
    MailListToolbar,
  },
  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      checkboxVal: false,
      searchText: ''
    }
  }
};
</script>
