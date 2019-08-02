<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <folder-list />
        </template>

        <template v-slot:after>
          <q-splitter v-model="splitterMessageModel">
            <template v-slot:before>
              <mail-list-toolbar />
              <q-expansion-item 
                expand-separator
                icon="mail"
                label="Inbox"
                style="width: 100%; background: #eee;">
                <template v-slot:header>
                  <q-checkbox v-model="checkboxVal" />
                  <q-input outlined rounded v-model="searchText" :dense=true style="width: 100%;">
                    <template v-slot:prepend>
                      <q-icon name="search" ></q-icon>
                    </template>
                    <!-- <template v-slot:after>
                      <q-btn round dense flat icon="send" ></q-btn>
                    </template> -->
                  </q-input>
                </template>
                <div class="row q-gutter-md" style="padding: 0px 20px;">
                  <div class="col q-gutter-md">
                    <q-input outlined v-model="searchText" :dense=true label="From" />
                    <q-input outlined v-model="searchText" :dense=true label="Subject" />
                    <q-input outlined v-model="searchText" :dense=true label="Since" />
                    <q-input outlined v-model="searchText" :dense=true label="Has" />
                  </div>
                  <div class="col q-gutter-md">
                    <q-input outlined v-model="searchText" :dense=true label="To"/>
                    <q-input outlined v-model="searchText" :dense=true label="Text"/>
                    <q-input outlined v-model="searchText" :dense=true label="Till"/>
                  </div>
                </div>
              </q-expansion-item>
              <q-scroll-area style="height: calc(100% - 100px);">
                <message-list />
              </q-scroll-area>
            </template>
            <template v-slot:after>
              <q-scroll-area style="height: 100%;">
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
import FolderList from "components/FolderList.vue"
import MessageList from "components/MessageList.vue"
import MailListToolbar from "components/MailListToolbar.vue"

export default {
  name: "MailUI",
  components: {
    FolderList,
    MessageList,
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
