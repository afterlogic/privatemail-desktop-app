<template>
  <div class="column full-height bg-white text-black">
    <div v-if="message === null">
      No message selected.
      <br />
      Click any message in the list to preview it here or double-click to view it full size.
    </div>
    <div v-if="message !== null">
      <div class="col-auto">
        <q-toolbar style="float: right; width: auto;">
          <q-btn flat color="primary" icon="reply">
            <q-tooltip>
              Reply
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="reply_all">
            <q-tooltip>
              Reply To All
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="forward">
            <q-tooltip>
              Forward
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="open_in_new">
            <q-tooltip>
              Open in a new window
            </q-tooltip>
          </q-btn>
          <q-btn-dropdown flat color="primary">
            <template v-slot:label>
              <q-btn flat icon="more_horiz" />
              <q-tooltip>
                More
              </q-tooltip>
            </template>
            <q-list>
              <q-item clickable>
                <q-item-section side>
                  <q-icon name="print" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Print</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable>
                <q-item-section side>
                  <q-icon name="arrow_downward" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Download as .eml</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable>
                <q-item-section side>
                  <q-icon name="forward" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Forward as attachment</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section side>
                  <q-icon name="code" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>View message headers</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-toolbar>
        <div class="q-pt-xs q-px-md">
          <q-chip v-for="fromAddr in from" :key="'from_' + fromAddr" icon-right="add">{{fromAddr}}</q-chip>
          →
          <q-chip v-for="toAddr in to" :key="'to_' + toAddr">{{toAddr}}</q-chip>
          <div class="row items-center q-pa-xs" style="clear: both;">
            <div class="col subject text-h5">{{message.Subject}}</div>
            <div class="col-auto date">{{message.MiddleDate}}</div>
          </div>
        </div>
        <q-separator />
      </div>
      <div class="col" style="height: 100%;">
        <q-scroll-area style="height: 100%;">
          <div class="q-pa-md" v-if="!message.Received">
            Loading...
          </div>
          <div class="q-pa-md" v-if="message.Received && message.Html" v-html="message.Html"></div>
          <div class="q-pa-md" v-if="message.Received && !message.Html" v-html="message.Plain"></div>
        </q-scroll-area>
      </div>
      <div class="col-3" v-if="message.HasAttachments && message.Attachments && message.Attachments['@Collection']" style="background: yellow;">
        <div v-for="attach in message.Attachments['@Collection']" :key="attach.Hash" v-show="!attach.IsLinked">
          {{attach.FileName}} - {{attach.FriendlySize}} - 
          <a  v-if="attach.Actions && attach.Actions.download && attach.Actions.download.url"
              href="javascript:void(0)"
              @click="download(attach.Actions.download.url, attach.FileName)">download</a>
        </div>
      </div>
      <div class="col-3">
        <q-separator />
        <div class="q-px-md q-pt-md">
          <q-editor v-model="replyText" min-height="6rem" :toolbar="[]" />
        </div>
        <q-toolbar class="q-pa-md">
          <q-btn color="primary" label="Send" :disable="!isEnableSending" @click="sendQuickReply" />
          <q-btn color="primary" label="Save" :disable="!isEnableSaving" @click="saveQuickReply" outline />
          Ctrl+Enter to send
          <q-space />
          <a>Open full reply form </a>
        </q-toolbar>
      </div>
    </div>
  </div>
</template>

<style></style>

<script>
import addressUtils from 'src/utils/address'
import textUtils from 'src/utils/text'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi'
import composeUtils from 'src/modules/mail/utils/compose.js'

export default {
  name: 'MessageViewer',
  data () {
    return {
      replyText: '',
      draftUid: '',
    }
  },
  computed: {
    message () {
      return this.$store.getters['mail/getСurrentMessage']
    },
    from () {
      let oFrom = this.message.From
      let aFrom = []
      _.each(oFrom ? oFrom['@Collection'] : [], function (oAddress) {
        aFrom.push(addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email))
      })
      return aFrom
    },
    to () {
      let aAddresses = _.union(this.message.To ? this.message.To['@Collection'] : [], this.message.Cc ? this.message.Cc['@Collection'] : [], this.message.Bcc ? this.message.Bcc['@Collection'] : [])
      let aTo = []
      _.each(aAddresses, function (oAddress) {
        aTo.push(addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email))
      })
      return aTo
    },
    currentFolderList () {
      return this.$store.getters['mail/getCurrentFolderList']
    },
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
    /**
     * Determines if sending a message is allowed.
     */
    isEnableSending () {
      return typesUtils.isNonEmptyString(this.replyText)
    },
    isEnableSaving () {
      return typesUtils.isNonEmptyString(this.replyText)
    },
  },
  watch: {
    message: {
      handler: function () {
        if (this.message && this.message.Attachments && this.message.Attachments['@Collection']) {
          _.each(this.message.Attachments['@Collection'], function (oAttach) {
            oAttach.FriendlySize = textUtils.getFriendlySize(oAttach.EstimatedSize)
          })
        }
      },
      deep: true // needs to be called after message.Received change
    },
  },
  methods: {
    download: function (sDownloadUrl, sFileName) {
      webApi.downloadByUrl(sDownloadUrl, sFileName)
    },
    sendQuickReply: function () {
      console.log('sendQuickReply', this.message)
      if (this.isEnableSending) {
        let
          sToAddr = '',
          sCcAddr = '',
          sBccAddr = '',
          sSubject = ''

        composeUtils.sendMessage({
          oCurrentAccount: this.currentAccount,
          oCurrentFolderList: this.currentFolderList,
          sToAddr,
          sCcAddr,
          sBccAddr,
          sSubject,
          sText: this.replyText,
          sDraftUid: this.draftUid,
        }, (oResult, oError) => {
          if (oResult) {
            notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SENT'))
            this.closeCompose()
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while sending message'))
          }
        })
      }
    },
    saveQuickReply: function () {
      console.log('saveQuickReply')
    },
  },
}
</script>
