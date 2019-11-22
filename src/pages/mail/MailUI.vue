<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch full-height">
      <q-splitter v-model="splitterFolderModel" :limits="[10,30]" class="full-height full-width" separator-class="main-split-separator">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-md q-pb-md">
              <q-btn flat no-caps no-wrap size=18px color="primary" class="full-width big-button" @click="openCompose" label="New message"/>
            </div>
            <div class="col" style="overflow: hidden;">
              <q-scroll-area class="full-height full-width">
                <folder-list />
              </q-scroll-area>
            </div>
            <div class="col-auto q-pa-md items-center">
              <q-btn flat no-caps label="Manage folders" class="full-width"/>
              <q-btn flat no-caps label="Clear all user data" @click="clearAllUserData" class="full-width"/>
            </div>
          </div>
        </template>

        <template v-slot:after>
          <q-splitter v-model="splitterMessageModel" :limits="[2,50]" separator-class="main-split-separator">
            <template v-slot:before>
              <div class="column no-wrap full-height bg-white text-black panel-rounded" style="overflow: hidden">
                <div class="col-auto">
                  <mail-list-toolbar :checkedMessagesUids="checkedUidsForToolbar" />
                  <q-expansion-item 
                    expand-separator
                    icon="mail"
                    label="Inbox"
                    style="width: 100%; background: #eee;">
                    <template v-slot:header>
                      <q-checkbox v-model="checkboxAll" />
                      <q-input outlined rounded dense bg-color="white" class="search-field" v-model="searchText" style="width: 100%;">
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
                        <q-input outlined dense bg-color="white" v-model="searchText" label="From" />
                        <q-input outlined dense bg-color="white" v-model="searchText" label="Subject" />
                        <q-input outlined dense bg-color="white" v-model="searchText" label="Since" />
                        <q-input outlined dense bg-color="white" v-model="searchText" label="Has" />
                      </div>
                      <div class="col q-gutter-md">
                        <q-input outlined dense bg-color="white" v-model="searchText" label="To"/>
                        <q-input outlined dense bg-color="white" v-model="searchText" label="Text"/>
                        <q-input outlined dense bg-color="white" v-model="searchText" label="Till"/>
                      </div>
                    </div>
                  </q-expansion-item>
                </div>
                <div class="col">
                  <q-scroll-area class="full-height">
                    <message-list />
                  </q-scroll-area>
                </div>
                <div class="col-auto">
                  <Pagination :currentPage="currentPage" :itemsPerPage="messagesPerPage" :itemsCount="messagesCount" :changePage="changePage"></Pagination>
                </div>
              </div>
            </template>
            <template v-slot:after>
              <MessageViewer class=" panel-rounded" />
            </template>
          </q-splitter>
        </template>
      </q-splitter>
      <MessageCompose ref="compose" />
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import { ipcRenderer } from 'electron'
import FolderList from "./FolderList.vue"
import MessageList from "./MessageList.vue"
import MailListToolbar from "./MailListToolbar.vue"
import MessageViewer from "./MessageViewer.vue"
import MessageCompose from "./MailCompose.vue"
import Pagination from '../Pagination.vue'

export default {
  name: 'MailUI',
  components: {
    FolderList,
    MessageList,
    MailListToolbar,
    MessageViewer,
    MessageCompose,
    Pagination,
  },
  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      checkboxAll: false,
      checkedUids: [],
      searchText: '',
    }
  },
  computed: {
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
    messages () {
      return this.$store.getters['mail/getСurrentMessages']
    },
    currentPage () {
      return this.$store.getters['mail/getСurrentPage']
    },
    messagesPerPage () {
      return this.$store.getters['mail/getMessagesPerPage']
    },
    messagesCount () {
      return this.$store.getters['mail/getMessagesCount']
    },
    checkedUidsForToolbar () {
      let oCurrentMessage = this.$store.getters['mail/getСurrentMessage']
      if (this.checkedUids.length === 0 && oCurrentMessage) {
        return [oCurrentMessage.Uid]
      }
      return this.checkedUids
    },
  },
  watch: {
    checkboxAll: function(val, oldval) {
      this.$root.$emit('check-all-messages', val)
    },
    messages: function (val, oldVal) {
      var aCurrentUids = _.map(this.messages, function (oMessage) {
        return oMessage.Uid
      })
      this.checkedUids = _.intersection(this.checkedUids, aCurrentUids)
    },
  },
  methods: {
    changePage (iPage) {
      if (iPage !== this.currentPage) {
        this.$store.dispatch('mail/setСurrentPage', iPage)
      }
    },
    openCompose () {
      this.$refs.compose.openCompose({})
    },
    onMessageChecked (sUid, bChecked) {
      if (bChecked) {
        this.checkedUids = _.union(this.checkedUids, [sUid])
      } else {
        this.checkedUids = _.without(this.checkedUids, sUid)
      }
    },
    initSubscriptions () {
      this.$root.$on('message-checked', this.onMessageChecked)
    },
    destroySubscriptions () {
      this.$root.$off('message-checked', this.onMessageChecked)
    },
    clearAllUserData () {
      let sApiHost = this.$store.getters['main/getApiHost']
      ipcRenderer.send('db-remove-all')
      ipcRenderer.send('logout', { sApiHost })
      this.$store.dispatch('main/clearAll')
      this.$router.push({ path: '/' })
    },
  },
  mounted: function () {
    this.initSubscriptions()

    let bAuthorized = this.$store.getters['user/isAuthorized']
    if (!this.currentAccount && bAuthorized) {
      this.$store.dispatch('mail/asyncGetSettings')
    }
  },
  beforeDestroy() {
    this.destroySubscriptions()
  },
}
</script>
