<template>
  <q-item-section class="">
      <div class="head">
        <div class="head--labels">
          <q-item-label class="head--labels-name">Import Contacts</q-item-label>
        </div>
      </div>
    <div class="col">
      <div class="column full-height">

        <div class="frame-top" ></div>
        <div class="col">
            <div class="frame-without-top">
              <q-item-label class="info-line">Use Import to copy contacts from a CSV or VCF file into your contacts list.</q-item-label>
              <div class="buttons head">
<!--                <label>
                  <input style="display: none" type="file" id="importFile" ref="importFile" v-on:change="handleFileUpload()"/>
                </label>-->
                <q-btn no-wrap no-caps unelevated color="primary" @click="chooseFiles">{{importBtnValue}}</q-btn>
                <div class="attachments-uploader col column full-height full-width">
                <q-uploader
                  style="max-height: initial; display: none"
                  class="col full-height full-width"
                  flat
                  ref="uploader"
                  auto-upload
                  accept=".csv, .vcf"
                  hide-upload-btn
                  :factory="importContacts"
                  @added="onFileAdded"
                  @uploaded="showReport"
                >
                </q-uploader>
                </div>
              </div>
              <q-item-label class="info-line">
                <a target="_blank" href="https://afterlogic.com/docs/aurora-corporate-8/frequently-asked-questions/importing-contacts">
                  Learn more on .CSV file fields
                </a>
              </q-item-label>
            </div>

        </div>
      </div>
    </div>
  </q-item-section>
</template>

<script>
import {ipcRenderer} from "electron";
import typesUtils from "../../utils/types";
import cAttachment from "../../modules/mail/classes/cAttachment";
import notification from "../../utils/notification";

export default {
  name: "ContactImport",
  methods: {
    handleFileUpload(){
      this.importFile = this.$refs.importFile.files[0];
    },
    chooseFiles() {
      this.$refs.uploader.pickFiles()
    },
    importContacts() {
      this.importBtnValue = 'importing...'
      let url = this.$store.getters['main/getApiHost'] + '/?/Api/'
      let sAuthToken = this.$store.getters['user/getAuthToken']
      let headers = []
      if (sAuthToken) {
        headers.push({name: 'Authorization', value: 'Bearer ' + sAuthToken})
      }
      return {
        url,
        method: 'POST',
        headers,
        fieldName: 'jua-uploader',
        formFields: [
          { name: 'jua-post-type', value: 'ajax' },
          { name: 'Module', value: 'Contacts' },
          { name: 'Method', value: 'Import' },
          { name: 'Parameters', value: JSON.stringify({ "GroupUUID":"","Storage":"personal" }) },
        ],
      }

    },
    onFileAdded(file) {
      if (typesUtils.isNonEmptyArray(file)) {
        _.each(file, (oFile) => {
          let oAttach = new cAttachment()
          oAttach.parseUploaderFile(oFile, false)
          this.attachments.push(oAttach)
        })
      }
    },
    showReport(info) {
      let importedCount = JSON.parse(info.xhr.response)
      if (!importedCount.ErrorMessage) {
        notification.showReport(`You have imported ${importedCount.Result.ImportedCount} new contact into your contacts list.`)
      } else {
        notification.showError('Error uploading file')
      }
      this.importBtnValue = 'Import'
    }
  },
  data(){
    return {
      attachments: [],
      importBtnValue: 'Import'
    }
  },
  watch: {
    importFile: function () {
      console.log(this.importFile)
      this.importContacts()
    }
  }
}
</script>

<style scoped>
.head--labels-name {
  font-size: 18pt;
  font-weight: normal;
  white-space: normal;
  color: #555566;
}
.head {
  padding: 15px 20px;
}
.frame-without-top {
  border: 1px solid #ccc;
  border-radius: 5px 5px 5px 5px;
  min-height: 100px;
  margin: 0 20px;
  padding: 8px 0 12px;
}
.info-line {
  margin: 10px 0 10px 20px;
  font-size: 9pt;
}
</style>
