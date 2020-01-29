<template>
  <div class="full-height bg-white text-black">
    <div class="pannel-hint" v-if="message === null">
      No message selected.
      <br />
      <div class="sub-hint">Click any message in the list to preview it here or double-click to view it full size.</div>
    </div>
    <div class="column full-height" v-if="message !== null">
      <div class="q-pa-md pgp-notification-panel" v-if="isEcryptedMessage || isSignedMessage" :class="{'success-report': isDecrypted || isVerified}">
        <template v-if="isEcryptedMessage && !isDecrypted">
          <div class="q-mb-md hint">OpenPGP encrypted message.</div>
          <div class="row">
            <q-input dense outlined type="password" label="Enter your password" v-model="privateKeyPass" />
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
          <div v-if="!showDetails">
            <ContactCard v-for="oAddr in from" :key="'from_' + oAddr.Full" :addr="oAddr" :min="true" />
            →
            <ContactCard v-for="oAddr in to" :key="'to_' + oAddr.Full" :addr="oAddr" :min="true" />
            <ContactCard v-for="oAddr in cc" :key="'cc_' + oAddr.Full" :addr="oAddr" :min="true" />
            <ContactCard v-for="oAddr in bcc" :key="'bcc_' + oAddr.Full" :addr="oAddr" :min="true" />
          </div>
          <div v-if="showDetails">
            <div style="clear: both;">
              <span>From: </span>
              <ContactCard v-for="oAddr in from" :key="'from_' + oAddr.Full" :addr="oAddr" :min="false" />
            </div>
            <div v-if="to.length > 0">
              <span>To: </span>
              <ContactCard v-for="oAddr in to" :key="'to_' + oAddr.Full" :addr="oAddr" :min="false" />
            </div>
            <div v-if="cc.length > 0">
              <span>Cc: </span>
              <ContactCard v-for="oAddr in cc" :key="'cc_' + oAddr.Full" :addr="oAddr" :min="false" />
            </div>
            <div v-if="bcc.length > 0">
              <span>Bcc: </span>
              <ContactCard v-for="oAddr in bcc" :key="'bcc_' + oAddr.Full" :addr="oAddr" :min="false" />
            </div>
            <div>
              <span>Date: </span>
              <span>{{fullDate}}</span>
            </div>
          </div>
          <div class="row items-center q-pa-xs" style="clear: both;">
            <div class="col subject text-h5">{{message.Subject}}</div>
            <div class="col-auto date" v-if="!showDetails">{{ middleDate }}</div>
          </div>
        </div>
        <div :style="(showDetails? 'margin-bottom: -14px;' : 'margin-bottom: -19px;') + ' text-align: center;'">
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
</style>

<script>
import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import textUtils from 'src/utils/text'
import typesUtils from 'src/utils/types'
import webApi from 'src/utils/webApi'

import composeUtils from 'src/modules/mail/utils/compose.js'
import messageUtils from 'src/modules/mail/utils/message.js'
import mailEnums from 'src/modules/mail/enums.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

import ContactCard from 'src/pages/contacts/ContactCard.vue'

export default {
  name: 'MessageViewer',

  data () {
    return {
      replyText: '',
      draftUid: '',
      isSendingOrSaving: false,
      privateKeyPass: '',
      from: [],
      to: [],
      cc: [],
      bcc: [],
      text: '',
      isEcryptedMessage: false,
      isSignedMessage: false,
      isVerified: false,
      verifyReport: '',
      isDecrypted: false,
      decryptReport: '',
      showDetails: false,
    }
  },

  components: {
    ContactCard,
  },

  computed: {
    message () {
      return this.$store.getters['mail/getCurrentMessage']
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
      this.clearAll()
      this.populateMessageData()
      if (this.message && this.message.Attachments && this.message.Attachments['@Collection']) {
        _.each(this.message.Attachments['@Collection'], function (oAttach) {
          oAttach.FriendlySize = textUtils.getFriendlySize(oAttach.EstimatedSize)
        })
      }
    },
  },

  methods: {
    download: function (sDownloadUrl, sFileName) {
      webApi.downloadByUrl(sDownloadUrl, sFileName)
    },
    sendQuickReply: function () {
      if (this.isEnableSending) {
        let oIdentity = this.$store.getters['mail/getCurrentDefaultIdentity']
        let sReplyText = this.replyText
        if (oIdentity && oIdentity.bUseSignature && oIdentity.sSignature !== '') {
          sReplyText += '<br><br><div data-anchor="signature">' + oIdentity.sSignature + '</div>'
        }
        let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.text, this.message, mailEnums.ReplyType.ReplyAll, this.currentAccount, null, false, sReplyText, this.draftUid)
        oComposeReplyParams.oCurrentAccount = this.currentAccount
        oComposeReplyParams.oCurrentFolderList = this.currentFolderList
        if (oIdentity) {
          oComposeReplyParams.iIdentityId = oIdentity.iEntityId
        }
        this.isSendingOrSaving = true
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
          sReplyText += '<br><br><div data-anchor="signature">' + oIdentity.sSignature + '</div>'
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
      this.privateKeyPass = ''
      this.isVerified = false
      this.verifyReport = ''
      this.isDecrypted = false
      this.decryptReport = ''
    },
    populateMessageData: function () {
      let sText = ''
      if (this.message) {
        if (this.message.Html) {
          if (this.message.Attachments && this.message.Attachments['@Collection']) {
            sText = messageUtils.prepareInlinePictures( this.message.Html, this.message.Attachments['@Collection'], this.message.FoundedCIDs, this.$store.getters['main/getApiHost'])
          } else {
            sText = this.message.Html
          }
        } else {
          sText = this.message.Plain
        }
      }
      this.text = sText
      this.isEcryptedMessage = this.text.indexOf('-----BEGIN PGP MESSAGE-----') !== -1
      this.isSignedMessage = this.text.indexOf('-----BEGIN PGP SIGNED MESSAGE-----') !== -1

      let aFrom = []
      if (this.message) {
        let oFrom = this.message.From
        _.each(oFrom ? oFrom['@Collection'] : [], function (oAddress) {
          aFrom.push({
            Full: addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email),
            Email: oAddress.Email,
            Name: oAddress.DisplayName,
          })
        })
      }
      this.from = aFrom

      let aTo = []
      if (this.message) {
        let aAddresses = this.message.To ? this.message.To['@Collection'] : []
        _.each(aAddresses, function (oAddress) {
          aTo.push({
            Full: addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email),
            Email: oAddress.Email,
            Name: oAddress.DisplayName,
          })
        })
      }
      this.to = aTo

      let aCc = []
      if (this.message) {
        let aAddresses = this.message.Cc ? this.message.Cc['@Collection'] : []
        _.each(aAddresses, function (oAddress) {
          aCc.push({
            Full: addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email),
            Email: oAddress.Email,
            Name: oAddress.DisplayName,
          })
        })
      }
      this.cc = aCc

      let aBcc = []
      if (this.message) {
        let aAddresses = this.message.Bcc ? this.message.Bcc['@Collection'] : []
        _.each(aAddresses, function (oAddress) {
          aBcc.push({
            Full: addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email),
            Email: oAddress.Email,
            Name: oAddress.DisplayName,
          })
        })
      }
      this.bcc = aBcc

      let aFromEmails = _.map(this.from, function (oFromAddr) {
        return oFromAddr.Email
      })
      let aToEmails = _.map(this.to, function (oToAddr) {
        return oToAddr.Email
      })
      let aCcEmails = _.map(this.cc, function (oCcAddr) {
        return oCcAddr.Email
      })
      let aBccEmails = _.map(this.bcc, function (oBccAddr) {
        return oBccAddr.Email
      })
      let aEmails = _.uniq(_.union(aFromEmails, aToEmails, aCcEmails, aBccEmails))
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
      if (oIdentity && oIdentity.bUseSignature && oIdentity.sSignature !== '') {
        sReplyText += '<br><br><div data-anchor="signature">' + oIdentity.sSignature + '</div>'
      }
      let oComposeReplyParams = composeUtils.getReplyDataFromMessage(this.text, this.message, iReplyType, this.currentAccount, null, false, sReplyText, this.draftUid)
      this.openCompose(oComposeReplyParams)
      this.clearQuickReplyData()
    },
    getPublicCurrentKey () {
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      let aPublicCurrentKey = _.filter(aOpenPgpKeys, (oKey) => {
        let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
        return oKey.bPublic && oKeyEmail.email === this.currentAccount.Email
      })
      if (aPublicCurrentKey.length > 0) {
        return aPublicCurrentKey[0]
      } else {
        return null
      }
    },
    getPrivateCurrentKey () {
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      let aPublicCurrentKey = _.filter(aOpenPgpKeys, (oKey) => {
        let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
        return !oKey.bPublic && oKeyEmail.email === this.currentAccount.Email
      })
      if (aPublicCurrentKey.length > 0) {
        return aPublicCurrentKey[0]
      } else {
        notification.showError('No private key found for ' + this.currentAccount.Email + ' user.')
        return null
      }
    },
    async verify () {
      let oPublicCurrentKey = this.getPublicCurrentKey()
      if (oPublicCurrentKey) {
        let { sVerifiedData, sError, oPgpResult } = await OpenPgp.verify(this.message.PlainRaw, [oPublicCurrentKey])
        if (sVerifiedData) {
          this.text = sVerifiedData
          this.isVerified = true
          this.verifyReport = 'Message was successfully verified.'
        } else {
          notification.showError(sError)
        }
      } else {
        notification.showError('No public key found for ' + this.currentAccount.Email + ' user.')
      }
    },
    async decrypt () {
      let oPrivateCurrentKey = this.getPrivateCurrentKey()
      let oPublicCurrentKey = this.getPublicCurrentKey()
      let aPublicKeys = oPublicCurrentKey ? [oPublicCurrentKey] : []
      if (oPrivateCurrentKey) {
        let { sDecryptedData, sReport, sError } = await OpenPgp.decryptAndVerify(this.message.PlainRaw, oPrivateCurrentKey, this.privateKeyPass, aPublicKeys)
        if (sDecryptedData) {
          this.text = sDecryptedData
          this.isDecrypted = true
          this.decryptReport = sReport
        } else {
          notification.showError(sError)
        }
      }
    },
    dummyAction() {
      notification.showReport('Coming soon')
    },
  },
  mounted: function () {
    this.clearAll()
    this.populateMessageData()
  },
}
</script>
