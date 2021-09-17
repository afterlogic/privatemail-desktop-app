<template>
  <q-card
    flat
    class="q-mx-sm q-mb-md select-text-disable"
    align="center"
    style="width: 150px; height: 175px;"
    :class="{ 'loading': file.Loading }"
  >
  <div class="file-focus file" v-if="!file.IsFolder || file.getStats() === 'Uploaded'"
       @click="function (oMouseEvent) { selectFile(file, oMouseEvent) }"
       :draggable="true"
       @dragstart="onDragStart($event, file)"
       @dragend="dragend()"
       @dblclick="openFile()"
  >
    <div
      class="file-card"
      style="height: 150px; border-radius: 3px"
      :class="{ 'file-selected': isChecked(file) }"
    >
                <span class="display-none tooltip" style="line-height: 1.2"
                      :class="{ 'display-block': isChecked(file), 'tooltip-checked': isChecked(file) }">
                  {{ file.getDescription(currentAccount) }}
                </span>
      <div class="image q-px-sm" style="padding-top: 28px; height: 113px;" v-if="!getPreviewFile()">
        <div class="img-block">
          <span class="icon" :class="formatFile(file)"></span>
        </div>
      </div>
      <div class="image  q-pt-sm" v-if="getPreviewFile()">
        <div class="img-preview"
             :style="{'background': `url(${getPreviewFile()}) no-repeat center`, 'background-size': 'contain'}"/>
      </div>
      <div class="flex q-mt-sm q-ml-sm" style="position: absolute; top: 90px; width: 100%;">
        <div class="q-mr-xs q-mb-xs file-icon" v-if="file.isShared()" @click="openShareDialog(file)">
          <share-icon style="fill: white !important;" :width="20" :height="20"/>
        </div>
        <div class="q-mr-xs q-mb-xs file-icon" v-if="file.hasLink()" @click="openLinkDialog(file)">
          <link-icon style="fill: white !important;" :width="20" :height="20"/>
        </div>
        <div class="q-mr-xs q-mb-xs file-icon__encrypt" v-if="file.isEncrypted()"
             @click="openEncryptedFileDialog(file)">
          <encrypted-icon style="fill: white !important;" :width="20" :height="20"></encrypted-icon>
        </div>
      </div>
      <div class="flex q-mt-sm q-mx-sm"
           style="justify-content: space-between; font-size: 9pt; border-top: 1px solid #dedede;"
      >
        <div class="q-mt-xs">
          <span v-if="hasViewAction() && isImg(file) && file.isEncrypted() && !hasImportAction() && !file.Loading && !file.Downloading" class="q-mr-md text-primary"
                @click="viewEncryptedFile(file)">View</span>
          <span v-else-if="hasViewAction() && !file.isEncrypted() && !hasImportAction() && !file.EditUrl && !file.Loading && !file.Downloading" class="q-mr-md text-primary"
                @click="viewFile(file)">View</span>
          <span v-else-if="hasViewAction() && !file.isEncrypted() && !hasImportAction() && file.EditUrl && !file.Loading && !file.Downloading" class="q-mr-md text-primary"
                @click="editFile(file)">Edit</span>
          <span v-else-if="isArchive() && !file.Loading && !file.Downloading" class="q-mr-md text-primary"
                @click="openArchive">View</span>
          <span v-if="file.hasOpenAction() && !file.isEncrypted() && !hasImportAction() && !file.Loading && !file.Downloading" class="q-mr-md text-primary"
                @click="viewFile(file)">Open</span>
          <span v-if="hasImportAction() && progressPercent === 0 && !file.Downloading" class="q-mr-md text-primary"
                @click="importKeys()">Import</span>
        </div>
        <div class="q-mt-xs">
                    <span
                      v-if="file.hasDownloadAction() && !file.Downloading" class="text-primary"
                      @click="file.isEncrypted() ? downloadEncryptedFile(file) : downloadFile(file)"
                    >
                      Download
                    </span>
        </div>
      </div>
      <div v-if="file.Loading" class="flex" style="flex-direction: column">
        <div class="flex q-px-sm" style="width: 100%">
          <div class="progress-bar-line" style="background: #ef4a4a;" :style="{width: `${progressPercent}%`}" ></div>
        </div>
        <div style="font-size: 12px">
          <span v-if="progressPercent !== 100"
          >{{ progressPercent }}%</span>
          <span v-if="progressPercent === 100" style="color: rgb(76, 175, 80);"
          >complete</span>
        </div>
      </div>
      <div v-if="file.Downloading" class="flex" style="flex-direction: column">
        <div class="flex q-px-sm" style="width: 100%">
          <div class="progress-bar-line" style="background: #6bb856;" :style="{width: `${file.PercentDownloading}%`}" ></div>
        </div>
        <div style="font-size: 12px">
          <span v-if="file.PercentDownloading !== 100"
          >{{ file.PercentDownloading }}%</span>
          <span v-if="file.PercentDownloading === 100" style="color: rgb(76, 175, 80);"
          >complete</span>
        </div>
      </div>
      <import-keys-dialog ref="importKeysDialog"></import-keys-dialog>
    </div>
    <div class="flex q-mt-xs" style="justify-content: space-between;font-size: 10pt;">
      <div class="q-ml-sm">
        <b>{{ getShortName(file.Name) }}</b>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          {{ file.Name }}
        </q-tooltip>
      </div>
      <div class="q-mr-sm" style="align-items: center">
        <span>{{ file.getFileSize() }}</span>
      </div>
    </div>
  </div>
  </q-card>
</template>

<script>
import ShareIcon from '../../../assets/icons/ShareIcon'
import LinkIcon from '../../../assets/icons/LinkIcon'
import EncryptedIcon from '../../../assets/icons/EncryptedIcon'
import ImportKeysDialog from '../open-pgp/ImportKeysDialog'

import date from '../../../utils/date'
import _ from 'lodash'
import webApi from '../../../utils/webApi'
import Crypto from '../../../modules/crypto/CCrypto'
import OpenPgp from '../../../modules/openpgp/OpenPgp'
import notification from '../../../utils/notification'


export default {
  name: 'FileItem',
  props: {
    file: Object,
    selectFile: Function,
    onDragStart: Function,
    dragend: Function,
    isChecked: Function,
    openLinkDialog: Function,
    openEncryptedFileDialog: Function,
    openShareDialog: Function,
    downloadFile: Function
  },
  data() {
    return {
      fileFormats: ['svg', 'txt', 'jpg', 'png', 'docx', 'pdf', 'JPG', 'jpeg', 'doc'],
      imgFormats: ['jpeg', 'png', 'jpg', 'JPG', 'jpeg'],
      progressPercent: 0
    }
  },
  components: {
    ShareIcon,
    LinkIcon,
    EncryptedIcon,
    ImportKeysDialog
  },
  computed: {
    currentAccount () {
      return  this.$store.getters['mail/getCurrentAccountEmail']
    }
  },
  mounted () {
    setTimeout( () => {
      this.getProgressPercent()
    }, 0)
  },
  methods: {
    openFile () {
      if (this.hasViewAction() && this.isImg() && this.file.isEncrypted() && !this.hasImportAction()) {
        this.viewEncryptedFile()
      } else if (this.hasViewAction() && !this.file.isEncrypted() && !this.hasImportAction() && !this.file.EditUrl) {
        this.viewFile()
      } else if (this.hasViewAction() && !this.file.isEncrypted() && !this.hasImportAction() && this.file.EditUrl) {
        this.editFile()
      } else if (this.file.isArchive() && !this.file.Loading) {
        this.openArchive()
      } else if (this.file.hasOpenAction() && !this.file.isEncrypted() && !this.hasImportAction()) {
        this.viewFile()
      } else if (this.hasImportAction() && this.progressPercent === 0) {
        this.importKeys()
      } else if (this.file.isArchive()) {
        this.openArchive()
      }
    },
    openArchive () {
      this.$emit('openFolder')
    },
    isArchive () {
      const formatFile = this.formatFile(this.file)
      return formatFile === 'zip'
    },
    importKeys () {
      this.$refs.importKeysDialog.openDialog(this.file.Content)
    },
    getProgressPercent () {
      if (this.file) {
        if (this.file.File?.__status) {
          this.progressPercent = Math.ceil(this.file.File.__progress * 100) || 0
          setTimeout(() => {
            if (this.progressPercent !== 100) {
              this.getProgressPercent()
            }
          }, 100)
        }
      }
    },
    isImg () {
      const formatFile = this.formatFile(this.file)
      return this.imgFormats.find( format => {
        return format === formatFile
      })
    },
    getDescription (file) {
      return 'Added by ' + file.Owner + ' on ' + date.getShortDate(file.LastModified)
    },
    hasDownloadAction (file) {
      if (file) {
        return file?.Actions?.download
      }
      return false
    },
    getShortName (name) {
      if (name.length > 10) {
        return name.substr(0, 8) + '...'
      }
      return name
    },
    formatFile (file) {
      let fileName = file.Name
      return fileName.split('.')[fileName.split('.').length - 1]
    },
    isShared (file) {
      const shares = file?.ExtendedProps?.Shares
      return _.isArray(shares) && shares.length
    },
    isEncrypted (file) {
      return file?.ExtendedProps?.ParanoidKey ? true : false
    },
    hasLink (file) {
      return file?.ExtendedProps?.PublicLink
    },
    hasViewAction () {
      if (this.file?.File?.__status) {
        return false
      }
      const formatFile = this.formatFile(this.file)
      return this.fileFormats.find( format => {
        return format === formatFile
      })
    },
    hasImportAction () {
      return this.formatFile(this.file) === 'asc'
    },
    async viewEncryptedFile () {
      let iv = this.file.InitializationVector || false
      let paranoidEncryptedKey = this.file.ParanoidKey || false
      const aesKey = await this.getAesKey(this.file)
      Crypto.viewEncryptedImage(this.file, iv, paranoidEncryptedKey, aesKey)
    },
    async downloadEncryptedFile (file) {
      let iv = file.InitializationVector || false
      let paranoidEncryptedKey = file.ParanoidKey || false
      const aesKey = await this.getAesKey(file)
      Crypto.downloadDividedFile(file, iv, null, null, paranoidEncryptedKey, aesKey)
    },
    async getAesKey (file) {
      const currentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']
      const privateKey = OpenPgp.getPrivateKeyByEmail(currentAccountEmail)
      let oPublicFromKey = OpenPgp.getPublicKeyByEmail(currentAccountEmail)
      let aPublicKeys = oPublicFromKey ? [oPublicFromKey] : []
      if (privateKey) {
        let paranoidKey = ''
        if (this.$store.getters['files/getCurrentStorage'].Type === 'shared') {
          paranoidKey = file.File?.ExtendedProps?.ParanoidKeyShared
        } else {
          paranoidKey = file.ParanoidKey
        }
        const decryptData = await OpenPgp.decryptAndVerifyText(paranoidKey, privateKey, aPublicKeys, this.askOpenPgpKeyPassword)
        if (decryptData?.sError) {
          notification.showError(decryptData.sError)
          return false
        }
        return decryptData.sDecryptedData
      } else {
        notification.showError('No private key found for file decryption.')
      }
    },
    viewFile () {
      const url = this.file.ViewUrl
      webApi.viewByUrlInNewWindow(url, this.file.Name)
    },
    editFile () {
      const url = this.file.EditUrl
      webApi.viewByUrlInNewWindow(url, this.file.Name)
    },
    getPreviewFile () {
      if (!this.file.isEncrypted() && this.isImg(this.file)) {
        if (this.file.DownloadUrl) {
          let api = this.$store.getters['main/getApiHost']
          let link = this.file.DownloadUrl
          return api + '/' + link
        }
      }
      return null
    },
  }
}
</script>

<style scoped>
.loading {
  opacity: 0.5;
}
.progress-bar-line {
  overflow:hidden;
  width: 0;
  height: 3px;
  border-radius: 100px;
}
.progress-bar-prompt {
  text-align: center;
  font-size: 12px
}
</style>
