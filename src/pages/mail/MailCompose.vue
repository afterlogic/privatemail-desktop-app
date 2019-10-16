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
          <q-editor v-model="editortext" height="400px" class="col" :definitions="{
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
            }"
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
        </div>
      </div>
      <!-- <q-bar> -->
      <!-- </q-bar> -->
    </q-dialog>
</template>

<style></style>

<script>
import composeUtils from 'src/modules/mail/utils/compose.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

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

      draftUid: '',

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
          sDraftUid: this.draftUid,
        }, (oResult, oError) => {
          if (oResult) {
            // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SENT'))
            notification.showReport('Your message has been sent.')
            this.closeCompose()
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
        sDraftUid: this.draftUid,
      }, (oResult, oError, oParameters) => {
        if (oResult) {
          // notification.showReport(textUtils.i18n('%MODULENAME%/REPORT_MESSAGE_SAVED'))
          notification.showReport('Your message has been saved.')
          if (oParameters && oParameters.DraftUid === this.draftUid) {
            this.draftUid = typesUtils.pString(oResult.NewUid)
          }
        } else {
          notification.showError(errors.getText(oError, 'Error occurred while saving message'))
        }
      })
    },
    openCompose () {
      this.editortext = ''
      this.toAddr = ''
      this.ccAddr = ''
      this.bccAddr = ''
      this.subjectText = ''
      this.draftUid = ''
      this.isCcShowed = false
      this.isBccShowed = false
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
  },
}
</script>
