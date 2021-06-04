<template>
  <div>
    <q-list style="width: 700px">
        <q-item class="q-ml-sm" tag="label">
          <q-item-section side top>
            <q-checkbox v-model="oAutoresponder.enableAutoresponder"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Enable autoresponder</q-item-label>
          </q-item-section>
        </q-item>
      <q-item tag="label" class="q-ml-md">
        <q-item-section class="q-mr-xl" style="text-align: center" side top>
          <span class="q-mt-sm q-mr-xs">Subject</span>
        </q-item-section>
        <q-item-section class="q-ml-xs" top>
          <q-input
            style="width: 100%"
            :disable="!oAutoresponder.enableAutoresponder"
            v-model="oAutoresponder.subject" outlined
            :dense=true bg-color="white"
          />
        </q-item-section>
      </q-item>
      <div class="q-ml-md q-mb-md q-mr-md" style="display: flex">
        <div class="q-ma-md">
          <span class="q-mr-xl">Message</span>
        </div>

      <q-editor v-model="oAutoresponder.message" ref="editor" style="width: 100%" class="full-height q-mt-md q-mb-md"
                bg-color="white"
                :toolbar="editorToolbar"
                :disable="!oAutoresponder.enableAutoresponder"
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
          <q-btn-dropdown
            flat
            dense
            size="sm"
            class="arrowless"
            icon="image"
            ref="insertImageDropdown"
            @hide="oImageToInsert=null"
          >
            <template v-slot:label>
              <q-tooltip>Insert Image</q-tooltip>
            </template>

            <q-card class="">
              <q-item-label header>Please select an image file to upload</q-item-label>
              <q-item>
                <q-file outline class="full-width" color="primary" label="Choose File"
                        v-model="oImageToInsert"
                        :multiple="false"
                        :accept="sAcceptedImageTypes"
                />
              </q-item>

              <q-item-label header>or enter an URL:</q-item-label>
              <q-item>
                <q-input outlined dense type="text" class="full-width" v-model="sExternalImageUrl" />
              </q-item>

              <q-card-actions align="right">
                <q-btn flat color="primary" label="Insert" @click="insertImageByUrl" />
                <q-btn flat color="grey-6" label="Cancel" @click="cancelInsertImage" />
              </q-card-actions>
            </q-card>
            <div>
            </div>
          </q-btn-dropdown>
        </template>
      </q-editor>
      </div>
    </q-list>
    <q-separator spaced/>
    <div class="q-pa-md">
      <q-btn class="q-ml-md" unelevated v-if="!bAutoresponderSaving" color="primary" label="Save"
             @click="updateAutoresponder"/>
      <q-btn class="q-ml-md" unelevated v-else  color="primary" label="Saving..."/>
    </div>
    <UnsavedChangesDialog ref="unsavedChangesDialog" />
  </div>
</template>

<script>
import {ipcRenderer} from "electron";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";
import UnsavedChangesDialog from "../../../UnsavedChangesDialog";
import mailSettings from "../../../../modules/mail/settings";

export default {
  name: "Autoresponder",
  components: {
    UnsavedChangesDialog
  },
  props: {
    autoresponder: {
      type: Object
    }
  },
  data() {
    return {
      oAutoresponder: {
        enableAutoresponder: false,
        subject: '',
        message: '',
        enableAutoresponderFromServer: false,
        subjectFromServer: '',
        messageFromServer: ''
      },
      bAutoresponderSaving: false,
      oImageToInsert: null,
      sAcceptedImageTypes: 'image/*',
      sExternalImageUrl: '',

    }
  },
  computed: {
    editorToolbar () {
      let aLastSection = this.bAllowInsertImage ? ['link', 'image', 'removeFormat'] : ['link', 'removeFormat']
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
  },
  watch: {
    oImageToInsert () {
      let oFile = this.oImageToInsert
      if (this.bAllowInsertImage && oFile && 0 === oFile.type.indexOf('image/')) {
        if (mailSettings.iImageUploadSizeLimit > 0 && oFile.size > mailSettings.iImageUploadSizeLimit) {
          notification.showError('The file cannot be uploaded as it\'s too big.')
        } else {
          let oReader = new window.FileReader()
          let sId = oFile.name + '_' + Math.random().toString()
          document.execCommand('insertHTML', true, '<img id="' + sId + '" />')

          oReader.onload = (oEvent) => {
            this.sSignature = this.sSignature.replace('id="' + sId + '"', 'src="' + oEvent.target.result + '"')
          }

          oReader.readAsDataURL(oFile)
        }
      }
    },
  },
  mounted() {
    this.fillAutoresponderData()
    this.iEditAccountId = Number(this.$route.params.accountId)
  },
  beforeRouteUpdate(to, from, next) {
    if (this.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },
  methods: {
    insertImageByUrl () {
      this.$refs.editor.focus()
      document.execCommand('insertHTML', true, '<img src="' + this.sExternalImageUrl + '" />')
    },
    cancelInsertImage () {
      this.$refs.insertImageDropdown.hide()
    },
    fillAutoresponderData() {
      this.oAutoresponder.enableAutoresponder = this.autoresponder.enableAutoresponder
      this.oAutoresponder.subject = this.autoresponder.subject
      this.oAutoresponder.message = this.autoresponder.message
      this.oAutoresponder.enableAutoresponderFromServer = this.autoresponder.enableAutoresponderFromServer
      this.oAutoresponder.subjectFromServer = this.autoresponder.subjectFromServer
      this.oAutoresponder.messageFromServer = this.autoresponder.messageFromServer
    },
    hasChanges () {
      return this.oAutoresponder.enableAutoresponderFromServer !== this.oAutoresponder.enableAutoresponder ||
      this.oAutoresponder.subjectFromServer !== this.oAutoresponder.subject ||
      this.oAutoresponder.messageFromServer !== this.oAutoresponder.message
    },
    updateAutoresponder() {
      this.bAutoresponderSaving = true
      let oParameters = {
        AccountID: this.iEditAccountId,
        Enable: this.oAutoresponder.enableAutoresponder,
        Subject: this.oAutoresponder.subject,
        Message: this.oAutoresponder.message
      }
      ipcRenderer.send('mail-update-autoresponder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        oParameters: oParameters
      })
      ipcRenderer.once('mail-update-autoresponder', (event, {bResult, oError}) => {
        this.bAutoresponderSaving = false
        if (bResult) {
          this.oAutoresponder.enableAutoresponderFromServer = this.oAutoresponder.enableAutoresponder
          this.oAutoresponder.subjectFromServer = this.oAutoresponder.subject
          this.oAutoresponder.messageFromServer = this.oAutoresponder.message
          notification.showReport('Autoresponder has been updated successfully.')
        } else {
          notification.showError(errors.getText(oError, 'Error setup forward email.'))
        }
      })
    },
    getAutoresponder() {
      if (this.iEditAccountId !== -1) {
        ipcRenderer.send('mail-get-autoresponder', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditAccountId
        })
      }
      ipcRenderer.once('mail-get-autoresponder', (event, {bResult, oError}) => {
        if (bResult) {
          this.oAutoresponder.enableAutoresponder = bResult.Enable
          this.oAutoresponder.subject = bResult.Subject
          this.oAutoresponder.message = bResult.Message
          this.oAutoresponder.enableAutoresponderFromServer = bResult.Enable
          this.oAutoresponder.subjectFromServer = bResult.Subject
          this.oAutoresponder.messageFromServer = bResult.Message
        } else {
          this.oAutoresponder.enableAutoresponder = false
          this.oAutoresponder.subject = ''
          this.oAutoresponder.message = ''
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
