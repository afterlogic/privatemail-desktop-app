<template>
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <div class="column bg-white" style="min-width: 800px; ">
        <div class="col-auto bg-grey-9 theme-text">
          <div class="row">
          </div>
        </div>
        <q-toolbar class=" bg-grey-9 theme-text">
          <q-btn  flat icon="send" label="Send" @click="send" :disable="!isEnableSending" />
          <q-btn  flat icon="save" label="Save" @click="save" />
          <q-space />
          <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <!-- <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip> -->
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
            <!-- <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip> -->
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <!-- <q-tooltip content-class="bg-white text-primary">Close</q-tooltip> -->
          </q-btn>
        </q-toolbar>
        <div class="col q-pa-md">
          <q-list>
            <q-item>
              <q-item-section side center style="min-width: 100px;">
                To
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="toAddr" :dense=true style="width: 100%;" />
              </q-item-section>
              <q-item-section style="max-width: 100px;">
                <a href="javascript:void(0)" v-show="!isCcShowed" @click="showCc">Show CC</a>
                <a href="javascript:void(0)" v-show="!isBccShowed" @click="showBcc">Show BCC</a>
              </q-item-section>
            </q-item>
            <q-item v-show="isCcShowed">
              <q-item-section side center style="min-width: 100px;">
                CC
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="ccAddr" :dense=true style="width: 100%;" />
              </q-item-section>
            </q-item>
            <q-item v-show="isBccShowed">
              <q-item-section side center style="min-width: 100px;">
                BCC
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="bccAddr" :dense=true style="width: 100%;" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section side center style="min-width: 100px;">
                Subject
              </q-item-section>
              <q-item-section>
                <q-input outlined v-model="subjectText" :dense=true style="width: 100%;" />
              </q-item-section>
            </q-item>
          </q-list>
          <!-- :definitions="{
              colors: {
                tip: 'Font & background colors',
                icon: 'text_format',
                handler: changeColors
              },
              image: {
                tip: 'Insert image',
                icon: 'image',
                handler: insertImage
              },
            }" -->
          <q-editor v-model="editortext" height="400px" class="col" 
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
          />
          <div>
            <q-uploader
              multiple
              auto-upload
              :factory="uploaderFactory"
              @added="onFileAdded"
              @uploaded="onFileUploaded"
              @failed="onFileUploadFailed"
              @removed="onFileRemoved"
            >
              <template v-slot:header="scope">
                <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
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
                  <q-btn type="a" icon="add_box" round dense flat>
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
              <template v-slot:list="scope">
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
          </div>
        </div>
      </div>
      <!-- <q-bar> -->
      <!-- </q-bar> -->
    </q-dialog>
</template>

<style></style>

<script>
import prefetcher from 'src/modules/mail/prefetcher.js'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi'

import CAttachment from 'src/modules/mail/classes/CAttachment.js'
import composeUtils from 'src/modules/mail/utils/compose.js'

export default {
  name: 'MailCompose',

  components: {
  },

  data () {
    return {
      dialog: false,
      maximizedToggle: true,

      sending: false, // indicates if sending is happening right now
      allAttachmentsUploaded: true, // indicates if all attachments are loaded from server (for forward or sending files from other modules)

      editortext: '',
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

  methods: {
    send () {
      if (this.isEnableSending) {
        composeUtils.sendMessage({
          oCurrentAccount: this.currentAccount,
          oCurrentFolderList: this.currentFolderList,
          sToAddr: this.toAddr,
          sCcAddr: this.ccAddr,
          sBccAddr: this.bccAddr,
          sSubject: this.subjectText,
          sText: this.editortext,
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
      composeUtils.saveMessage({
        oCurrentAccount: this.currentAccount,
        oCurrentFolderList: this.currentFolderList,
        sToAddr: this.toAddr,
        sCcAddr: this.ccAddr,
        sBccAddr: this.bccAddr,
        sSubject: this.subjectText,
        sText: this.editortext,
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
    },
    closeCompose () {
      this.dialog = false
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
      console.log('insertImage')
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
    onFileAdded (files) {
      if (typesUtils.isNonEmptyArray(files)) {
        _.each(files, (oFile) => {
          let oAttach = new CAttachment()
          oAttach.parseUploaderFile(oFile)
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
    onFileRemoved (files) {
      let oFile = typesUtils.isNonEmptyArray(files) ? files[0] : null
      this.attachments = _.filter(this.attachments, (oAttach) => {
        return oAttach.sLocalPath !== oFile.path
      })
    },
    removeAttachment (scope, oAttach) {
      if (oAttach.oFile) {
        scope.removeFile(oAttach.oFile)
      } else {
        this.attachments = _.filter(this.attachments, (oTmpAttach) => {
          return oTmpAttach.sHash !== oAttach.sHash
        })
      }
    },
  },
}
</script>
