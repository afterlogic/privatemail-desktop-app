<template>
    <q-dialog
      v-model="dialog"
      persistent
      :seamless="maximizedToggle"
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      @before-hide="onBeforeHide"
    >
      <q-dialog v-model="convertToPlainConfirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <span class="q-ml-sm">OpenPGP supports plain text only. Click OK to remove all the formatting and continue.</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Ok" color="primary" @click="convertToPlain" v-close-popup />
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="pgpSignEncryptDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <span class="q-ml-sm" header>OpenPGP Sign/Encrypt</span>
          </q-card-section>
          <q-card-section class="row items-center">
            <q-list>
              <q-item tag="label" v-ripple>
                <q-item-section side top>
                  <q-checkbox v-model="signCheckbox" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sign</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-input outlined v-model="signPassword" label="Password" @click.stop.prevent />
                </q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section side top>
                  <q-checkbox v-model="encryptCheckbox" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Encrypt</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="PGP Sign/Encrypt" color="primary" @click="signAndEncrypt" v-close-popup v-if="signCheckbox && encryptCheckbox" />
            <q-btn flat label="Sign" color="primary" @click="sign" v-close-popup v-if="signCheckbox && !encryptCheckbox" />
            <q-btn flat label="Encrypt" color="primary" @click="encrypt" v-close-popup v-if="!signCheckbox && encryptCheckbox" />
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <div class="column bg-white" style="min-width: 300px;" v-show="maximizedToggle">
        <q-toolbar class="col-auto q-pa-md bg-grey-9 theme-text">
          <q-toolbar-title @dblclick="maximizedToggle = false">
            {{subjectText !== '' ? subjectText : 'New message'}}
          </q-toolbar-title>
          <q-space />
          <q-btn flat icon="minimize" @click="maximizedToggle = true" :disable="maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Minimize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="crop_square" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Maximize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="close" @click="saveAndClose">
            <q-tooltip content-class="bg-white text-primary">Save&nbsp;and&nbsp;Close</q-tooltip>
          </q-btn>
        </q-toolbar>
      </div>
      <div class="column no-wrap bg-white" style="min-width: 1100px;" v-show="!maximizedToggle">
        <q-toolbar class="col-auto q-pa-md bg-grey-9 theme-text">
          <q-btn flat icon="send" label="Send" @click="send" :disable="!isEnableSending" />
          <q-btn flat icon="save" label="Save" @click="save" />
          <q-btn flat icon="vpn_key" v-if="!pgpApplied" label="PGP Sign/Encrypt" @click="pgpSignEncrypt" />
          <q-btn flat icon="vpn_key" v-if="pgpApplied" label="Undo PGP" @click="undoPGP" />
          <q-space />
          <q-btn flat icon="minimize" @click="maximizedToggle = true" :disable="maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Minimize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="crop_square" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <!-- <q-tooltip content-class="bg-white text-primary">Maximize</q-tooltip> -->
          </q-btn>
          <q-btn flat icon="close" @click="saveAndClose">
            <q-tooltip content-class="bg-white text-primary">Save&nbsp;and&nbsp;Close</q-tooltip>
          </q-btn>
        </q-toolbar>
        <div class="col">
          <div class="row full-height full-width">
            <div class="col column">
              <div class="col-auto">
                <q-list>
                  <q-item>
                    <q-item-section side center style="min-width: 100px;">
                      To
                    </q-item-section>
                    <q-item-section>
                      <q-input dense outlined v-model="toAddr" style="width: 100%;" />
                    </q-item-section>
                    <q-item-section style="max-width: 100px;" v-show="!isCcShowed || !isBccShowed">
                      <a href="javascript:void(0)" v-show="!isCcShowed" @click="showCc">Show CC</a>
                      <a href="javascript:void(0)" v-show="!isBccShowed" @click="showBcc">Show BCC</a>
                    </q-item-section>
                  </q-item>
                  <q-item v-show="isCcShowed">
                    <q-item-section side center style="min-width: 100px;">
                      CC
                    </q-item-section>
                    <q-item-section>
                      <q-input dense outlined v-model="ccAddr" style="width: 100%;" />
                    </q-item-section>
                  </q-item>
                  <q-item v-show="isBccShowed">
                    <q-item-section side center style="min-width: 100px;">
                      BCC
                    </q-item-section>
                    <q-item-section>
                      <q-input dense outlined v-model="bccAddr" style="width: 100%;" />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section side center style="min-width: 100px;">
                      Subject
                    </q-item-section>
                    <q-item-section>
                      <q-input dense outlined v-model="subjectText" style="width: 100%;" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <!-- :definitions="{
                      image: {
                        tip: 'Insert image',
                        icon: 'image',
                        handler: insertImage
                      },
                    colors: {
                      tip: 'Font & background colors',
                      icon: 'text_format',
                      handler: changeColors
                    },
                  }" -->
              </div>
              <div class="col q-pa-md full-width"> 
                <q-editor v-model="editortext" ref="editor" height="400px" class="full-height"
                  :disable="disableEditor"
                  :toolbar="[
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
                      ]
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
                    ['link', 'image', 'removeFormat']
                  ]"
                  :fonts="{
                    arial: 'Arial',
                    arial_black: 'Arial Black',
                    courier_new: 'Courier New',
                    tahoma: 'Tahoma',
                    times_new_roman: 'Times New Roman',
                    verdana: 'Verdana'
                  }"
                >
                  <template v-slot:image>
                    <q-btn-dropdown flat
                      dropdown-icon="none"
                      ref="insertImageDropdown"
                      @hide="imageUrl=''"
                    >
                      <template v-slot:label>
                        <q-btn flat icon="image" />
                        <q-tooltip>
                          Insert Image
                        </q-tooltip>
                      </template>
                      <div style="padding: 10px;">
                        <div>
                          <div>
                            Please select an image file to upload
                          </div>
                          <div clickable @click="insertImage">
                            <q-btn flat label="Choose File" />
                          </div>
                        </div>
                        <div>
                          <div>
                            or enter an URL:
                          </div>
                          <div>
                            <input type="text" v-model="imageUrl" />
                          </div>
                          <div clickable>
                            <q-btn flat label="Insert" @click="insertImageByUrl" />
                            <q-btn flat label="Cancel" @click="cancelInsertImage" />
                          </div>
                        </div>
                      </div>
                    </q-btn-dropdown>
                  </template>
                </q-editor>
                <q-uploader style="display: none;"
                    ref="imageUploader"
                    auto-upload
                    hide-upload-btn
                    :accept="acceptedImageTypes"
                    :factory="uploaderFactory"
                    @added="onImageFileAdded"
                    @uploaded="onFileUploaded"
                    @failed="onFileUploadFailed"
                  >
                    <template v-slot:header="scope">
                      <q-uploader-add-trigger />
                    </template>
                    <template v-slot:list="scope" >
                    </template>
                </q-uploader>
              </div>
            </div>
            <div class="col-auto q-pa-md column" style="min-width: 400px;">
              <div class="col-auto items-center">
                <q-btn no-wrap no-caps unelevated type="a" icon="attachment" @click="pickFiles">
                  <q-tooltip>Pick Files</q-tooltip>
                </q-btn>
                <q-separator />
              </div>
              <q-scroll-area class="col column full-height full-width">
                <q-uploader
                    style="max-height: initial"
                    class="col full-height"
                    flat
                    ref="uploader"
                    multiple
                    auto-upload
                    hide-upload-btn
                    :factory="uploaderFactory"
                    @added="onFileAdded"
                    @uploaded="onFileUploaded"
                    @failed="onFileUploadFailed"
                  >
                    <template v-slot:header="scope">
                      <div class="row no-wrap items-center q-pa-sm q-gutter-xs" style="opacity: 0; height: 0px;">
                        <!-- <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat >
                          <q-tooltip>Clear All</q-tooltip>
                        </q-btn>
                        <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles" round dense flat >
                          <q-tooltip>Remove Uploaded Files</q-tooltip>
                        </q-btn>
                        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner">
                        </q-spinner>
                        <div class="col">
                          <div class="q-uploader__title">Upload your files</div>
                          <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div>
                        </div> -->
                        <q-btn dense flat type="a" icon="add_box">
                          <q-uploader-add-trigger />
                          <q-tooltip>Pick Files</q-tooltip>
                        </q-btn>
                        <!-- <q-btn v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round dense flat >
                          <q-tooltip>Upload Files</q-tooltip>
                        </q-btn>

                        <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat >
                          <q-tooltip>Abort Upload</q-tooltip>
                        </q-btn> -->
                      </div>
                    </template>
                    <template v-slot:list="scope" class="ull-height">
                      <q-list separator>
                        <q-item v-for="attach in notLinkedAttachments" :key="attach.sLocalPath">
                          <q-item-section>
                            <q-item-label class="full-width ellipsis">
                              {{ attach.sFileName }}
                            </q-item-label>
                            <q-item-label caption>
                              Status: <span :style="attach.bUploadFailed ? 'color: red;' : (attach.iProgressPercent === 100 ? 'color: green;' : 'color: orange;')">{{ attach.getStatus() }}</span>
                            </q-item-label>
                            <q-item-label caption>
                              {{ attach.getFriendlySize() }} / {{ attach.getProgressPercent() }}%
                            </q-item-label>
                          </q-item-section>
                          <q-item-section
                            v-if="attach.sThumbnailLink"
                            thumbnail
                            class="gt-xs"
                          >
                            <img :src="attach.sThumbnailLink">
                          </q-item-section>

                          <q-item-section top side>
                            <q-btn
                              v-if="attach.iProgressPercent === 100"
                              class="gt-xs"
                              size="12px"
                              flat
                              dense
                              round
                              icon="delete"
                              @click="removeAttachment(scope, attach)"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                      <!-- <q-list separator>

                        <q-item v-for="file in scope.files" :key="file.name">
                          <q-item-section>
                            <q-item-label class="full-width ellipsis">
                              {{ file.name }}
                            </q-item-label>

                            <q-item-label caption>
                              Status: {{ file.__status }}
                            </q-item-label>

                            <q-item-label caption>
                              {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                            </q-item-label>
                          </q-item-section>

                          <q-item-section
                            v-if="file.__img"
                            thumbnail
                            class="gt-xs"
                          >
                            <img :src="file.__img.src">
                          </q-item-section>

                          <q-item-section top side>
                            <q-btn
                              class="gt-xs"
                              size="12px"
                              flat
                              dense
                              round
                              icon="delete"
                              @click="scope.removeFile(file)"
                            />
                          </q-item-section>
                        </q-item>

                      </q-list> -->
                    </template>
                  </q-uploader>
              </q-scroll-area>
            </div>
          </div>
        </div>
      </div>
      <!-- <q-bar> -->
      <!-- </q-bar> -->
    </q-dialog>
</template>

<style lang="scss">
.q-uploader__header {
  background: none;
}

.q-dialog__inner--maximized {
  align-items: flex-end;
  justify-content: flex-end;

  & > div {
    height: 60px;
    width: 500px;
    max-height: 100vh;
    max-width: 100vw;
    border-radius: 0 !important;
  }
} 
</style>

<script>
import prefetcher from 'src/modules/mail/prefetcher.js'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi'

import CAttachment from 'src/modules/mail/classes/CAttachment.js'
import composeUtils from 'src/modules/mail/utils/compose.js'
import settings from 'src/modules/mail/objects/settings.js'

export default {
  name: 'MailCompose',

  components: {
  },

  data () {
    return {
      dialog: false,
      maximizedToggle: false,

      sending: false, // indicates if sending is happening right now
      allAttachmentsUploaded: true, // indicates if all attachments are loaded from server (for forward or sending files from other modules)

      plainText: false,
      disableEditor: false,
      pgpApplied: false,
      editortext: '',
      prevHtmlText: '',
      toAddr: '',
      ccAddr: '',
      bccAddr: '',
      subjectText: '',

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
      signPassword: '',
    }
  },

  computed: {
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
      let
        bRecipientIsEmpty = this.toAddr.length === 0 && this.ccAddr.length === 0 && this.bccAddr.length === 0,
        bCurrentFolderListLoaded = !!this.currentFolderList && this.currentFolderList.AccountId !== 0

      return bCurrentFolderListLoaded && !this.sending && !bRecipientIsEmpty && this.allAttachmentsUploaded
    },
    notLinkedAttachments () {
      return _.filter(this.attachments, function (oAttach) {
        return !oAttach.bLinked
      })
    },
  },

  beforeDestroy: function () {
    this.clearAutosaveTimer()
  },

  methods: {
    pgpSignEncrypt () {
      this.convertToPlainConfirm = true
    },
    convertToPlain () {
      this.signCheckbox = true
      this.encryptCheckbox = true
      this.signPassword = ''
      this.pgpSignEncryptDialog = true
    },
    convertEditorTextToPlain () {
      this.prevHtmlText = this.editortext
      this.plainText = true
      this.disableEditor = true
      this.pgpApplied = true
      this.editortext = this.editortext
        .replace(/([^>]{1})<div>/gi, '$1\n')
        .replace(/<style[^>]*>[^<]*<\/style>/gi, '\n')
        .replace(/<br *\/{0,1}>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<a [^>]*href="([^"]*?)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
    },
    signAndEncrypt () {
      this.convertEditorTextToPlain()
    },
    sign () {
      this.convertEditorTextToPlain()
    },
    encrypt () {
      this.convertEditorTextToPlain()
    },
    undoPGP () {
      this.editortext = this.prevHtmlText
      this.plainText = false
      this.disableEditor = false
      this.pgpApplied = true
    },
    onBeforeHide () {
      this.clearAutosaveTimer() 
    },
    send () {
      if (this.isEnableSending) {
        this.clearAutosaveTimer()
        composeUtils.sendMessage({
          oCurrentAccount: this.currentAccount,
          oCurrentFolderList: this.currentFolderList,
          sToAddr: this.toAddr,
          sCcAddr: this.ccAddr,
          sBccAddr: this.bccAddr,
          sSubject: this.subjectText,
          sText: this.editortext,
          bPlainText: this.plainText,
          aAttachments: this.attachments,
          sDraftUid: this.draftUid,
          aDraftInfo: this.draftInfo,
          sInReplyTo: this.inReplyTo,
          sReferences: this.references,
        }, (oResult, oError) => {
          if (oResult) {
            // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SENT'))
            notification.showReport('Your message has been sent.')
            this.closeCompose()
            prefetcher.checkMail()
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while sending message'))
          }
        })
      }
    },
    save () {
      this.clearAutosaveTimer()
      composeUtils.saveMessage({
        oCurrentAccount: this.currentAccount,
        oCurrentFolderList: this.currentFolderList,
        sToAddr: this.toAddr,
        sCcAddr: this.ccAddr,
        sBccAddr: this.bccAddr,
        sSubject: this.subjectText,
        sText: this.editortext,
        bPlainText: this.plainText,
        aAttachments: this.attachments,
        sDraftUid: this.draftUid,
        aDraftInfo: this.draftInfo,
        sInReplyTo: this.inReplyTo,
        sReferences: this.references,
      }, (oResult, oError, oParameters) => {
        if (oResult) {
          // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SAVED'))
          notification.showReport('Your message has been saved.')
          if (oParameters && oParameters.DraftUid === this.draftUid) {
            this.draftUid = typesUtils.pString(oResult.NewUid)
          }
          prefetcher.checkMail()
          this.setAutosaveTimer()
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while saving message'))
        }
      })
    },
    openCompose ({ aDraftInfo, sDraftUid, sToAddr, sCcAddr, sBccAddr, sSubject, sText, aAttachments, sInReplyTo, sReferences }) {
      this.toAddr = typesUtils.pString(sToAddr)
      this.ccAddr = typesUtils.pString(sCcAddr)
      this.bccAddr = typesUtils.pString(sBccAddr)
      this.subjectText = typesUtils.pString(sSubject)
      this.editortext = typesUtils.pString(sText)
      this.plainText = false
      this.disableEditor = false
      this.pgpApplied = false

      this.attachments = []
      if (typesUtils.isNonEmptyArray(aAttachments)) {
        let aHashes = []
        let sApiHost = this.$store.getters['main/getApiHost']
        _.each(aAttachments, (oAttachData) => {
          let oAttach = new CAttachment()
          oAttach.parseDataFromServer(oAttachData, sApiHost)
          this.attachments.push(oAttach)
          aHashes.push(oAttach.sHash)
        })
        webApi.sendRequest({
          sApiHost,
          sModule: 'Mail',
          sMethod: 'SaveAttachmentsAsTempFiles',
          oParameters: {
            Attachments: aHashes,
            AccountID: this.$store.getters['mail/getCurrentAccountId'],
          },
          fCallback: (oResult, oError) => {
            if (oResult) {
              _.each(oResult, (sHash, sTempName) => {
                let oAttach = _.find(this.attachments, (oTmpAttach) => {
                  return oTmpAttach.sHash === sHash
                })
                if (oAttach) {
                  oAttach.setTempName(sTempName)
                  oAttach.onUploadComplete()
                }
              })
            } else {
              notification.showError(errors.getText(oError, 'Error occurred while preparing attachments'))
            }
          },
        })
      }

      this.draftUid = typesUtils.pString(sDraftUid)
      this.draftInfo = typesUtils.pArray(aDraftInfo)
      this.inReplyTo = typesUtils.pString(sInReplyTo)
      this.references = typesUtils.pString(sReferences)

      this.isCcShowed = typesUtils.isNonEmptyString(this.ccAddr)
      this.isBccShowed = typesUtils.isNonEmptyString(this.bccAddr)
      this.dialog = true

      this.setAutosaveTimer()
    },
    closeCompose () {
      this.dialog = false
    },
    setAutosaveTimer () {
      this.clearAutosaveTimer()
      if (this.dialog && settings.bAllowAutosaveInDrafts && settings.iAutoSaveIntervalSeconds > 0) {
        this.iAutosaveTimer = setTimeout(() => {
          this.save()
        }, settings.iAutoSaveIntervalSeconds * 1000)
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
      let url = this.$store.getters['main/getApiHost'] + '?/Api/'
      let sAuthToken = this.$store.getters['user/getAuthToken']
      let headers = []
      if (sAuthToken) {
        headers.push({name: 'Authorization', value: 'Bearer ' + sAuthToken})
      }
      let iAccountId = this.currentAccount ? this.currentAccount.AccountID : 0
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
          let oAttach = new CAttachment()
          oAttach.parseUploaderFile(oFile, true)
          this.attachments.push(oAttach)
        })
      }
    },
    onFileAdded (files) {
      if (typesUtils.isNonEmptyArray(files)) {
        _.each(files, (oFile) => {
          let oAttach = new CAttachment()
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
      let oResponse = typesUtils.isNonEmptyString(xhr.responseText) ? JSON.parse(xhr.responseText) : null
      if (oAttach) {
        if (oResponse && oResponse.Result && oResponse.Result.Attachment) {
          oAttach.parseDataFromServer(oResponse.Result.Attachment, this.$store.getters['main/getApiHost'])
          oAttach.onUploadComplete()
          if (oAttach.bLinked) {
            document.execCommand('insertHTML', true, '<img src="' + oAttach.sViewLink + '" data-x-src-cid="' + oAttach.sCid + '" />')
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
        let oResponse = typesUtils.isNonEmptyString(xhr.responseText) ? JSON.parse(xhr.responseText) : null
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
      this.save()
      this.closeCompose()
    },
  },
}
</script>
