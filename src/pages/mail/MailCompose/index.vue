<template src="./template.htm"></template>
<style lang="scss" src="./styles.scss"></style>

<script>
import { ipcRenderer } from 'electron'
import moment from 'moment-timezone'

import addressUtils from 'src/utils/address.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi'

import coreSettings from 'src/modules/core/settings.js'

import cAttachment from 'src/modules/mail/classes/cAttachment.js'
import cIdentity from 'src/modules/mail/classes/cIdentity.js'
import cAlias from 'src/modules/mail/classes/cAlias.js'
import composeUtils from 'src/modules/mail/utils/compose.js'
import mailSettings from 'src/modules/mail/settings.js'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'
import openpgpSettings from 'src/modules/openpgp/settings.js'

import cContact from 'src/modules/contacts/classes/CContact.js'

import ScheduleSendingDialog from "../ScheduleSendingDialog.vue"

export default {
  name: 'MailCompose',

  components: {
    ScheduleSendingDialog,
  },

  data () {
    return {
      dialog: false,
      maximizedToggle: false,
      discardPreviousDraftDialog: false,
      discardPreviousDraftText: '',
      composeParameters: null,

      allowInsertImage: false,

      sending: false, // indicates if sending is happening right now
      saving: false, // indicates if saving is happening right now
      allAttachmentsUploaded: true, // indicates if all attachments are loaded from server (for forward or sending files from other modules)
      oCommitedMessageData: null,

      selectedIdentity: null,

      autoEncryptSignMessage: false,

      plainText: false,
      disableEditor: false,
      pgpApplied: false,
      editortext: '',
      editortextBeforePgp: '',
      disableRecipients: false,
      subjectText: '',
      iImportance: 3,
      bReadingConfirmation: false,

      draftInfo: [],
      draftUid: '',
      attachments: [],
      inReplyTo: '',
      references: '',

      isCcShowed: false,
      isBccShowed: false,

      iAutosaveTimer: 0,

      acceptedImageTypes: 'image/*',
      imageUrl: '',

      convertToPlainConfirm: false,
      pgpSignEncryptDialog: false,
      signCheckbox: true,
      encryptCheckbox: true,

      selectedToAddr: null,
      toAddrOptions: [],
      selectedCcAddr: null,
      ccAddrOptions: [],
      selectedBccAddr: null,
      bccAddrOptions: [],

      selfDestructingEmailDialog: false,
      selfDestructingRecipient: null,
      selfDestructingRecipientOptions: [],
      selfDestructingLifetime: { label: '24 hrs', value: 24 },
      selfDestructingLifetimeOptions: [
        { label: '24 hrs', value: 24 },
        { label: '72 hrs', value: 72 },
        { label: '7 days', value: 168 }
      ],
      selfDestructingEncryptType: '',
      selfDestructingAddSignature: false,
      selfDestructingShowPassword: '',

      showConfirmNotAllRecipientsEncryptSign: false,
      confirmNotAllRecipientsEncryptSignText: '',
      proceedEncryptSignRecipients: null,
      proceedEncryptSignFromEmail: '',

      mailScheduledAllowed: false,
      privateKey: false,
      isSelfDestructingMail: false,
      sCaptionForEncryption: '',
      bEncryptAction: false
    }
  },

  computed: {
    sApiHost () {
      return this.$store.getters['main/getApiHost']
    },
    currentFolderList () {
      return this.$store.getters['mail/getCurrentFolderList']
    },
    currentAccount () {
      return this.$store.getters['mail/getCurrentAccount']
    },
    allIdentities () {
      let aAliases = this.currentAccount && _.isArray(this.currentAccount.aAliases) ? this.currentAccount.aAliases : []
      let aIdentities = this.$store.getters['mail/getCurrentIdentities']
      if (!_.isArray(aIdentities)) {
        aIdentities = []
      }
      return aIdentities.concat(aAliases)
    },
    allIdentitiesOptions () {
      return _.map(this.allIdentities, function (oIdentity) {
        return {
          label: textUtils.encodeHtml(oIdentity.getFull()),
          value: oIdentity,
        }
      })
    },
    toAddrComputed () {
      return _.map(this.selectedToAddr, function (oAddr) {
        return oAddr.full
      }).join(',')
    },
    ccAddrComputed () {
      return _.map(this.selectedCcAddr, function (oAddr) {
        return oAddr.full
      }).join(',')
    },
    bccAddrComputed () {
      return _.map(this.selectedBccAddr, function (oAddr) {
        return oAddr.full
      }).join(',')
    },
    /**
     * Determines if sending a message is allowed.
     */
    isEnableSending () {
      let
        bRecipientIsEmpty = this.toAddrComputed.length === 0 && this.ccAddrComputed.length === 0 && this.bccAddrComputed.length === 0,
        bCurrentFolderListLoaded = !!this.currentFolderList && this.currentFolderList.AccountId !== 0

      return bCurrentFolderListLoaded && !this.sending && !bRecipientIsEmpty && this.allAttachmentsUploaded
    },
    notLinkedAttachments () {
      return _.filter(this.attachments, function (oAttach) {
        return !oAttach.bLinked
      })
    },
    recipientEmails () {
      let
        aRecip = [this.toAddrComputed, this.ccAddrComputed, this.bccAddrComputed].join(',').split(','),
        aEmails = []

      _.each(aRecip, function (sRecip) {
        let sTrimmedRecip = _.trim(sRecip)
        if (sTrimmedRecip !== '') {
          let oRecip = addressUtils.getEmailParts(sTrimmedRecip)
          if (oRecip.email) {
            aEmails.push(oRecip.email)
          }
        }
      })

      return aEmails
    },
    editorToolbar () {
      if (this.disableEditor) {
        return []
      }
      let aLastSection = this.allowInsertImage ? ['link', 'image', 'removeFormat'] : ['link', 'removeFormat']
      return [
        ['undo', 'redo'],
        ['bold', 'italic', 'underline', 'strike'],
        [{
          list: 'no-icons',
          options: [
            'default_font',
            'arial',
            'arial_black',
            'courier_new',
            'tahoma',
            'times_new_roman',
            'verdana'
          ],
        }, {
          list: 'no-icons',
          options: [
            'size-2',
            'size-3',
            'size-5',
            'size-7'
          ],
        },
        'colors'],
        ['unordered', 'ordered'],
        aLastSection
      ]
    },
    allowAtoEncryptSignMessage () {
      let aAllAddr = []
      aAllAddr = aAllAddr.concat(this.selectedToAddr, this.selectedCcAddr, this.selectedBccAddr)
      return !!_.find(aAllAddr, (oAddr) => {
        return oAddr && oAddr.hasPgpKey && (oAddr.pgpSign || oAddr.pgpEncrypt)
      })
    },
  },
  watch: {
    allIdentities () {
      this.setSelectedIdentity()
    },
    selectedIdentity () {
      let re = composeUtils.getSignatureRegexp()
      let bSignatureFound = !!this.editortext.match(re)
      if (bSignatureFound) {
        let oIdentity = this.selectedIdentity && this.selectedIdentity.value
        let sSignature = oIdentity && oIdentity.bUseSignature ? typesUtils.pString(oIdentity.sSignature, '') : ''
        this.editortext = this.editortext.replace(re, composeUtils.getTagWrappedSignature(sSignature))
      }
    },
    allowAtoEncryptSignMessage () {
      this.autoEncryptSignMessage = this.allowAtoEncryptSignMessage
    },
    selectedToAddr (aAddr, aPrevAddr) {
      aAddr = typesUtils.pArray(aAddr)
      aPrevAddr = typesUtils.pArray(aPrevAddr)
      if (aAddr.length > aPrevAddr.length && this.$refs.toAddrSelect) {
        this.$refs.toAddrSelect.updateInputValue('')
      }
    },
    selectedCcAddr (aAddr, aPrevAddr) {
      aAddr = typesUtils.pArray(aAddr)
      aPrevAddr = typesUtils.pArray(aPrevAddr)
      if (aAddr.length > aPrevAddr.length && this.$refs.ccAddrSelect) {
        this.$refs.ccAddrSelect.updateInputValue('')
      }
    },
    selectedBccAddr (aAddr, aPrevAddr) {
      aAddr = typesUtils.pArray(aAddr)
      aPrevAddr = typesUtils.pArray(aPrevAddr)
      if (aAddr.length > aPrevAddr.length && this.$refs.bccAddrSelect) {
        this.$refs.bccAddrSelect.updateInputValue('')
      }
    },
    selfDestructingEncryptType () {
      if (this.selfDestructingEncryptType === 'key') {
        if (this.privateKey === null) {
          this.sCaptionForEncryption = 'Requires your PGP private key in Settings.'
        } else {
          this.sCaptionForEncryption = ''
        }
      } else {
        if (this.privateKey === null) {
          this.sCaptionForEncryption = 'Requires key-based encryption.'
        } else {
          this.sCaptionForEncryption = ''
        }
      }
      this.selfDestructingAddSignature = this.selfDestructingEncryptType === 'key' && this.privateKey !== null

    },
    selfDestructingRecipient () {
      if (this.selfDestructingRecipient) {
        this.selfDestructingEncryptType = 'password'
      } else {
        this.selfDestructingEncryptType = ''
      }
    },
  },

  beforeDestroy: function () {
    this.clearAutosaveTimer()
  },

  methods: {
    setImportance (iImportance) {
      this.iImportance = iImportance
    },
    triggerReadingConfirmation () {
      this.bReadingConfirmation = !this.bReadingConfirmation
    },
    checkSelfDestructingRecipient (sNewValue) {
      if (this.selfDestructingRecipient && this.selfDestructingRecipient.label !== sNewValue) {
        this.selfDestructingRecipient = null
      }
    },
    getOptionFromContactData (oContactData) {
      return {
        full: oContactData.full,
        label: oContactData.full,
        value: 'id_' + oContactData.id,
        short: oContactData.name || oContactData.email,
        email: oContactData.email,
        hasPgpKey: !!oContactData.hasPgpKey,
        pgpEncrypt: !!oContactData.pgpEncrypt,
        pgpSign: !!oContactData.pgpSign,
      }
    },
    getOptionFromContact (oContact) {
      let
        sName = _.trim(oContact.FullName),
        sEmail = _.trim(oContact.ViewEmail)

      return {
        full: oContact.getFull(),
        label: oContact.getFull(),
        value: 'id_' + oContact.EntityId,
        short: sName || sEmail,
        email: sEmail,
        hasPgpKey: !!oContact.PublicPgpKey,
        pgpEncrypt: !!oContact.PgpEncryptMessages,
        pgpSign: !!oContact.PgpSignMessages,
      }
    },
    getSelfDestructingRecipientOptionsOptions (sSearch, update, abort) {
      ipcRenderer.once('contacts-get-frequently-used-contacts', (oEvent, { aContacts }) => {
        let sFromEmail = this.selectedIdentity ? this.selectedIdentity.value.sEmail : ''
        let aPublicKeys = _.filter(OpenPgp.getAllKeys(), function (oKey) {
          let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
          return oKey.bPublic && oKeyEmail.email !== sFromEmail
        })
        let aEmailsToExclude = []
        let iExactlySearchIndex = -1
        let aOptions = []
        _.each(aContacts, (oContactData, iIndex) => {
          let oContact = new cContact(oContactData)
          if (oContact.ViewEmail !== sFromEmail) {
            if (sSearch === oContact.getFull()) {
              iExactlySearchIndex = iIndex
            }
            let bKey = !!_.find(aPublicKeys, function (oKey) {
              let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
              return oKeyEmail.email === oContact.ViewEmail
            })
            aOptions.push(this.getOptionFromContact(oContact))
            if (bKey) {
              aEmailsToExclude.push(oContact.ViewEmail)
            }
          }
        })
        let bAddFirstOption = sSearch !== '' && iExactlySearchIndex === -1
        if (bAddFirstOption) {
          let oEmailParts = addressUtils.getEmailParts(sSearch)
          aOptions.unshift({
            email: oEmailParts.email,
            full: sSearch,
            hasPgpKey: !!_.find(aPublicKeys, function (oKey) {
              let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
              return oKeyEmail.email === oEmailParts.email
            }),
            label: sSearch,
            pgpEncrypt: false,
            pgpSign: false,
            short: oEmailParts.name || oEmailParts.email,
            value: 'rand_' + Math.round(Math.random() * 10000),
          })
          _.each(aPublicKeys, (oKey) => {
            let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
            if (oKey.sEmail.indexOf(sSearch) !== -1 && _.indexOf(aEmailsToExclude, oKeyEmail.email) === -1) {
              aOptions.push({
                email: oKeyEmail.email,
                full: oKeyEmail.full,
                hasPgpKey: true,
                label: oKeyEmail.full,
                pgpEncrypt: false,
                pgpSign: false,
                short: oEmailParts.name || oEmailParts.email,
                value: 'keyid_' + oKey.sId,
              })
            }
          })
        }
        update(async () => {
          this.selfDestructingRecipientOptions = aOptions
          if (bAddFirstOption) {
            await this.$nextTick()
            this.$refs.selfDestructingRecipientSelect.setOptionIndex(0)
          } else if (iExactlySearchIndex >= 0) {
            await this.$nextTick()
            this.$refs.selfDestructingRecipientSelect.setOptionIndex(iExactlySearchIndex)
          }
        })
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', { sSearch })
    },
    getToAddrOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'toAddrOptions', 'toAddrSelect')
    },
    getCcAddrOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'ccAddrOptions', 'ccAddrSelect')
    },
    getBccAddrOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'bccAddrOptions', 'bccAddrSelect')
    },
    getRecipientOptions (sSearch, update, abort, sOptionsName, sSelectName) {
      ipcRenderer.once('contacts-get-frequently-used-contacts', (oEvent, { aContacts }) => {
        let iExactlySearchIndex = -1
        let aOptions = []
        _.each(aContacts, (oContactData, iIndex) => {
          let oContact = new cContact(oContactData)
          if (sSearch === oContact.getFull()) {
            iExactlySearchIndex = iIndex
          }
          aOptions.push(this.getOptionFromContact(oContact))
        })
        let bAddFirstOption = sSearch !== '' && iExactlySearchIndex === -1
        if (bAddFirstOption) {
          let oEmailParts = addressUtils.getEmailParts(sSearch)
          aOptions.unshift({
            label: sSearch,
            value: 'rand_' + Math.round(Math.random() * 10000),
            full: sSearch,
            short: oEmailParts.name || oEmailParts.email,
            email: oEmailParts.email,
            hasPgpKey: false,
            pgpEncrypt: false,
            pgpSign: false,
          })
        }
        update(async () => {
          this[sOptionsName] = aOptions
          if (bAddFirstOption) {
            await this.$nextTick()
            this.$refs[sSelectName].setOptionIndex(0)
          } else if (iExactlySearchIndex >= 0) {
            await this.$nextTick()
            this.$refs[sSelectName].setOptionIndex(iExactlySearchIndex)
          }
        })
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', { sSearch })
    },
    removeSelectedToAddr (sValue) {
      this.selectedToAddr = _.filter(this.selectedToAddr, function (oAddr) {
        return oAddr.value !== sValue
      })
    },
    removeSelectedCcAddr (sValue) {
      this.selectedCcAddr = _.filter(this.selectedCcAddr, function (oAddr) {
        return oAddr.value !== sValue
      })
    },
    removeSelectedBccAddr (sValue) {
      this.selectedBccAddr = _.filter(this.selectedBccAddr, function (oAddr) {
        return oAddr.value !== sValue
      })
    },
    confirmOpenPgp () {
      if (this.recipientEmails.length === 0) {
        notification.showError('To encrypt your message you need to specify at least one recipient.')
      } else if (!this.plainText) {
        this.convertToPlainConfirm = true
      } else {
        this.openPgpSignEncryptDialog()
      }
    },
    openPgpSignEncryptDialog () {
      this.signCheckbox = true
      this.encryptCheckbox = true
      this.pgpSignEncryptDialog = true
    },
    getPlainEditorText () {
      return textUtils.htmlToPlain(this.editortext)
    },
    async sign () {
      let oPrivateCurrentKey = OpenPgp.getCurrentPrivateOwnKey()
      if (oPrivateCurrentKey) {
        let { sSignedData, sError } = await OpenPgp.signText(this.getPlainEditorText(), oPrivateCurrentKey, this.askOpenPgpKeyPassword)
        if (sSignedData) {
          this.plainText = true
          this.disableEditor = true
          this.pgpApplied = true
          this.editortextBeforePgp = this.editortext
          this.editortext = '<pre>' + sSignedData + '</pre>'
          this.pgpSignEncryptDialog = false
        } else {
          notification.showError(sError)
        }
      }
    },
    getRecipientAndSenderPublicKeys () {
      let
        aRecipientPublicKeys = this.getRecipientPublicKeys(),
        oSenderPublicKey = this.getSenderPublicKey()

      if (oSenderPublicKey && aRecipientPublicKeys.length > 0) {
        // Add sender key if possible. It allows sender to decrypt messages in Sent and Draft folders
        return aRecipientPublicKeys.concat([oSenderPublicKey])
      }

      return aRecipientPublicKeys
    },
    getSenderPublicKey () {
      let
        aAllOpenPgpKeys = OpenPgp.getAllKeys(),
        sSenderEmail = (this.selectedIdentity && this.selectedIdentity.value) ? this.selectedIdentity.value.sEmail : this.currentAccount.sEmail,
        oSenderPublicKey = _.find(aAllOpenPgpKeys, function (oKey) {
          let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
          return oKey.bPublic && oKeyEmail.email === sSenderEmail
        })
      return oSenderPublicKey
    },
    getRecipientPublicKeys () {
      let
        aAllOpenPgpKeys = OpenPgp.getAllKeys(),
        aRecipientPublicKeys = [],
        aNotFoundEmails = []
      _.each(this.recipientEmails, function (sEmail) {
        let oPublicKey = _.find(aAllOpenPgpKeys, function (oKey) {
          let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
          return oKey.bPublic && oKeyEmail.email === sEmail
        })
        if (oPublicKey) {
          aRecipientPublicKeys.push(oPublicKey)
        } else {
          aNotFoundEmails.push(sEmail)
        }
      })

      if (aNotFoundEmails.length > 0) {
        notification.showError('No public key found for ' + aNotFoundEmails.join(', ') + ' user(s).')
        return []
      } else {
        return aRecipientPublicKeys
      }
    },
    async encrypt () {
      let aRecipientPublicKeys = this.getRecipientAndSenderPublicKeys()
      if (aRecipientPublicKeys.length > 0) {
        let { sEncryptedData, sError } = await OpenPgp.encryptText(this.getPlainEditorText(), aRecipientPublicKeys)
        if (sEncryptedData) {
          this.plainText = true
          this.disableEditor = true
          this.disableRecipients = true
          this.pgpApplied = false
          this.editortextBeforePgp = this.editortext
          this.editortext = '<pre>' + sEncryptedData + '</pre>'
          this.pgpSignEncryptDialog = false
        } else {
          notification.showError(sError)
        }
      }
    },
    async signAndEncrypt (sPassphrase) {
      let oPrivateCurrentKey = OpenPgp.getCurrentPrivateOwnKey()
      let aRecipientPublicKeys = this.getRecipientAndSenderPublicKeys()
      if (aRecipientPublicKeys.length > 0 && oPrivateCurrentKey) {
        let oResult = null
        if (typesUtils.isNonEmptyString(sPassphrase)) { // it can be event if called from HTML
          oResult = await OpenPgp.signAndEncryptTextWithPassphrase(this.getPlainEditorText(), aRecipientPublicKeys, oPrivateCurrentKey, sPassphrase)
        } else {
          oResult = await OpenPgp.signAndEncryptText(this.getPlainEditorText(), aRecipientPublicKeys, oPrivateCurrentKey, this.askOpenPgpKeyPassword)
        }
        let { sEncryptedSignedData, sError } = oResult
        if (sEncryptedSignedData) {
          this.plainText = true
          this.disableEditor = true
          this.disableRecipients = true
          this.pgpApplied = this.isSelfDestructingMail ? false : true
          this.editortextBeforePgp = this.editortext
          this.editortext = '<pre>' + sEncryptedSignedData + '</pre>'
          this.pgpSignEncryptDialog = false
        } else {
          notification.showError(sError)
        }
        this.isSelfDestructingMail = false
      }
    },
    undoPGP () {
      this.editortext = this.editortextBeforePgp
      this.plainText = false
      this.disableEditor = false
      this.disableRecipients = false
      this.pgpApplied = false
    },
    onBeforeHide () {
      this.clearAutosaveTimer()
    },
    getEditorTextForSend () {
      let sEditortext = this.editortext
      if (this.plainText) {
        return sEditortext.replace('<pre>', '').replace('</pre>', '')
      }
      return sEditortext
    },
    getMessageData () {
      return {
        oCurrentAccount: this.currentAccount,
        oCurrentFolderList: this.currentFolderList,
        iIdentityId: (this.selectedIdentity && this.selectedIdentity.value instanceof cIdentity) ? this.selectedIdentity.value.iEntityId : 0,
        iAliasId: (this.selectedIdentity && this.selectedIdentity.value instanceof cAlias) ? this.selectedIdentity.value.iEntityId : 0,
        sToAddr: this.toAddrComputed,
        sCcAddr: this.ccAddrComputed,
        sBccAddr: this.bccAddrComputed,
        sSubject: this.subjectText,
        sText: this.getEditorTextForSend(),
        bPlainText: this.plainText,
        aAttachments: this.attachments,
        sDraftUid: this.draftUid,
        aDraftInfo: this.draftInfo,
        sInReplyTo: this.inReplyTo,
        sReferences: this.references,
        iImportance: this.iImportance,
        bReadingConfirmation: this.bReadingConfirmation,
        bAddToSentFolder: true,
      }
    },
    isMessageDataChanged () {
      let oCurrentMessageData = this.getMessageData()
      return (oCurrentMessageData.oCurrentAccount && oCurrentMessageData.oCurrentAccount.iAccountId) !== (this.oCommitedMessageData.oCurrentAccount && this.oCommitedMessageData.oCurrentAccount.iAccountId)
            || (oCurrentMessageData.oCurrentFolderList && oCurrentMessageData.oCurrentFolderList.AccountId) !== (this.oCommitedMessageData.oCurrentFolderList && this.oCommitedMessageData.oCurrentFolderList.AccountId)
            || oCurrentMessageData.iIdentityId !== this.oCommitedMessageData.iIdentityId
            || oCurrentMessageData.iAliasId !== this.oCommitedMessageData.iAliasId
            || oCurrentMessageData.sToAddr !== this.oCommitedMessageData.sToAddr
            || oCurrentMessageData.sCcAddr !== this.oCommitedMessageData.sCcAddr
            || oCurrentMessageData.sBccAddr !== this.oCommitedMessageData.sBccAddr
            || oCurrentMessageData.sSubject !== this.oCommitedMessageData.sSubject
            || oCurrentMessageData.sText !== this.oCommitedMessageData.sText
            || oCurrentMessageData.bPlainText !== this.oCommitedMessageData.bPlainText
            || !_.isEqual(oCurrentMessageData.aAttachments, this.oCommitedMessageData.aAttachments)
            || oCurrentMessageData.sInReplyTo !== this.oCommitedMessageData.sInReplyTo
            || oCurrentMessageData.sReferences !== this.oCommitedMessageData.sReferences
    },
    commitMessageData () {
      this.oCommitedMessageData = this.getMessageData()
    },
    send () {
      if (this.isEnableSending) {
        if (!this.pgpApplied && this.autoEncryptSignMessage) {
          this.encryptSignAndSend()
        } else {
          this.continueSending()
        }
      }
    },
    encryptSignAndSend () {
      let
        sFromEmail = (this.selectedIdentity && (this.selectedIdentity.value instanceof cIdentity || this.selectedIdentity.value instanceof cAlias)) ? this.selectedIdentity.value.sEmail : '',
        aRecipients = [].concat(this.selectedToAddr, this.selectedCcAddr, this.selectedBccAddr),
        oRecipients = this.groupAllRecipients(aRecipients)

      this.proceedEncryptSignRecipients = oRecipients
      this.proceedEncryptSignFromEmail = sFromEmail
      this.confirmNotAllRecipientsEncryptSign()
    },
    groupAllRecipients (aRecipients) {
      let
        aRecipientsSimple = [],
        aRecipientsEncrypt = [],
        aRecipientsSign = [],
        aRecipientsSignEncrypt = [],
        iSendingCount = 0

      _.each(aRecipients, (oRecipientInfo) => {
        if (oRecipientInfo.hasPgpKey) {
          if (oRecipientInfo.pgpEncrypt) {
            if (oRecipientInfo.pgpSign) {
              aRecipientsSignEncrypt.push(oRecipientInfo.email)
            } else {
              aRecipientsEncrypt.push(oRecipientInfo.email)
            }
          } else if (oRecipientInfo.pgpSign) {
            aRecipientsSign.push(oRecipientInfo.email)
          } else {
            aRecipientsSimple.push(oRecipientInfo.email)
          }
        } else {
          aRecipientsSimple.push(oRecipientInfo.email)
        }
      })

      if (aRecipientsSimple.length > 0) {
        iSendingCount++
      }
      if (aRecipientsEncrypt.length > 0) {
        iSendingCount++
      }
      if (aRecipientsSign.length > 0) {
        iSendingCount++
      }
      if (aRecipientsSignEncrypt.length > 0) {
        iSendingCount++
      }

      return {
        simple: aRecipientsSimple,
        encrypt: aRecipientsEncrypt,
        sign: aRecipientsSign,
        signEncrypt: aRecipientsSignEncrypt,
        simpleCount: aRecipientsSimple.length,
        encryptCount: aRecipientsEncrypt.length,
        signCount: aRecipientsSign.length,
        signEncryptCount: aRecipientsSignEncrypt.length,
        groupCount: iSendingCount,
      }
    },

    confirmNotAllRecipientsEncryptSign () {
      let
        oRecipients = this.proceedEncryptSignRecipients,
        sConfirm = null
      if (oRecipients.simpleCount > 0) {
        if (oRecipients.encryptCount > 0 || oRecipients.signEncryptCount > 0) {
          sConfirm = 'Please note that not all recipients support encryption. They will recieve unencrypted copy of the message. You can go back and edit list of the recipients.'
        } else if (oRecipients.signCount > 0) {
          sConfirm = 'Please note that not all recipients support signing. They will recieve unsigned copy of the message. You can go back and edit list of the recipients.'
        }
      } else {
        if (oRecipients.signCount > 0 && (oRecipients.encryptCount > 0 || oRecipients.signEncryptCount > 0)) {
          sConfirm = 'Please note that not all recipients support encryption. They will recieve unencrypted copy of the message. You can go back and edit list of the recipients.'
        } else if (oRecipients.signCount === 0 && oRecipients.encryptCount > 0 && oRecipients.signEncryptCount > 0) {
          sConfirm = 'Please note that not all recipients support signing. They will recieve unsigned copy of the message. You can go back and edit list of the recipients.'
        }
      }

      if (sConfirm !== null) {
        this.confirmNotAllRecipientsEncryptSignText = sConfirm;
        this.showConfirmNotAllRecipientsEncryptSign = true;
      } else {
        this.proceedEncryptSignAndSend()
      }
    },

    async proceedEncryptSignAndSend () {
      let
        oRecipients = this.proceedEncryptSignRecipients,
        sFromEmail = this.proceedEncryptSignFromEmail,
        oPrivateKey = null,
        sPassphrase = '',
        sError = ''
      if (oRecipients.signCount > 0 || oRecipients.signEncryptCount > 0) {
        let oResult = await OpenPgp.getPrivateOwnKeyAndPassphrase(sFromEmail, this.askOpenPgpKeyPassword)
        oPrivateKey = oResult?.oPrivateKey
        sPassphrase = oResult?.sPassphrase
        sError = oResult?.sError
        if (typesUtils.isNonEmptyString(sError)) {
          notification.showError(sError)
        }
      }
      this.proceedEncryptSignRecipients = null
      this.proceedEncryptSignFromEmail = ''
      if (!typesUtils.isString(sPassphrase) || !oPrivateKey) {
        return;
      }

      let
        sData = this.getPlainEditorText(),
        oSendParameters = this.getMessageData(),
        aInfoToSend = [],
        fContinueSending = (oSendParameters, bAddToSentFolder) => {
          this.commitMessageData()
          this.clearAutosaveTimer()
          this.sending = true
          oSendParameters.bAddToSentFolder = bAddToSentFolder
          composeUtils.sendMessage(
            oSendParameters,
            (oResult, oError) => {
              this.sending = false
              if (oResult) {
                notification.showReport('Your message has been sent.')
                this.closeCompose()
                this.$store.dispatch('mail/asyncRefresh')
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while sending message'))
              }
            }
          )
        }

      if (oRecipients.simpleCount > 0) {
        let oCloneSendParameters = _.clone(oSendParameters)
        oCloneSendParameters.aRecipients = oRecipients.simple
        fContinueSending(oCloneSendParameters, oRecipients.signCount === 0 && oRecipients.encryptCount === 0 && oRecipients.signEncryptCount === 0)
      }
      if (oRecipients.signCount > 0) {
        let { sSignedData, sError } = await OpenPgp.signTextWithPassphrase(sData, oPrivateKey, sPassphrase)
        if (sSignedData) {
          let oCloneSendParameters = _.clone(oSendParameters)
          oCloneSendParameters.aRecipients = oRecipients.sign
          oCloneSendParameters.sText = sSignedData
          oCloneSendParameters.bPlainText = true
          fContinueSending(oCloneSendParameters, oRecipients.encryptCount === 0 && oRecipients.signEncryptCount === 0)
        } else {
          notification.showError(sError)
        }
      }
      if (oRecipients.encryptCount > 0) {
        let aRecipientPublicKeys = _.filter(this.getRecipientPublicKeys(), (oPublicKey) => {
          return _.indexOf(oRecipients.encrypt, oPublicKey.sEmail) !== -1
        })
        let oSenderPublicKey = this.getSenderPublicKey()
        if (oSenderPublicKey) {
          aRecipientPublicKeys.push(oSenderPublicKey)
        }
        let { sEncryptedData, sError } = await OpenPgp.encryptText(sData, aRecipientPublicKeys)
        if (sEncryptedData) {
          let oCloneSendParameters = _.clone(oSendParameters)
          oCloneSendParameters.aRecipients = oRecipients.encrypt
          oCloneSendParameters.sText = sEncryptedData
          oCloneSendParameters.bPlainText = true
          fContinueSending(oCloneSendParameters, oRecipients.signEncryptCount === 0)
        } else {
          notification.showError(sError)
        }
      }
      if (oRecipients.signEncryptCount > 0) {
        let aRecipientPublicKeys = _.filter(this.getRecipientPublicKeys(), (oPublicKey) => {
          return _.indexOf(oRecipients.signEncrypt, oPublicKey.sEmail) !== -1
        })
        let oSenderPublicKey = this.getSenderPublicKey()
        if (oSenderPublicKey) {
          aRecipientPublicKeys.push(oSenderPublicKey)
        }
        let { sEncryptedSignedData, sError } = await OpenPgp.signAndEncryptTextWithPassphrase(sData, aRecipientPublicKeys, oPrivateKey, sPassphrase)
        if (sEncryptedSignedData) {
          let oCloneSendParameters = _.clone(oSendParameters)
          oCloneSendParameters.aRecipients = oRecipients.signEncrypt
          oCloneSendParameters.sText = sEncryptedSignedData
          oCloneSendParameters.bPlainText = true
          fContinueSending(oCloneSendParameters, true)
        } else {
          notification.showError(sError)
        }
      }
    },

    continueSending () {
      if (this.isEnableSending) {
        this.commitMessageData()
        this.clearAutosaveTimer()
        this.sending = true
        composeUtils.sendMessage(
          this.getMessageData(),
          (oResult, oError) => {
            this.sending = false
            if (oResult) {
              notification.showReport('Your message has been sent.')
              this.closeCompose()
              this.$store.dispatch('mail/asyncRefresh')
            } else {
              notification.showError(errors.getText(oError, 'Error occurred while sending message'))
            }
          }
        )
      }
    },
    save (bSilently) {
      if (!this.saving && !this.sending) {
        this.commitMessageData()
        this.clearAutosaveTimer()
        this.saving = true
        composeUtils.saveMessage(
          this.getMessageData(),
          (oResult, oError, oParameters) => {
            this.saving = false
            if (oResult) {
              if (!bSilently) {
                notification.showReport('Your message has been saved.')
              }
              if (oParameters && oParameters.DraftUid === this.draftUid) {
                this.draftUid = typesUtils.pString(oResult.NewUid)
              }
              this.$store.dispatch('mail/asyncRefresh')
              this.setAutosaveTimer()
            } else {
              notification.showError(errors.getText(oError, 'Error occurred while saving message'))
            }
            this.$root.$emit('save-message')
          }
        )
      }
    },
    setSelectedIdentity () {
      if (this.allIdentities.length === 0) {
        this.selectedIdentity = null
      } else {
        let mSelectedIdentityId = this.selectedIdentity ? this.selectedIdentity.value.iEntityId : false
        let mSelectedIdentityAccountId = this.selectedIdentity ? this.selectedIdentity.value.iIdAccount : false
        let oSelectedIdentity = _.find(this.allIdentities, function (oIdentity) {
          return oIdentity.iEntityId === mSelectedIdentityId && oIdentity.iIdAccount === mSelectedIdentityAccountId
        })
        if (!oSelectedIdentity) {
          let oIdentity = _.find(this.allIdentities, function (oIdentity) {
            return oIdentity.bDefault
          })
          if (!oIdentity) {
            oIdentity = this.allIdentities[0]
          }
          this.selectedIdentity = {
            label: textUtils.encodeHtml(oIdentity.getFull()),
            value: oIdentity,
          }
        }
      }
    },
    openCompose (oComposeParameters) {
      if (this.dialog) {
        // Compose dialog is opened but not expanded.
        if (!_.isEmpty(oComposeParameters)) {
          if (this.isMessageDataChanged()) {
            // Ask what to do. Also expand compose dialog.
            this.composeParameters = oComposeParameters
            this.discardPreviousDraftDialog = true
            this.discardPreviousDraftText = typesUtils.pString(oComposeParameters.sAnotherMessageComposedText, 'Another message is already being composed.')
          } else {
            // Continue opening compose. Also expand compose dialog.
            this.continueOpeningCompose(oComposeParameters)
          }
        } else {
          // Just expand compose dialog.
        }
        this.maximizedToggle = false // Expanding compose dialog.
      } else {
        // Continue opening compose. Dialog is closed.
        this.continueOpeningCompose(oComposeParameters)
      }
    },
    discardPreviousDraft () {
      this.continueOpeningCompose(this.composeParameters)
    },
    savePreviousDraft () {
      this.save(true)
      this.continueOpeningCompose(this.composeParameters)
    },
    async continueOpeningCompose ({ aDraftInfo, sDraftUid, oIdentity, aToContacts, aCcContacts, aBccContacts, sSubject, sText, aAttachments,
                                    sInReplyTo, sReferences, iImportance, bReadingConfirmation, bSaveImmediately }) {
      let bPendingSave = false
      this.composeParameters = null
      this.$store.dispatch('contacts/asyncGetContactsOpenPgpExternalKeys')
      this.allowInsertImage = mailSettings.bAllowInsertImage
      this.mailScheduledAllowed = mailSettings.bMailScheduledAllowed
      this.selectedIdentity = oIdentity ? {
        label: textUtils.encodeHtml(oIdentity.getFull()),
        value: oIdentity,
      } : null
      this.setSelectedIdentity()
      if (typesUtils.isNonEmptyArray(aToContacts)) {
        this.selectedToAddr = _.map(aToContacts, (oContactData) => {
          return this.getOptionFromContactData(oContactData)
        })
      } else {
        this.selectedToAddr = []
      }
      if (typesUtils.isNonEmptyArray(aCcContacts)) {
        this.selectedCcAddr = _.map(aCcContacts, (oContactData) => {
          return this.getOptionFromContactData(oContactData)
        })
      } else {
        this.selectedCcAddr = []
      }
      if (typesUtils.isNonEmptyArray(aBccContacts)) {
        this.selectedBccAddr = _.map(aBccContacts, (oContactData) => {
          return this.getOptionFromContactData(oContactData)
        })
      } else {
        this.selectedBccAddr = []
      }
      this.subjectText = typesUtils.pString(sSubject)
      this.plainText = false
      this.disableEditor = false
      this.disableRecipients = false
      this.pgpApplied = false

      if (typesUtils.isNonEmptyString(sText)) {
        this.editortext = sText
      } else {
        let oIdentity = this.selectedIdentity && this.selectedIdentity.value
        let sSignature = oIdentity && oIdentity.bUseSignature ? typesUtils.pString(oIdentity.sSignature, '') : ''
        this.editortext = '<br><br>' + composeUtils.getTagWrappedSignature(sSignature)
      }

      this.attachments = []
      if (typesUtils.isNonEmptyArray(aAttachments)) {
        let aHashes = []
        _.each(aAttachments, (oAttachData) => {
          let oAttach = new cAttachment()
          oAttach.parseDataFromServer(oAttachData)
          this.attachments.push(oAttach)
          if (typesUtils.isNonEmptyString(oAttach.sHash)) {
            aHashes.push(oAttach.sHash)
          }
        })
        if (aHashes.length > 0) {
          bPendingSave = true
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Mail',
            sMethod: 'SaveAttachmentsAsTempFiles',
            oParameters: {
              Attachments: aHashes,
              AccountID: this.$store.getters['mail/getCurrentAccountId'],
            },
            fCallback: (aResult, oError) => {
              if (aResult) {
                _.each(aResult, (sHash, sTempName) => {
                  let oAttach = _.find(this.attachments, (oTmpAttach) => {
                    return oTmpAttach.sHash === sHash
                  })
                  if (oAttach) {
                    oAttach.setTempName(sTempName)
                    oAttach.onUploadComplete()
                  }
                })
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
              if (bSaveImmediately) {
                this.save(true)
              }
            },
          })
        } else if (typesUtils.isNonEmptyString(aAttachments[0].Content)) {
          bPendingSave = true
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Core',
            sMethod: 'SaveContentAsTempFile',
            oParameters: aAttachments[0],
            fCallback: (oResult, oError) => {
              if (oResult) {
                let oAttach = this.attachments[0]
                if (oAttach) {
                  if (oResult.Size === 0) {
                    oResult.Size = aAttachments[0].Content.length
                  }
                  oAttach.parseDataFromServer(oResult)
                  oAttach.onUploadComplete()
                }
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
              if (bSaveImmediately) {
                this.save(true)
              }
            },
          })
        } else if (typesUtils.isNonEmptyString(aAttachments[0].ContactUUID)) {
          bPendingSave = true
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Contacts',
            sMethod: 'SaveContactAsTempFile',
            oParameters: { 'UUID': aAttachments[0].ContactUUID, 'FileName': aAttachments[0].FileName },
            fCallback: (oResult, oError) => {
              if (oResult) {
                let oAttach = this.attachments[0]
                if (oAttach) {
                  oAttach.parseDataFromServer(oResult)
                  oAttach.onUploadComplete()
                }
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
              if (bSaveImmediately) {
                this.save(true)
              }
            },
          })
        } else if (aAttachments[0].MessageData) {
          bPendingSave = true
          webApi.sendRequest({
            sApiHost: this.sApiHost,
            sModule: 'Mail',
            sMethod: 'SaveMessageAsTempFile',
            oParameters: {
              AccountID: aAttachments[0].MessageData.AccountID,
              MessageFolder: aAttachments[0].MessageData.MessageFolder,
              MessageUid: aAttachments[0].MessageData.MessageUid,
              FileName: aAttachments[0].FileName
            },
            fCallback: (oResult, oError) => {
              if (oResult) {
                let oAttach = this.attachments[0]
                if (oAttach) {
                  oAttach.parseDataFromServer(oResult)
                  oAttach.onUploadComplete()
                }
                this.commitMessageData()
              } else {
                notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
              }
              if (bSaveImmediately) {
                this.save(true)
              }
            },
          })
        }
      }

      this.draftUid = typesUtils.pString(sDraftUid)
      this.draftInfo = typesUtils.pArray(aDraftInfo)
      this.inReplyTo = typesUtils.pString(sInReplyTo)
      this.references = typesUtils.pString(sReferences)
      this.iImportance = typesUtils.pInt(iImportance, 3)
      this.bReadingConfirmation = typesUtils.pBool(bReadingConfirmation, false)

      this.isCcShowed = typesUtils.isNonEmptyString(this.ccAddrComputed)
      this.isBccShowed = typesUtils.isNonEmptyString(this.bccAddrComputed)
      this.dialog = true

      await this.$nextTick()
      this.commitMessageData()
      this.setAutosaveTimer()

      if (bSaveImmediately && !bPendingSave) {
        this.save(true)
      }
    },
    closeCompose () {
      this.dialog = false
    },
    setAutosaveTimer () {
      this.clearAutosaveTimer()
      if (this.dialog && mailSettings.bAllowAutosaveInDrafts && mailSettings.iAutoSaveIntervalSeconds > 0) {
        this.iAutosaveTimer = setTimeout(() => {
          if (this.isMessageDataChanged()) {
            this.save()
          } else {
            this.setAutosaveTimer()
          }
        }, mailSettings.iAutoSaveIntervalSeconds * 1000)
      }
    },
    clearAutosaveTimer () {
      clearTimeout(this.iAutosaveTimer)
    },
    showCc () {
      this.isCcShowed = true
    },
    showBcc () {
      this.isBccShowed = true
    },
    changeColors () {
      console.log('changeColors')
    },
    insertImage () {
      this.$refs.editor.focus()
      this.$refs.imageUploader.pickFiles()
    },
    insertImageByUrl () {
      this.$refs.editor.focus()
      document.execCommand('insertHTML', true, '<img src="' + this.imageUrl + '" />')
    },
    cancelInsertImage () {
      this.$refs.insertImageDropdown.hide()
    },
    uploaderFactory () {
      let url = this.sApiHost + '/?/Api/'
      let sAuthToken = this.$store.getters['user/getAuthToken']
      let headers = []
      if (sAuthToken) {
        headers.push({name: 'Authorization', value: 'Bearer ' + sAuthToken})
      }
      let iAccountId = this.currentAccount ? this.currentAccount.iAccountId : 0
      return {
        url,
        method: 'POST',
        headers,
        fieldName: 'jua-uploader',
        formFields: [
          { name: 'jua-post-type', value: 'ajax' },
          { name: 'Module', value: 'Mail' },
          { name: 'Method', value: 'UploadAttachment' },
          { name: 'Parameters', value: JSON.stringify({ 'AccountID': iAccountId }) },
        ],
      }
    },
    onImageFileAdded (files) {
      if (typesUtils.isNonEmptyArray(files)) {
        _.each(files, (oFile) => {
          let oAttach = new cAttachment()
          oAttach.parseUploaderFile(oFile, true)
          this.attachments.push(oAttach)
        })
      }
    },
    onFileAdded (files) {
      if (typesUtils.isNonEmptyArray(files)) {
        _.each(files, (oFile) => {
          let oAttach = new cAttachment()
          oAttach.parseUploaderFile(oFile, false)
          this.attachments.push(oAttach)
        })
      }
    },
    onFileUploaded ({ files, xhr }) {
      let oFile = typesUtils.isNonEmptyArray(files) ? files[0] : null
      let oAttach = oFile ? _.find(this.attachments, (oTmpAttach) => {
        return oTmpAttach.sLocalPath === oFile.path
      }) : null
      if (oAttach) {
        let oResponse = typesUtils.pStringToJson(xhr.responseText)
        if (oResponse && oResponse.Result && oResponse.Result.Attachment) {
          oAttach.parseDataFromServer(oResponse.Result.Attachment)
          oAttach.onUploadComplete()
          if (oAttach.bLinked) {
            document.execCommand('insertHTML', true, '<img src="' + this.sApiHost + '/' + oAttach.sViewLink + '" data-x-src-cid="' + oAttach.sCid + '" />')
            this.$refs.imageUploader.removeFile(oFile)
            oAttach.oFile = null
          }
        } else {
          notification.showError(errors.getText(oResponse, 'Error occurred while uploading file'))
          oAttach.onUploadFailed()
        }
      }
    },
    onFileUploadFailed ({ files, xhr }) {
      let oFile = typesUtils.isNonEmptyArray(files) ? files[0] : null
      let oAttach = oFile ? _.find(this.attachments, (oTmpAttach) => {
        return oTmpAttach.sLocalPath === oFile.path
      }) : null
      if (oAttach) {
        let oResponse = typesUtils.pStringToJson(xhr.responseText)
        notification.showError(errors.getText(oResponse, 'Error occurred while uploading file'))
        oAttach.onUploadFailed()
      }
    },
    removeAttachment (scope, oAttach) {
      if (oAttach.oFile) {
        scope.removeFile(oAttach.oFile)
      }
      this.attachments = _.filter(this.attachments, (oTmpAttach) => {
        return oTmpAttach.sHash !== oAttach.sHash
      })
    },
    pickFiles () {
      this.$refs.uploader.pickFiles()
    },
    saveAndClose () {
      if (this.isMessageDataChanged()) {
        this.save()
      }
      this.bEncryptAction = false
      this.closeCompose()
    },
    openScheduleSendingDialog () {
      if (this.autoEncryptSignMessage) {
        notification.showError('Cannot schedule email with automatic PGP encryption turned on. Please encrypt the message manually.')
      } else {
        this.clearAutosaveTimer()
        this.$refs.scheduleSendingDialog.open(this.saveScheduledMessage.bind(this))
      }
    },
    saveScheduledMessage (iUnix) {
        this.commitMessageData()
        let oData = this.getMessageData()
        oData.iScheduleDateTime = iUnix;
        this.clearAutosaveTimer()
        this.sending = true
        composeUtils.scheduleMessage(
          oData,
          (oResult, oError) => {
            this.sending = false
            if (oResult) {
              notification.showReport('Your message has been scheduled.')
              this.closeCompose()
              this.$store.dispatch('mail/asyncRefresh')
            } else {
              notification.showError(errors.getText(oError, 'Error occurred while scheduling message'))
              this.setAutosaveTimer()
            }
          }
        )
    },
    openSelfDestructingEmailDialog () {
      if (typesUtils.isNonEmptyArray(this.selectedToAddr)) {
        this.selfDestructingRecipient = this.selectedToAddr[0]
      } else {
        this.selfDestructingRecipient = null
      }
      this.selfDestructingShowPassword = ''
      this.selfDestructingEmailDialog = true

      this.privateKey = OpenPgp.getCurrentPrivateOwnKey(false)

      if (this.selfDestructingEncryptType === 'key') {
        if (this.privateKey === null) {
          this.sCaptionForEncryption = 'Requires your PGP private key in Settings.'
        } else {
          this.sCaptionForEncryption = ''
        }
      } else {
        if (this.privateKey === null) {
          this.sCaptionForEncryption = 'Requires key-based encryption.'
        } else {
          this.sCaptionForEncryption = ''
        }
      }

    },
    async createSelfDestrucPublicLink (sSubject, sData, sRecipientEmail, sEncryptionBasedMode, iLifetimeHrs) {
      const oPromiseCreateSelfDestrucPublicLink = new Promise( (resolve, reject) => {
        ipcRenderer.once('openpgp-create-self-destruc-public-link', (oEvent, { oResult, oError }) => {
          if (oResult && oResult.link) {
            resolve(oResult.link)
          } else {
            reject(new Error(errors.getText(oError, 'Error on public link creation')))
          }
        })
        ipcRenderer.send('openpgp-create-self-destruc-public-link', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          sSubject,
          sData,
          sRecipientEmail,
          sEncryptionBasedMode,
          iLifetimeHrs,
        })
      })

      try {
        return { sLink: await oPromiseCreateSelfDestrucPublicLink }
      } catch (oError) {
        return { sError: oError && oError.message ? oError.message : 'Error on public link creation' }
      }
    },
    async sendSelfDestructingSecureEmail () {
      this.bEncryptAction = true
      this.isSelfDestructingMail = true
      this.isEncrypting = true
      let sUserEmail = this.currentAccount ? this.currentAccount.sEmail : ''
      const { sEncryptedData, sPassword, sError, sPassphrase } = await OpenPgp.encryptData(
        this.getPlainEditorText(),
        sUserEmail,
        this.selfDestructingRecipient.email,
        this.selfDestructingEncryptType === 'password',
        this.selfDestructingAddSignature,
        this.askOpenPgpKeyPassword,
      )
      if (typesUtils.isNonEmptyString(sError)) {
        notification.showError(sError)
      } else {
        //create link
        let { sLink, sError } = await this.createSelfDestrucPublicLink(
          this.subjectText, sEncryptedData,
          this.selfDestructingRecipient.email,
          this.selfDestructingEncryptType,
          this.selfDestructingLifetime.value
        )
        if (typesUtils.isNonEmptyString(sError) || !typesUtils.isNonEmptyString(sLink)) {
          notification.showError(sError || 'Could not create public link.')
        } else {
          const sFullLink = this.$store.getters['main/getApiHost'] + sLink + '#' + openpgpSettings.sSelfDestructMessageHash

          //compose message
          const sSubject = 'The secure message was shared with you'
          let sBody = ''
          let sBrowserTimezone = moment.tz.guess()
          let sServerTimezone = coreSettings.sTimezone
          let sCurrentTime = moment.tz(new Date(), sBrowserTimezone || sServerTimezone).format('MMM D, YYYY HH:mm [GMT] ZZ')

          if (this.selfDestructingRecipient.hasPgpKey) {//encrypt message with key
            if (sPassword) {
              sBody = 'Hello,%BR%%EMAIL% user sent you a self-destructing secure email.%BR%You can read it by the following link: %URL%%BR%The message is password-protected. The password is: %PASSWORD%%BR%The message will be accessible for %HOURS% hours starting from %CREATING_TIME_GMT%'
              sBody = sBody
                          .replace(/%URL%/g, sFullLink)
                          .replace(/%BR%/g, '\r\n')
                          .replace(/%PASSWORD%/g, sPassword)
                          .replace(/%EMAIL%/g, sUserEmail)
                          .replace(/%HOURS%/g, this.selfDestructingLifetime.value)
                          .replace(/%CREATING_TIME_GMT%/g, sCurrentTime)
            } else {
              sBody = 'Hello,%BR%%EMAIL% user sent you a self-destructing secure email.%BR%You can read it by the following link: %URL%%BR%The message will be accessible for %HOURS% hours starting from %CREATING_TIME_GMT%'
              sBody = sBody
                          .replace(/%URL%/g, sFullLink)
                          .replace(/%BR%/g, '\r\n')
                          .replace(/%EMAIL%/g, sUserEmail)
                          .replace(/%HOURS%/g, this.selfDestructingLifetime.value)
                          .replace(/%CREATING_TIME_GMT%/g, sCurrentTime)
            }
            this.subjectText = sSubject
            this.editortext = sBody
            this.selectedToAddr = [this.selfDestructingRecipient]
            if (this.selfDestructingAddSignature) {
              this.signAndEncrypt(sPassphrase)
            } else {
              this.encrypt()
            }
            this.selfDestructingEmailDialog = false
          } else {
            //send not encrypted message
            //if the recipient does not have a key, the message can only be encrypted with a password
            if (sPassword) {
              sBody = 'Hello,%BR%%EMAIL% user sent you a self-destructing secure email.%BR%You can read it by the following link: <a href=\"%URL%\">%URL%</a>%BR%The message will be accessible for %HOURS% hours starting from %CREATING_TIME_GMT%'
              sBody = sBody
                          .replace(/%URL%/g, sFullLink)
                          .replace(/%BR%/g, '<br>')
                          .replace(/%EMAIL%/g, sUserEmail)
                          .replace(/%HOURS%/g, this.selfDestructingLifetime.value)
                          .replace(/%CREATING_TIME_GMT%/g, sCurrentTime)
              this.selfDestructingShowPassword = sPassword
              this.subjectText = sSubject
              this.editortext = sBody
              this.plainText = false
              this.selectedToAddr = [this.selfDestructingRecipient]
            }
          }
        }
      }
      this.isEncrypting = false
    },
  },
}
</script>
