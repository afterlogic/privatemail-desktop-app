<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <group-list />
        </template>

        <template v-slot:after>
          <q-splitter v-model="splitterMessageModel">
            <template v-slot:before>
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
                </div>
                <div class="col">
                  <q-scroll-area class="full-height">
                    <contacts-list />
                  </q-scroll-area>
                </div>
              </div>
            </template>
            <template v-slot:after>
              <q-scroll-area class="full-height bg-white text-black panel-rounded">
                <div class="q-pa-md">
                  <div class="text-h4 q-mb-md">After</div>
                  <div v-for="n in 10" :key="n" class="q-my-md">{{ n }}. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis praesentium cumque magnam odio iure quidem, quod illum numquam possimus obcaecati commodi minima assumenda consectetur culpa fuga nulla ullam. In, libero.</div>
                </div>
              </q-scroll-area>
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import GroupList from "components/GroupList.vue"
import ContactsList from "components/ContactsList.vue"
import MailListToolbar from "components/MailListToolbar.vue"

export default {
  name: "ContactsUI",
  components: {
    GroupList,
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
