<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <folder-list />
        </template>

        <template v-slot:after>
          <div class="column full-height bg-white text-black panel-rounded">
            <div class="col-auto">
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
              <q-breadcrumbs class="q-px-md q-py-sm">
                <q-breadcrumbs-el label="Home" icon="home" />
                <q-breadcrumbs-el label="Components" icon="widgets" />
                <q-breadcrumbs-el label="Breadcrumbs" />
              </q-breadcrumbs>
              <q-separator />
            </div>
            <div class="col bg-white text-black">
              <q-scroll-area class="full-height">
                <div class="row q-pa-sm">
                  <q-card class="q-ma-md" v-for="n in 20" :key="n">
                    <q-card-section>
                      <div class="text-subtitle2">by John Doe</div>
                    </q-card-section>

                    <q-separator />
                    <q-card-section>
                      Image.jpg
                    </q-card-section>
                  </q-card>
                </div>
              </q-scroll-area>
            </div>
          </div>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import FolderList from "components/FolderList.vue"
// import ContactsList from "components/ContactsList.vue"
import MailListToolbar from "components/MailListToolbar.vue"

export default {
  name: "FilesUI",
  components: {
    FolderList,
    // ContactsList,
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
