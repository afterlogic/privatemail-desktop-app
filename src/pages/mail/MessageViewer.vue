<template>
  <div class="full-height bg-white text-black">
    <div class="pannel-hint" v-if="message === null">
      No message selected.
      <br />
      <div class="sub-hint">Click any message in the list to preview it here or double-click to view it full size.</div>
    </div>
    <div class="column full-height" v-if="message !== null">
      <div class="col-auto">
        <q-toolbar style="float: right; width: auto;">
          <q-btn flat color="primary" icon="reply" v-if="!isSentFolder && !isDraftsFolder" @click="reply">
            <q-tooltip>
              Reply
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="reply_all" v-if="!isSentFolder && !isDraftsFolder" @click="replyAll">
            <q-tooltip>
              Reply To All
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="replay" v-if="isSentFolder" @click="resend">
            <q-tooltip>
              Resend
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="forward" v-if="!isDraftsFolder" @click="forward">
            <q-tooltip>
              Forward
            </q-tooltip>
          </q-btn>
          <!-- <q-btn flat color="primary" icon="open_in_new">
            <q-tooltip>
              Open in a new window
            </q-tooltip>
          </q-btn> -->
          <q-btn-dropdown flat color="primary" icon="more_horiz">
            <template v-slot:label>
              <q-tooltip>
                More
              </q-tooltip>
            </template>
            <q-list>
              <q-item clickable @click="dummyAction">
                <q-item-section side>
                  <q-icon name="print" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Print</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable @click="dummyAction">
                <q-item-section side>
                  <q-icon name="arrow_downward" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Download as .eml</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable @click="dummyAction">
                <q-item-section side>
                  <q-icon name="forward" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Forward as attachment</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="dummyAction">
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
          <div class="q-pa-md" v-html="text"></div>
        </q-scroll-area>
      </div>
      <div class="col-auto attachments-panel" v-if="message.HasAttachments && message.Attachments && message.Attachments['@Collection']">
        <q-item class="attachment-item" v-for="attach in message.Attachments['@Collection']" :key="attach.Hash" v-show="!attach.IsLinked">
          <q-item-section avatar>
            <q-icon name="insert_drive_file" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{attach.FileName}}</q-item-label>
            <q-item-label caption>{{attach.FriendlySize}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat icon="get_app" color="primary" v-if="attach.Actions && attach.Actions.download && attach.Actions.download.url"
              @click="download(attach.Actions.download.url, attach.FileName)"></q-btn>
          </q-item-section>
          <q-separator />
        </q-item>
      </div>
      <q-slide-transition>
        <div class="col-auto" v-if="!isSentFolder && !isDraftsFolder" v-show="!isSendingOrSaving">
          <q-separator />
          <div class="q-px-md q-pt-md">
            <q-editor v-model="replyText" height="6rem" :toolbar="[]" v-on:keyup.enter="onEditorEnter" />
          </div>
          <q-toolbar class="q-pa-md buttons">
            <q-btn unelevated color="primary" label="Send" :disable="!isEnableSending" @click="sendQuickReply"/>
            <q-btn unelevated outline color="primary" label="Save" :disable="!isEnableSaving" @click="saveQuickReply"/>
            Ctrl+Enter to send
            <q-space />
            <a href="javascript:void(0)" @click="replyAll">Open full reply form </a>
          </q-toolbar>
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.attachments-panel {
  background: #fafafa;
  .attachment-item {
    border-bottom: 1px solid #eee;

    .q-item__section--avatar {
      color: #777;
      font-size: 18pt;
    }
  }
}
</style>

<script>
import addressUtils from 'src/utils/address'
import textUtils from 'src/utils/text'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi'
import composeUtils from 'src/modules/mail/utils/compose.js'
import messageUtils from 'src/modules/mail/utils/message.js'
import mailEnums from 'src/modules/mail/enums.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

export default {
  name: 'MessageViewer',
  data () {
    return {
      replyText: '',
      draftUid: '',
      isSendingOrSaving: false,
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
    text () {
      if (this.message) {
        if (this.message.Html) {
          if (this.message.Attachments && this.message.Attachments['@Collection']) {
            return messageUtils.prepareInlinePictures( this.message.Html, this.message.Attachments['@Collection'], this.message.FoundedCIDs, this.$store.getters['main/getApiHost'])
          } else {
            return this.message.Html
          }
        } else {
          return this.message.Plain
        }
      }
      return ''
    },
    currentFolderList () {
      return this.$store.getters['mail/getCurrentFolderList']
    },
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
    isSentFolder () {
      if (this.message && this.currentFolderList) {
        let sSentFolder = this.currentFolderList.Sent ? this.currentFolderList.Sent.FullName : ''
        return this.message.Folder === sSentFolder
      }
      return false
    },
    isDraftsFolder () {
      if (this.message && this.currentFolderList) {
        let sDraftFolder = this.currentFolderList.Drafts ? this.currentFolderList.Drafts.FullName : ''
        return this.message.Folder === sDraftFolder
      }
      return false
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
    message: function () {
      if (this.message && this.message.Attachments && this.message.Attachments['@Collection']) {
        _.each(this.message.Attachments['@Collection'], function (oAttach) {
          oAttach.FriendlySize = textUtils.getFriendlySize(oAttach.EstimatedSize)
        })
      }
      this.clearAll()
    },
  },
  methods: {
    download: function (sDownloadUrl, sFileName) {
      webApi.downloadByUrl(sDownloadUrl, sFileName)
    },
    sendQuickReply: function () {
      if (this.isEnableSending) {
        let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.message, mailEnums.ReplyType.ReplyAll, this.currentAccount, null, false, this.replyText, this.draftUid)
        oComposeReplyParams.oCurrentAccount = this.currentAccount
        oComposeReplyParams.oCurrentFolderList = this.currentFolderList
        this.isSendingOrSaving = true
        composeUtils.sendMessage(oComposeReplyParams, (oResult, oError) => {
          if (oResult) {
            // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SENT'))
            notification.showReport('Your message has been sent.')
            this.clearAll()
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while sending message'))
          }
          this.isSendingOrSaving = false
        })
      }
    },
    saveQuickReply: function () {
      if (this.isEnableSaving) {
        let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.message, mailEnums.ReplyType.ReplyAll, this.currentAccount, null, false, this.replyText, this.draftUid)
        oComposeReplyParams.oCurrentAccount = this.currentAccount
        oComposeReplyParams.oCurrentFolderList = this.currentFolderList
        this.isSendingOrSaving = true
        composeUtils.saveMessage(oComposeReplyParams, (oResult, oError) => {
          if (oResult) {
            // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SAVE'))
            notification.showReport('Your message has been saved.')
            this.draftUid = typesUtils.pString(oResult.NewUid)
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while saving message'))
          }
          this.isSendingOrSaving = false
        })
      }
    },
    clearAll: function () {
      this.replyText = ''
      this.draftUid = ''
      this.isSendingOrSaving = false
    },
    onEditorEnter: function (oEvent) {
      if (oEvent.ctrlKey) {
        this.sendQuickReply()
      }
    },
    _getParentComponent: function (sComponentName) {
      let oComponent = null
      let oParent = this.$parent
      while (oParent && !oComponent) {
        if (oParent.$options.name === sComponentName) {
          oComponent = oParent
        }
        oParent = oParent.$parent
      }
      return oComponent
    },
    reply: function () {
      this.openFullReplyForm(mailEnums.ReplyType.Reply)
    },
    replyAll: function () {
      this.openFullReplyForm(mailEnums.ReplyType.ReplyAll)
    },
    forward: function () {
      this.openFullReplyForm(mailEnums.ReplyType.Forward)
    },
    resend: function () {
      this.openFullReplyForm(mailEnums.ReplyType.Resend)
    },
    openFullReplyForm: function (iReplyType) {
      let
        oMailUI = this._getParentComponent('MailUI'),
        oCompose = oMailUI ? oMailUI.$refs.compose : null,
        oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.message, iReplyType, this.currentAccount, null, false, this.replyText, this.draftUid)

      if (oCompose) {
        oCompose.openCompose(oComposeReplyParams)
        this.clearAll()
      }
    },
    dummyAction() {
      notification.showReport('There is no action here yet')
    },
  },
  mounted: function () {
    this.clearAll()
  },
}
</script>
