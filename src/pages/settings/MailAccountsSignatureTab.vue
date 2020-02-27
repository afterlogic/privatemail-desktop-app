<template>
  <div>
    <q-item tag="label">
      <q-item-section side top>
        <q-checkbox v-model="bNoSignature" />
      </q-item-section>
      <q-item-section>
        <q-item-label>No signature</q-item-label>
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-editor v-model="sSignature" ref="editor" height="200px" class="full-height"
          :disable="bDisableEditor"
          :toolbar="editorToolbar"
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
      </q-item-section>
    </q-item>
    <q-separator spaced />
    <div class="q-pa-md">
      <q-btn unelevated color="primary" v-if="isSaving" label="Saving..." />
      <q-btn unelevated color="primary" v-if="!isSaving" label="Save" @click="saveSettings" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

import mailSettings from 'src/modules/mail/settings.js'

export default {
  name: 'MailAccountsSignatureTab',

  props: {
    noSignature: {
      type: Boolean,
      default: false,
    },
    signature: {
      type: String,
      default: '',
    },
    isSaving: {
      type: Boolean,
      default: false,
    },
    saveSignature: Function,
  },

  data () {
    return {
      bAllowInsertImage: false,
      bNoSignature: false,
      sSignature: '',
      bDisableEditor: false,
      sAcceptedImageTypes: 'image/*',
      sExternalImageUrl: '',
      oImageToInsert: null,
    }
  },

  computed: {
    editorToolbar () {
      if (this.bDisableEditor) {
        return []
      }
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
    noSignature () {
      this.bNoSignature = this.noSignature
    },
    signature () {
      this.sSignature = this.signature
    },
    bNoSignature () {
      this.bDisableEditor = this.bNoSignature
    },
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

  mounted () {
    this.bAllowInsertImage = mailSettings.bAllowInsertImage
    this.bNoSignature = this.noSignature
    this.sSignature = this.signature
  },

  methods: {
    saveSettings () {
      this.saveSignature(this.bNoSignature, this.sSignature)
    },
    insertImageByUrl () {
      this.$refs.editor.focus()
      document.execCommand('insertHTML', true, '<img src="' + this.sExternalImageUrl + '" />')
    },
    cancelInsertImage () {
      this.$refs.insertImageDropdown.hide()
    },
  },
}
</script>
