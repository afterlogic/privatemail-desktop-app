<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch full-height">
      <q-splitter v-model="splitterFolderModel" :limits="[10,30]" class="full-height full-width" separator-class="main-split-separator">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-md q-pb-md">
              <q-btn flat no-caps no-wrap size=18px color="primary" class="full-width big-button" @click="openNewMessageCompose" label="New message"/>
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
                    style="width: 100%; background: #eee;"
                    ref="advSearchExpansion"
                  >
                    <template v-slot:header>
                      <q-checkbox v-model="checkboxAll" />
                      <q-input outlined rounded dense bg-color="white"
                          @click.stop.prevent class="search-field"
                          v-model="searchInputText"
                          @keyup.enter.stop.prevent="search"
                          style="width: 100%;">
                        <template v-slot:prepend>
                          <q-icon name="search" @click.stop.prevent="search"></q-icon>
                        </template>
                        <!-- <template v-slot:after>
                          <q-btn round dense flat icon="send" ></q-btn>
                        </template> -->
                      </q-input>
                    </template>
                    <div class="row q-gutter-md" style="padding: 0px 20px;">
                      <div class="col q-gutter-md">
                        <q-input outlined dense bg-color="white" label="From" v-model="advSearchFrom" @keyup.enter.stop.prevent="advancedSearch" />
                        <q-input outlined dense bg-color="white" label="Subject" v-model="advSearchSubject" @keyup.enter.stop.prevent="advancedSearch" />
                        <q-input outlined dense bg-color="white" class="input-size" label="Since" v-model="advSearchSinceDate" mask="####.##.##" @keyup.enter.stop.prevent="advancedSearch">
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy ref="qSearchSinceDate" transition-show="scale" transition-hide="scale">
                                <q-date v-model="advSearchSinceDate" @input="() => $refs.qSearchSinceDate.hide()" mask="YYYY.MM.DD" today-btn minimal/>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                        <q-checkbox v-model="advSearchHasAttachments" label="Has attachments" />
                      </div>
                      <div class="col q-gutter-md">
                        <q-input outlined dense bg-color="white" label="To" v-model="advSearchTo" @keyup.enter.stop.prevent="advancedSearch" />
                        <q-input outlined dense bg-color="white" label="Text" v-model="advSearchText" @keyup.enter.stop.prevent="advancedSearch" />
                        <q-input outlined dense bg-color="white" class="input-size" label="Till" v-model="advSearchTillDate" mask="####.##.##" @keyup.enter.stop.prevent="advancedSearch">
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy ref="qSearchTillDate" transition-show="scale" transition-hide="scale">
                                <q-date v-model="advSearchTillDate" @input="() => $refs.qSearchTillDate.hide()" mask="YYYY.MM.DD" today-btn minimal/>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                    </div>
                    <div class="row q-gutter-md" style="padding: 0px 20px 10px;">
                      <div class="col q-gutter-md">
                        <q-btn unelevated label="Search" color="primary" @click="advancedSearch"></q-btn>
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
    </q-page>
  </q-page-container>
</template>

<style></style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

import FolderList from "./FolderList.vue"
import MessageList from "./MessageList.vue"
import MailListToolbar from "./MailListToolbar.vue"
import MessageViewer from "./MessageViewer.vue"
import Pagination from '../Pagination.vue'

export default {
  name: 'MailUI',

  components: {
    FolderList,
    MessageList,
    MailListToolbar,
    MessageViewer,
    Pagination,
  },

  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      checkboxAll: false,
      checkedUids: [],
      searchInputText: '',

      advSearchFrom: '',
      advSearchSubject: '',
      advSearchTo: '',
      advSearchText: '',
      advSearchSinceDate: '',
      advSearchTillDate: '',
      advSearchHasAttachments: false,
    }
  },

  computed: {
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
    messages () {
      return this.$store.getters['mail/getCurrentMessages']
    },
    currentPage () {
      return this.$store.getters['mail/getCurrentPage']
    },
    messagesPerPage () {
      return this.$store.getters['mail/getMessagesPerPage']
    },
    messagesCount () {
      return this.$store.getters['mail/getMessagesCount']
    },
    checkedUidsForToolbar () {
      let oCurrentMessage = this.$store.getters['mail/getCurrentMessage']
      if (this.checkedUids.length === 0 && oCurrentMessage) {
        return [oCurrentMessage.Uid]
      }
      return this.checkedUids
    },
    searchText () {
      return this.$store.getters['mail/getCurrentSearch']
    },
    advancedSearchData () {
      return this.$store.getters['mail/getCurrentAdvancedSearch']
    },
  },

  watch: {
    searchText: function () {
      this.searchInputText = this.searchText
    },
    advancedSearchData: function () {
      this.advSearchFrom = typesUtils.pString(this.advancedSearchData && this.advancedSearchData.From)
      this.advSearchSubject = typesUtils.pString(this.advancedSearchData && this.advancedSearchData.Subject)
      this.advSearchTo = typesUtils.pString(this.advancedSearchData && this.advancedSearchData.To)
      this.advSearchText = typesUtils.pString(this.advancedSearchData && this.advancedSearchData.Text)
      this.advSearchSinceDate = typesUtils.pString(this.advancedSearchData && this.advancedSearchData.Since)
      this.advSearchTillDate = typesUtils.pString(this.advancedSearchData && this.advancedSearchData.Till)
      this.advSearchHasAttachments = typesUtils.pBool(this.advancedSearchData && this.advancedSearchData.HasAttachments)
    },
    checkboxAll: function (val, oldval) {
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
    advancedSearch: function () {
      let aSearch = []
      if (typesUtils.isNonEmptyString(this.advSearchFrom)) {
        aSearch.push('from:' + this.advSearchFrom)
      }
      if (typesUtils.isNonEmptyString(this.advSearchSubject)) {
        aSearch.push('subject:' + this.advSearchSubject)
      }
      if (typesUtils.isNonEmptyString(this.advSearchTo)) {
        aSearch.push('to:' + this.advSearchTo)
      }
      if (typesUtils.isNonEmptyString(this.advSearchText)) {
        aSearch.push('text:' + this.advSearchText)
      }
      if (typesUtils.isNonEmptyString(this.advSearchSinceDate) || typesUtils.isNonEmptyString(this.advSearchTillDate)) {
        aSearch.push('date:' + this.advSearchSinceDate + '/' + this.advSearchTillDate)
      }
      if (this.advSearchHasAttachments) {
        aSearch.push('has:attachments')
      }
      this.searchInputText = aSearch.join(' ')

      this.$refs.advSearchExpansion.hide()

      this.search()
    },
    search: function () {
      this.$store.dispatch('mail/asyncGetMessages', {
        iPage: 1,
        sSearch: this.searchInputText,
        sFilter: '',
      })
    },
    changePage (iPage) {
      if (iPage !== this.currentPage) {
        this.$store.dispatch('mail/asyncGetMessages', {
          iPage,
        })
      }
    },
    openNewMessageCompose () {
      this.openCompose({})
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
      this.$router.push({ path: '/login' })
    },
  },

  mounted: function () {
    this.initSubscriptions()
    let bAuthorized = this.$store.getters['user/isAuthorized']
    if (!this.currentAccount && bAuthorized) {
      this.$store.dispatch('mail/asyncGetSettings', (oError) => {
        let sCurrentPath = this.$router.currentRoute && this.$router.currentRoute.path ? this.$router.currentRoute.path : ''
        if (this.currentAccount) {
          if (sCurrentPath !== '/mail') {
            this.$router.push({ path: '/mail' })
          }
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while getting settings'))
          if (sCurrentPath !== '/login') {
            this.$router.push({ path: '/login' })
          }
        }
      })
    }
  },

  beforeDestroy() {
    this.destroySubscriptions()
  },
}
</script>
