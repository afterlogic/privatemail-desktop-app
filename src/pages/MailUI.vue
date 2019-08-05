<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;">
        <template v-slot:before>
          <q-scroll-area style="height: 100%; widht: 100%;">
            <q-btn color="accent" flat size=md label="New message" style="width: 100%; border: 2px solid #BC4799" />
            <folder-list />
          </q-scroll-area>
        </template>

        <template v-slot:after>
          <q-splitter v-model="splitterMessageModel">
            <template v-slot:before>
              <div class="column no-wrap full-height bg-white text-black panel-rounded" style="overflow: hidden">
                <div class="col-auto">
                  <mail-list-toolbar class="text-black" />
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
                </div>
                <div class="col">
                  <q-scroll-area class="full-height">
                    <message-list />
                  </q-scroll-area>
                </div>
              </div>
            </template>
            <template v-slot:after>
              <MessageViewer class=" panel-rounded" />
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
import MessageViewer from "components/MessageViewer.vue"

export default {
  name: "MailUI",
  components: {
    FolderList,
    MessageList,
    MailListToolbar,
    MessageViewer,
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
