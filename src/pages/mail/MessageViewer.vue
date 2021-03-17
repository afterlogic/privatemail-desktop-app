<template>
  <div class="full-height bg-white text-grey-8">
    <div class="pannel-hint non-selectable" v-if="message === null">
      No message selected.
      <br />
      <div class="sub-hint">Click any message in the list to preview it here or double-click to view it full size.</div>
    </div>
    <div class="column full-height" v-if="message !== null">
      <div class="q-pa-md pgp-notification-panel non-selectable" v-if="askSenderNotification">
        <template>
          <div class="q-mb-md hint">
            The sender of this message has asked to be notified when you receive this message.
          </div>
          <div class="row">
            <q-btn unelevated outline color="primary" label="Notify the sender" @click="notifySender" />
          </div>
        </template>
      </div>
      <div class="q-pa-md pgp-notification-panel non-selectable" v-if="message.HasExternals && !bExternalPicturesShown">
        <template>
          <div class="q-mb-md hint">
            Pictures in this message have been blocked for your safety
          </div>
          <div class="row">
            <q-btn unelevated outline color="primary" label="Show pictures" @click="showExternalPictures" />
          </div>
        </template>
      </div>
      <div class="q-pa-md pgp-notification-panel non-selectable" v-if="isEcryptedMessage || isSignedMessage" :class="{'success-report': isDecrypted || isVerified}">
        <template v-if="isEcryptedMessage && !isDecrypted">
          <div class="q-mb-md hint" v-if="!oOpenPgpgKeyToDecrypt">The message is encrypted. But there is no appropriate PGP private key in OpenPGP section in Settings.</div>
          <div class="q-mb-md hint" v-if="oOpenPgpgKeyToDecrypt">OpenPGP encrypted message.</div>
          <div class="row" v-if="oOpenPgpgKeyToDecrypt">
            <q-btn unelevated outline color="primary" label="Click to decrypt" @click="decrypt" />
          </div>
        </template>
        <template v-if="isEcryptedMessage && isDecrypted">
          {{ decryptReport }}
        </template>
        <template v-if="isSignedMessage && !isVerified">
          <div class="q-mb-md hint">
            OpenPGP signed message.
          </div>
          <div class="row">
            <q-btn unelevated outline color="primary" label="Click to verify" @click="verify" />
          </div>
        </template>
        <template v-if="isSignedMessage && isVerified">
          {{ verifyReport }}
        </template>
      </div>
      <div class="col-auto">
        <q-toolbar style="float: right; width: auto;">
          <q-btn flat color="primary" icon="reply" v-if="!isSentFolder && !isDraftsFolder && !isScheduledFolder" @click="reply">
            <q-tooltip>
              Reply
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="reply_all" v-if="!isSentFolder && !isDraftsFolder && !isScheduledFolder" @click="replyAll">
            <q-tooltip>
              Reply To All
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="replay" v-if="isSentFolder" @click="resend">
            <q-tooltip>
              Resend
            </q-tooltip>
          </q-btn>
          <q-btn flat color="primary" icon="forward" v-if="!isDraftsFolder && !isScheduledFolder" @click="forward">
            <q-tooltip>
              Forward
            </q-tooltip>
          </q-btn>
          <!-- <q-btn-dropdown flat color="primary" icon="more_horiz">
            <template v-slot:label>
              <q-tooltip>
                More
              </q-tooltip>
            </template>
            <q-list class="non-selectable">
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

              <q-item clickable @click="dummyAction" v-if="!isDraftsFolder && !isScheduledFolder">
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
          </q-btn-dropdown> -->
        </q-toolbar>
        <div class="q-pt-xs q-px-md">
          <div class="non-selectable" v-if="!showDetails">
            <ContactCard v-for="oAddr in from" :key="'from_' + oAddr.full" :addr="oAddr" :min="true" />
            →
            <ContactCard v-for="oAddr in to" :key="'to_' + oAddr.full" :addr="oAddr" :min="true" />
            <ContactCard v-for="oAddr in cc" :key="'cc_' + oAddr.full" :addr="oAddr" :min="true" />
            <ContactCard v-for="oAddr in bcc" :key="'bcc_' + oAddr.full" :addr="oAddr" :min="true" />
          </div>
          <div v-if="showDetails">
            <div style="clear: both;">
              <span class="non-selectable">From: </span>
              <ContactCard v-for="oAddr in from" :key="'from_' + oAddr.full" :addr="oAddr" :min="false" />
            </div>
            <div v-if="to.length > 0">
              <span class="non-selectable">To: </span>
              <ContactCard v-for="oAddr in to" :key="'to_' + oAddr.full" :addr="oAddr" :min="false" />
            </div>
            <div v-if="cc.length > 0">
              <span class="non-selectable">Cc: </span>
              <ContactCard v-for="oAddr in cc" :key="'cc_' + oAddr.full" :addr="oAddr" :min="false" />
            </div>
            <div v-if="bcc.length > 0">
              <span class="non-selectable">Bcc: </span>
              <ContactCard v-for="oAddr in bcc" :key="'bcc_' + oAddr.full" :addr="oAddr" :min="false" />
            </div>
            <div>
              <span class="non-selectable">Date: </span>
              <span>{{fullDate}}</span>
            </div>
          </div>
          <div class="row items-center q-pa-xs" style="clear: both;">
            <div class="col text-h5" v-if="message.Subject">{{message.Subject}}</div>
            <div class="col text-h5 nodata" v-else>No subject</div>
            <div class="col-auto date" v-if="!showDetails">{{ middleDate }}</div>
          </div>
        </div>
        <div class="expand-header-handler" :class="{'expanded': showDetails}">
          <q-btn
            :icon="showDetails ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            flat dense
            color="grey-5"
            @click="showDetails = !showDetails"
          >
            <q-tooltip v-if="!showDetails">Show details</q-tooltip>
            <q-tooltip v-if="showDetails">Hide details</q-tooltip>
          </q-btn>
        </div>
        <q-separator />
      </div>
      <div class="col">
        <q-scroll-area class="full-height">
        <div class="q-px-md q-py-sm information-panel non-selectable" v-if="isScheduledMessage">
          <template>
            <q-item class="q-pa-none">
              <q-item-section avatar style="padding-right: 6px; min-width: auto;">
                <q-icon name="schedule_send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ scheduledMessageText }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn unelevated outline color="primary" class="q-ml-md" label="Cancel sending" @click="cancelSending" />
              </q-item-section>
            </q-item>
          </template>
        </div>
          <div class="q-pa-md" v-html="text"></div>
        </q-scroll-area>
      </div>
      <div class="col-auto attachments-panel" v-if="message.HasAttachments && aAttachments.length > 0">
        <q-item class="attachment-item" v-for="attach in aAttachments" :key="attach.sHash" v-show="!attach.bLinked">
          <q-item-section avatar v-if="!attach.sThumbnailLink">
            <q-icon name="insert_drive_file" />
          </q-item-section>
          <q-item-section avatar v-if="attach.sThumbnailLink" class="thumbnail-section">
            <img :src="sApiHost + '/' + attach.sThumbnailLink">
          </q-item-section>
          <q-item-section>
            <q-item-label>{{attach.sFileName}}</q-item-label>
            <q-item-label caption>{{attach.getFriendlySize()}}</q-item-label>
          </q-item-section>
          <q-item-section top side class="actions-section">
            <div class="q-gutter-xs">
              <q-btn flat icon="visibility" color="primary"
                v-if="attach.sViewLink"
                @click="viewAttach(attach.sViewLink, attach.sFileName)"
                >
                <q-tooltip>View</q-tooltip>
              </q-btn>
              <q-btn flat icon="get_app" color="primary" 
                v-if="attach.sDownloadLink"
                @click="downloadAttach(attach.sDownloadLink, attach.sFileName)"
                >
                <q-tooltip>Download</q-tooltip>
              </q-btn>
            </div>
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
            <div class="non-selectable">Ctrl+Enter to send</div>
            <q-space />
            <a class="non-selectable text-primary" href="javascript:void(0)" @click="replyAll">Open full reply form </a>
          </q-toolbar>
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.attachments-panel {
  background: #fafafa;
  max-height: 200px;
  overflow: auto;
  .attachment-item {
    border-bottom: 1px solid #eee;

    .thumbnail-section {
      max-width: 80px;
      margin-right: 24px;
    }

    .actions-section {
      margin-right: -14px;
    }

    .q-item__section--avatar {
      color: #777;
      font-size: 18pt;
    }
  }
}
.pgp-notification-panel {
  background: #ffffef;
  color: #887b57;
  border-bottom: 1px solid #e2e2cd;

  &.success-report {
    background: #f5ffef;
    color: #616f56;
  }

  .q-input {
    margin-right: 10px;
  }
}
.information-panel {
  background: #dff6eb;
  border-bottom: 1px solid #b7ebd2;
}
.expand-header-handler {
    margin-bottom: -19px;
    text-align: center;
    position: relative;
    z-index: 1;

    &.expanded {
        margin-bottom: -14px;
    }

    .q-btn {
        background: #fff;
    }
}
</style>

<script>
import { ipcRenderer } from 'electron'

import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import scheduleUtils from 'src/utils/schedule.js'
import textUtils from 'src/utils/text'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi'

import cAttachment from 'src/modules/mail/classes/cAttachment.js'
import composeUtils from 'src/modules/mail/utils/compose.js'
import messageUtils from 'src/modules/mail/utils/message.js'
import mailEnums from 'src/modules/mail/enums.js'

import ContactCard from 'src/pages/contacts/ContactCard.vue'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

export default {
  name: 'MessageViewer',

  data () {
    return {
      replyText: '',
      draftUid: '',
      isSendingOrSaving: false,
      from: [],
      to: [],
      cc: [],
      bcc: [],
      text: '',
      bExternalPicturesShown: false,
      isEcryptedMessage: false,
      oOpenPgpgKeyToDecrypt: null,
      isSignedMessage: false,
      isVerified: false,
      verifyReport: '',
      isDecrypted: false,
      decryptReport: '',
      showDetails: false,

      aAttachments: [],

      isScheduledMessage: false,
      scheduledMessageText: '',
    }
  },

  components: {
    ContactCard,
  },

  computed: {
    sApiHost () {
      return this.$store.getters['main/getApiHost']
    },
    message () {
      let oMessage = this.$store.getters['mail/getCurrentMessage']
      let aMessages = this.$store.getters['mail/getCurrentMessages']
      let bInArray = oMessage ? !!_.find(aMessages, (oTmpMessage) => {
        return oTmpMessage.Uid === oMessage.Uid
      }) : false
      return bInArray ? oMessage : null
    },
    fullDate () {
      return dateUtils.getFullDate(this.message.TimeStampInUTC)
    },
    middleDate () {
      return dateUtils.getShortDate(this.message.TimeStampInUTC, true)
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
    isScheduledFolder () {
      if (this.message && this.currentFolderList) {
        let sScheduledFolder = this.currentFolderList.Scheduled ? this.currentFolderList.Scheduled.FullName : ''
        return this.message.Folder === sScheduledFolder
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
    askSenderNotification () {
      return this.message && typesUtils.isNonEmptyString(this.message.ReadingConfirmationAddressee) &&
              this.message.ReadingConfirmationAddressee !== this.currentAccount.sEmail
    }
  },

  watch: {
    message: function () {
      this.clearAll()
      this.populateMessageData()
    },
  },

  mounted: function () {
    this.clearAll()
    this.populateMessageData()
    this.initSubscriptions()
  },

  beforeDestroy () {
    this.destroySubscriptions()
  },

  methods: {
    cancelSending () {
      if (this.isScheduledFolder) {
        let oComposeParams = {
          aDraftInfo: this.message.DraftInfo,
          oIdentity: composeUtils.getIdentityForCompose(this.message.From),
          aToContacts: messageUtils.getContactsToSend(this.message.To),
          aCcContacts: messageUtils.getContactsToSend(this.message.Cc),
          aBccContacts: messageUtils.getContactsToSend(this.message.Bcc),
          sSubject: this.message.Subject,
          sText: this.message.Html ? this.message.Html : this.message.Plain,
          bPlainText: !this.message.Html && !!this.message.Plain,
          aAttachments: this.message.Attachments && _.isArray(this.message.Attachments['@Collection']) ? this.message.Attachments['@Collection'] : [],
          sInReplyTo: this.message.InReplyTo,
          sReferences: this.message.References,
          iImportance: this.message.Importance,
          bReadingConfirmation: typesUtils.isNonEmptyString(this.message.ReadingConfirmationAddressee),
          sAnotherMessageComposedText: 'You are about to cancel the scheduled message sending. However, another message is already being composed.',
          bSaveImmediately: true,
        }
        this.deleteAfterSaveMessage = {
          iAccountId: this.message.AccountId,
          sFolder: this.message.Folder,
          sUid: this.message.Uid,
        }
        this.openCompose(oComposeParams)
      }
    },
    onSaveMessage () {
      if (this.deleteAfterSaveMessage) {
        this.$store.dispatch('mail/asyncDeleteMessages', {
          iAccountId: this.deleteAfterSaveMessage.iAccountId,
          sFolderFullName: this.deleteAfterSaveMessage.sFolder,
          aUids: [this.deleteAfterSaveMessage.sUid],
        })
        this.deleteAfterSaveMessage = null
      }
    },
    viewAttach: function (sViewUrl, sFileName) {
      webApi.viewByUrlInNewWindow(sViewUrl, sFileName)
    },
    downloadAttach: function (sDownloadUrl, sFileName) {
      webApi.downloadByUrl(sDownloadUrl, sFileName)
    },
    sendQuickReply: function () {
      if (this.isEnableSending) {
        let oIdentity = this.$store.getters['mail/getCurrentDefaultIdentity']
        let sReplyText = this.replyText
        if (oIdentity && oIdentity.bUseSignature && oIdentity.sSignature !== '') {
          sReplyText += '<br><br><div>' + oIdentity.sSignature + '</div>'
        }
        let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.text, this.message, mailEnums.ReplyType.ReplyAll, this.currentAccount, null, false, sReplyText, this.draftUid)
        oComposeReplyParams.oCurrentAccount = this.currentAccount
        oComposeReplyParams.oCurrentFolderList = this.currentFolderList
        if (oIdentity) {
          oComposeReplyParams.iIdentityId = oIdentity.iEntityId
        }
        this.isSendingOrSaving = true
        oComposeReplyParams.sToAddr = (_.map(oComposeReplyParams.aToContacts || [], function (oContact) {
          return oContact.full
        })).join(', ')
        oComposeReplyParams.sCcAddr = (_.map(oComposeReplyParams.aCcContacts || [], function (oContact) {
          return oContact.full
        })).join(', ')
        oComposeReplyParams.sBccAddr = (_.map(oComposeReplyParams.aBccContacts || [], function (oContact) {
          return oContact.full
        })).join(', ')
        composeUtils.sendMessage(oComposeReplyParams, (oResult, oError) => {
          if (oResult) {
            // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SENT'))
            notification.showReport('Your message has been sent.')
            this.clearQuickReplyData()
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while sending message'))
          }
          this.isSendingOrSaving = false
        })
      }
    },
    saveQuickReply: function () {
      if (this.isEnableSaving) {
        let oIdentity = this.$store.getters['mail/getCurrentDefaultIdentity']
        let sReplyText = this.replyText
        if (oIdentity && oIdentity.bUseSignature && oIdentity.sSignature !== '') {
          sReplyText += '<br><br><div>' + oIdentity.sSignature + '</div>'
        }
        let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.text, this.message, mailEnums.ReplyType.ReplyAll, this.currentAccount, null, false, sReplyText, this.draftUid)
        oComposeReplyParams.oCurrentAccount = this.currentAccount
        oComposeReplyParams.oCurrentFolderList = this.currentFolderList
        if (oIdentity) {
          oComposeReplyParams.iIdentityId = oIdentity.iEntityId
        }
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
    clearQuickReplyData: function () {
      this.replyText = ''
      this.draftUid = ''
      this.isSendingOrSaving = false
    },
    clearAll: function () {
      this.clearQuickReplyData()
      this.isVerified = false
      this.verifyReport = ''
      this.isDecrypted = false
      this.decryptReport = ''
    },
    populateOpenPgpgKeyToDecrypt: async function () {
      this.oOpenPgpgKeyToDecrypt = null
      if (this.isEcryptedMessage) {
        this.oOpenPgpgKeyToDecrypt = await OpenPgp.getEncryptionKeyFromArmoredMessage(this.message.PlainRaw)
      }
    },
    populateMessageData: function () {
      let sText = ''
      this.aAttachments = []
      if (this.message) {
        if (this.message.Attachments && this.message.Attachments['@Collection']) {
          let aAttachments = []
          _.each(this.message.Attachments['@Collection'], (oAttachData) => {
            let oAttach = new cAttachment()
            oAttach.parseDataFromServer(oAttachData)
            aAttachments.push(oAttach)
          })
          this.aAttachments = aAttachments
        }
        if (this.message.Html) {
          if (this.aAttachments && this.aAttachments.length > 0) {
            sText = messageUtils.prepareInlinePictures( this.message.Html, this.aAttachments, this.message.FoundedCIDs, this.$store.getters['main/getApiHost'])
          } else {
            sText = this.message.Html
          }
        } else {
          sText = this.message.Plain
        }

        var
          aExtend = typesUtils.pArray(this.message && this.message.Extend),
          oSchedule = _.find(aExtend, function (oExtend) {
            return typesUtils.isPositiveNumber(oExtend.ScheduleTimestamp)
          })

        if (oSchedule) {
          this.isScheduledMessage = true
          this.scheduledMessageText = scheduleUtils.getScheduledAtText(oSchedule.ScheduleTimestamp)
        } else {
          this.isScheduledMessage = false
        }
      }
      this.text = sText
      this.bExternalPicturesShown = false
      this.isEcryptedMessage = this.text.indexOf('-----BEGIN PGP MESSAGE-----') !== -1
      this.isSignedMessage = this.text.indexOf('-----BEGIN PGP SIGNED MESSAGE-----') !== -1
      if (this.isEcryptedMessage || this.isSignedMessage) {
        this.$store.dispatch('contacts/asyncGetContactsOpenPgpExternalKeys')
      }
      this.populateOpenPgpgKeyToDecrypt()

      this.from = []
      this.to = []
      this.cc = []
      this.bcc = []
      if (this.message) {
        let aFullEmails = _.compact(typesUtils.pString(this.message.From).split('\n'))
        this.from = _.map(aFullEmails, function (sFullEmail) {
          return addressUtils.getEmailParts(sFullEmail)
        })

        aFullEmails = _.compact(typesUtils.pString(this.message.To).split('\n'))
        this.to = _.map(aFullEmails, function (sFullEmail) {
          return addressUtils.getEmailParts(sFullEmail)
        })

        aFullEmails = _.compact(typesUtils.pString(this.message.Cc).split('\n'))
        this.cc = _.map(aFullEmails, function (sFullEmail) {
          return addressUtils.getEmailParts(sFullEmail)
        })

        aFullEmails = _.compact(typesUtils.pString(this.message.Bcc).split('\n'))
        this.bcc = _.map(aFullEmails, function (sFullEmail) {
          return addressUtils.getEmailParts(sFullEmail)
        })
      }

      let aFromEmails = _.map(this.from, function (oFromAddr) {
        return oFromAddr.email
      })
      let aToEmails = _.map(this.to, function (oToAddr) {
        return oToAddr.email
      })
      let aCcEmails = _.map(this.cc, function (oCcAddr) {
        return oCcAddr.email
      })
      let aBccEmails = _.map(this.bcc, function (oBccAddr) {
        return oBccAddr.email
      })
      let aEmails = _.union(aFromEmails, aToEmails, aCcEmails, aBccEmails)
      this.$store.dispatch('contacts/asyncGetContactsByEmails', aEmails)
    },
    onEditorEnter: function (oEvent) {
      if (oEvent.ctrlKey) {
        this.sendQuickReply()
      }
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
      let oIdentity = this.$store.getters['mail/getCurrentDefaultIdentity']
      let sReplyText = this.replyText
      let sSignature = oIdentity && oIdentity.bUseSignature ? typesUtils.pString(oIdentity.sSignature, '') : ''
      sReplyText += '<br><br>' + composeUtils.getTagWrappedSignature(sSignature)
      let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.text, this.message, iReplyType, this.currentAccount, null, false, sReplyText, this.draftUid)
      this.openCompose(oComposeReplyParams)
      this.clearQuickReplyData()
    },
    async verify () {
      let sFromEmail = messageUtils.getFirstAddressEmail(this.message.From)
      let oPublicFromKey = OpenPgp.getPublicKeyByEmail(sFromEmail)
      if (oPublicFromKey) {
        let { sVerifiedData, sError } = await OpenPgp.verifyText(this.message.PlainRaw, [oPublicFromKey])
        if (sVerifiedData) {
          this.text = sVerifiedData.replace(/\r\n/g, '<br />').replace(/\n/g, '<br />')
          this.isVerified = true
          this.verifyReport = 'Message was successfully verified.'
        } else {
          notification.showError(sError)
        }
      } else {
        notification.showError('No public key found for ' + sFromEmail + ' user.')
      }
    },
    async decrypt () {
      let oPrivateCurrentKey = this.oOpenPgpgKeyToDecrypt ? this.oOpenPgpgKeyToDecrypt : OpenPgp.getCurrentPrivateOwnKey()
      let sFromEmail = messageUtils.getFirstAddressEmail(this.message.From)
      let oPublicFromKey = OpenPgp.getPublicKeyByEmail(sFromEmail)
      let aPublicKeys = oPublicFromKey ? [oPublicFromKey] : []
      if (oPrivateCurrentKey) {
        let { sDecryptedData, sReport, sError } = await OpenPgp.decryptAndVerifyText(this.message.PlainRaw, oPrivateCurrentKey, aPublicKeys, this.askOpenPgpKeyPassword)
        if (sDecryptedData) {
          this.text = sDecryptedData.replace(/\r\n/g, '<br />').replace(/\n/g, '<br />')
          this.isDecrypted = true
          this.decryptReport = sReport
        } else {
          notification.showError(sError)
        }
      }
    },
    showExternalPictures () {
      this.text = messageUtils.getTextWithExternalPictures(this.text)
      this.bExternalPicturesShown = true
    },
    notifySender () {
      if (this.askSenderNotification) {
        let sText = 'This is a Return Receipt for the mail that you sent to %EMAIL% with subject \"%SUBJECT%\".\r\n\r\nNote: This Return Receipt only acknowledges that the message was displayed on the recipient\'s computer.\r\nThere is no guarantee that the recipient has read or understood the message contents.'
        sText = sText.replace(/%EMAIL%/g, this.currentAccount.sEmail).replace(/%SUBJECT%/g, this.message.Subject)
        let oComposeReplyParams = {
          oCurrentAccount: this.currentAccount,
          oCurrentFolderList: this.currentFolderList,
          sToAddr: this.message.ReadingConfirmationAddressee,
          sSubject: 'Return Receipt (displayed)',
          sText,
          sConfirmFolder: this.message.Folder,
          iConfirmUid: this.message.Uid,
        }
        composeUtils.sendMessage(oComposeReplyParams, (oResult, oError) => {
          if (oResult) {
            notification.showReport('Your message has been sent.')
            ipcRenderer.send('mail-message-remove-confirm-addressee', {
              iAccountId: this.message.AccountId,
              sFolderFullName: this.message.Folder,
              sUid: this.message.Uid,
            })
            this.$store.commit('mail/removeCurrentMessageReadingConfirmAddressee')
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while sending message'))
          }
        })
      }
    },
    dummyAction() {
      notification.showReport('Coming soon')
    },
    initSubscriptions () {
      this.$root.$on('save-message', this.onSaveMessage)
    },
    destroySubscriptions () {
      this.$root.$off('save-message', this.onSaveMessage)
    },
  },
}
</script>
