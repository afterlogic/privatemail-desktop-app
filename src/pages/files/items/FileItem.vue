<template>
  <q-card
    flat
    class="q-mx-sm q-mb-md select-text-disable"
    align="center"
    style="width: 150px; height: 175px;"
  >
  <div class="file-focus file" v-if="!file.IsFolder || file.__status === 'uploaded'"
       @click="function (oMouseEvent) { selectFile(file, oMouseEvent) }"
       :draggable="true"
       @dragstart="onDragStart($event, file)"
       @dragend="dragend()"
  >
    <div
      class="file-card"
      style="height: 150px; border-radius: 3px"
      :class="{
                 'file-selected': isChecked(file)
                 }"
    >
                <span class="display-none tooltip" style="line-height: 1.2"
                      :class="{ 'display-block': isChecked(file), 'tooltip-checked': isChecked(file) }">
                  {{ getDescription(file) }}
                </span>
      <div class="image q-px-sm" style="padding-top: 28px; height: 113px;" v-if="!getPreviewFile(file)">
        <div class="img-block">
          <span class="icon" :class="formatFile(file)"></span>
        </div>
      </div>
      <div class="image  q-pt-sm" v-if="getPreviewFile(file)">
        <div class="img-preview"
             :style="{'background': `url(${getPreviewFile(file)}) no-repeat center`, 'background-size': 'contain'}"/>
      </div>
      <div class="flex q-mt-sm q-ml-sm" style="position: absolute; top: 90px; width: 100%;">
        <div class="q-mr-xs q-mb-xs file-icon" v-if="isShared(file)" @click="openShareDialog(file)">
          <share-icon style="fill: white !important;" :width="20" :height="20"/>
        </div>
        <div class="q-mr-xs q-mb-xs file-icon" v-if="hasLink(file)" @click="openLinkDialog(file)">
          <link-icon style="fill: white !important;" :width="20" :height="20"/>
        </div>
        <div class="q-mr-xs q-mb-xs file-icon__encrypt" v-if="isEncrypted(file)"
             @click="openEncryptedFileDialog(file)">
          <encrypted-icon style="fill: white !important;" :width="20" :height="20"></encrypted-icon>
        </div>
      </div>
      <div class="flex q-mt-sm q-mx-sm"
           style="justify-content: space-between; font-size: 9pt; border-top: 1px solid #dedede;">
        <div class="q-mt-xs">
          <span v-if="hasViewAction(file) && isImg(file) && isEncrypted(file)" class="q-mr-md text-primary"
                @click="viewEncryptedFile(file)">View</span>
          <span v-else-if="hasViewAction(file) && !isEncrypted(file)" class="q-mr-md text-primary"
                @click="viewFile(file)">View</span>
          <span v-if="hasOpenAction(file) && !isEncrypted(file)" class="q-mr-md text-primary"
                @click="viewFile(file)">Open</span>
        </div>
        <div class="q-mt-xs">
                    <span
                      v-if="hasDownloadAction(file)" class="text-primary"
                      @click="isEncrypted(file) ? downloadEncryptedFile(file) : downloadFile(file)"
                    >
                      Download
                    </span>
        </div>
      </div>
    </div>
    <div class="flex q-mt-xs" style="justify-content: space-between;font-size: 10pt;">
      <div class="q-ml-sm">
        <b>{{ getShortName(file.Name || file.name) }}</b>
        <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          {{ file.Name || file.name }}
        </q-tooltip>
      </div>
      <div class="q-mr-sm" style="align-items: center">
        <span>{{ getFileSize(file) }}</span>
      </div>
    </div>
  </div>
  </q-card>
</template>

<script>
import ShareIcon from '../../../assets/icons/ShareIcon'
import LinkIcon from '../../../assets/icons/LinkIcon'
import EncryptedIcon from '../../../assets/icons/EncryptedIcon'
import date from '../../../utils/date'
import text from '../../../utils/text'
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
    }
  },
  components: {
    ShareIcon,
    LinkIcon,
    EncryptedIcon,
  },
  methods: {
    isImg (file) {
      const formatFile = this.formatFile(file)
      return this.imgFormats.find( format => {
        return format === formatFile
      })
    },
    getDescription (file) {
      return 'Added by ' + file.Owner + ' on ' + date.getShortDate(file.LastModified || file.lastModified)
    },
    hasDownloadAction (file) {
      if (file) {
        return file?.Actions?.download
      }
      return false
    },
    getShortName (name) {
      if (name.length > 12) {
        return name.substr(0, 10) + '...'
      }
      return name
    },
    getFileSize (file) {
      return text.getFriendlySize(file.Size || file.size)
    },
    formatFile (file) {
      let fileName = file.Name || file.name
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
    hasViewAction (file) {
      const formatFile = this.formatFile(file)
      return this.fileFormats.find( format => {
        return format === formatFile
      })
    },
    hasOpenAction (file) {
      if (file) {
        return file?.Actions?.open
      }
      return false
    },
    async viewEncryptedFile (file) {
      let iv = file?.ExtendedProps?.InitializationVector || false
      let paranoidEncryptedKey = file?.ExtendedProps?.ParanoidKey || false
      const aesKey = await this.getAesKey(file)
      Crypto.viewEncryptedImage(file, iv, paranoidEncryptedKey, aesKey)
    },
    async downloadEncryptedFile (file) {
      let iv = file?.ExtendedProps?.InitializationVector || false
      let paranoidEncryptedKey = file?.ExtendedProps?.ParanoidKey || false
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
          paranoidKey = file?.ExtendedProps?.ParanoidKeyShared
        } else {
          paranoidKey = file?.ExtendedProps?.ParanoidKey
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
    viewFile (file) {
      const url = file.Actions?.view?.url
      webApi.viewByUrlInNewWindow(url, file.Name || file.name)
    },
    getPreviewFile (file) {
      if (!this.isEncrypted(file) && this.isImg(file)) {
        if (file?.Actions?.view?.url) {
          let api = this.$store.getters['main/getApiHost']
          let link = file.Actions?.view?.url
          return api + '/' + link
        }
      }
      return null
    },
  }
}
</script>

<style scoped>

</style>
