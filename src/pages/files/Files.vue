<template>
  <div class="col panel-rounded" style="box-sizing: border-box;">
      <q-scroll-area class="full-height">
        <div class="pannel-hint non-selectable full-width" style="width: 100%" v-if="isUploadingFiles">
          Loading...
        </div>
        <div class="pannel-hint non-selectable full-width" style="width: 100%"
             v-else-if="!isUploadingFiles && !filesList.length && !searchInProgress && currentStorage.Type !== 'shared' && !isFolder"
        >
          You can drag-n-drop files from other folders or from your desktop, or click New Folder to create a folder
        </div>
        <div class="pannel-hint non-selectable full-width" style="width: 100%"
             v-else-if="!isUploadingFiles && !filesList.length && !searchInProgress && currentStorage.Type !== 'shared' && isFolder"
        >
          Folder is empty
        </div>
        <div class="pannel-hint non-selectable full-width" style="width: 100%" v-else-if="!isUploadingFiles && !filesList.length && searchInProgress">
          Nothing found
        </div>
        <div class="pannel-hint non-selectable full-width" style="width: 100%"
             v-else-if="!filesList.length && currentStorage.Type === 'shared' && !searchInProgress"
        >
          No shared files
        </div>
        <div class="row q-pa-sm large" v-if="!isUploadingFiles">
          <q-card
            flat
            class="q-mx-sm q-mb-md select-text-disable"
            v-for="file in filesList" :key="file.Hash" style="width: 150px; height: 175px;" align="center"
          >
            <div class="file-focus file" v-if="!file.IsFolder" @click="function (oMouseEvent) { selectedFile(file, oMouseEvent) }">
              <div
                class="file-card"
                style="height: 150px; border-radius: 3px"
                :class="{
                 'file-selected': isChecked(file)
                 }"
              >
                <span class="display-none tooltip" style="line-height: 1.2" :class="{ 'display-block': isChecked(file), 'tooltip-checked': isChecked(file) }">
                  {{ getDescription(file) }}
                </span>
                <div class="image q-px-sm" style="padding-top: 28px; height: 113px;" v-if="!getPreviewFile(file)">
                  <div class="img-block">
                    <span class="icon" :class="formatFile(file)"></span>
                  </div>
                </div>
                <div class="image  q-pt-sm" v-if="getPreviewFile(file)">
                  <div class="img-preview" :style="{'background': `url(${getPreviewFile(file)}) no-repeat center`, 'background-size': 'contain'}" />
                </div>
                <div class="flex q-mt-sm q-ml-sm" style="position: absolute; top: 90px; width: 100%;">
                  <div class="q-mr-xs q-mb-xs file-icon" v-if="isShared(file)" @click="openShareDialog(file)">
                      <share-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div class="q-mr-xs q-mb-xs file-icon" v-if="hasLink(file)" @click="openLinkDialog(file)">
                      <link-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div class="q-mr-xs q-mb-xs file-icon__encrypt" v-if="isEncrypted(file)" @click="openEncryptedFileDialog(file)">
                    <encrypted-icon style="fill: white !important;" :width="20" :height="20"></encrypted-icon>
                  </div>
                </div>
                <div class="flex q-mt-sm q-mx-sm" style="justify-content: space-between; font-size: 9pt; border-top: 1px solid #dedede;">
                  <div class="q-mt-xs">
                    <span v-if="hasProgress(file)"  class="q-mr-md text-primary">{{ getProgress(file) }}</span>
                    <span v-if="hasViewAction(file) && isImg(file) && isEncrypted(file)" class="q-mr-md text-primary" @click="viewEncryptedFile(file)">View</span>
                    <span v-else-if="hasViewAction(file) && !isEncrypted(file)" class="q-mr-md text-primary" @click="viewFile(file)">View</span>
                    <span v-if="hasOpenAction(file) && !isEncrypted(file)" class="q-mr-md text-primary" @click="viewFile(file)">Open</span>
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
                  <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">{{file.Name || file.name}}</q-tooltip>
                </div>
                <div class="q-mr-sm" style="align-items: center">
                  <span>{{ getFileSize(file) }}</span>
                </div>
              </div>
            </div>
            <div
              class="file-focus folder"
              v-if="file.IsFolder" @click="function (oMouseEvent) { selectedFile(file, oMouseEvent) }"
              @dblclick="openFolder(file)"
            >
              <div class="file-focus__border" style="height: 150px; position:relative" :class="{
                'folder-selected': isChecked(file) && file.IsFolder
               }">
                <div class="image q-px-sm" style="padding-top: 28px">
                  <div class="img-block">
                    <span class="icon"></span>
                  </div>
                </div>
                <div class="flex q-pr-xs" style="position: absolute; top: 67px; width: 100%; padding-left: 33px">
                  <div class="q-mr-xs q-mb-xs file-icon" v-if="isShared(file)" @click="openShareDialog(file)">
                    <share-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div class="q-mr-xs q-mb-xs file-icon" v-if="hasLink(file)" @click="openLinkDialog(file)">
                    <link-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div v-if="!hasLink(file) && !isShared(file)" style="height: 26px"></div>
                </div>
                <q-card-section tag="span" style="padding: 0; font-size: 10pt;">
                  <div>
                    {{ getShortName(file.Name || file.name) }}
                  </div>
                </q-card-section>
              </div>
            </div>
          </q-card>
        </div>
      </q-scroll-area>
    <encrypted-file-information-dialog ref="encryptedFileInformationDialog" @downloadEncrypted="downloadFile"></encrypted-file-information-dialog>
  </div>
</template>

<script>
import webApi from 'src/utils/webApi'
import ShareIcon from '../../assets/icons/ShareIcon'
import LinkIcon from '../../assets/icons/LinkIcon'
import EncryptedIcon from '../../assets/icons/EncryptedIcon'
import date from '../../utils/date'
import _ from 'lodash'
import text from '../../utils/text'
import EncryptedFileInformationDialog from './EncryptedFileInformationDialog'
import Crypto from 'src/modules/crypto/CCrypto'
import OpenPgp from 'src/modules/openpgp/OpenPgp'
import notification from '../../utils/notification'

export default {
  name: 'Files',
  components: {
    ShareIcon,
    LinkIcon,
    EncryptedIcon,
    EncryptedFileInformationDialog,
  },
  props: {
    currentStorage: Object,
    downloadFiles: Array
  },
  data() {
    return {
      currentFile: null,
      checkedList: [],
      fileFormats: ['svg', 'txt', 'jpg', 'png', 'docx', 'pdf', 'JPG', 'jpeg', 'doc'],
      imgFormats: ['jpeg', 'png', 'jpg', 'JPG', 'jpeg'],
    }
  },
  computed: {
    filesList () {
      let folders = []
      let files = []
      let currentFiles = this.$store.getters['files/getCurrentFiles']
      if (this.downloadFiles.length) {
        currentFiles = currentFiles.concat(this.downloadFiles)
      }
      currentFiles.map( file => {
        if (file.IsFolder) {
          folders.push(file)
        } else {
          files.push(file)
        }
      })
      return folders.concat(files)
    },
    searchInProgress () {
      const currentPattern = this.$store.getters['files/getCurrentPattern']
      return !!currentPattern
    },
    isUploadingFiles () {
      return this.$store.getters['files/getLoadingStatus']
    },
    isFolder () {
      const currentPath = this.$store.getters['files/getCurrentPath']
      return !!currentPath
    }
  },
  watch: {
    $route () {
      this.currentFile = null
    },
    isUploadingFiles (loading) {
      if (loading) {
        this.checkedList = []
      }
    }
  },
  methods: {
    hasProgress (file) {
      return !!file?.__progressLabel
    },
    getProgress (file) {
      return file.__progressLabel
    },
    getUploadFile (file) {
      console.log(file?.File ? file.File : { '__progress': 'heh' }, 'file?.File ? file.File : { \'__progress\': \'heh\' }')
      return file?.File ? file.File : { '__progressLabel': 'heh' }
    },
    isImg (file) {
      const formatFile = this.formatFile(file)
      return this.imgFormats.find( format => {
        return format === formatFile
      })
    },
    getDescription (file) {
      return 'Added by ' + file.Owner + ' on ' + date.getShortDate(file.LastModified || file.lastModified)
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
    openShareDialog (file) {
      this.$emit('shareFiles', file)
    },
    openLinkDialog (file) {
      this.$emit('linkDialog', file)
    },
    openEncryptedFileDialog (file) {
      this.$refs.encryptedFileInformationDialog.openDialog(file)
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
    downloadFile (file = null) {
      let url = ''
      if (file) {
        url = file?.Actions.download.url
      } else {
        url = this.currentFile.Actions.download.url
      }
      webApi.downloadByUrl(url)
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
      const url = file.Actions.view.url
      webApi.viewByUrlInNewWindow(url, file.Name || file.name)
    },
    getPreviewFile (file) {
      if (!this.isEncrypted(file) && this.isImg(file)) {
        if (file?.Actions.view.url) {
          let api = this.$store.getters['main/getApiHost']
          let link = file.Actions.view.url
          return api + '/' + link
        }
      }
      return null
    },
    selectedFile (file, oMouseEvent) {
      console.log(file, 'file')
      let checkedList = _.map(this.checkedList, function (file) {
        return file
      })
       if (oMouseEvent) {
        if (oMouseEvent.ctrlKey) {
          const index = checkedList.findIndex( checkedFile => {
            return checkedFile === file
          })
          if (index === -1) {
            checkedList = _.union(checkedList, [file])
          } else {
            checkedList = _.without(checkedList, file)
          }
        } else if (oMouseEvent.shiftKey) {
          let files = _.map(this.filesList, function (file) {
            return file
          })
          let iLastCheckedIndex = files.indexOf(this.currentFile)
          let iCurrCheckedIndex = files.indexOf(file)
          if (iLastCheckedIndex !== -1 && iCurrCheckedIndex !== -1) {
            const index = checkedList.findIndex( checkedFile => {
              return checkedFile === file
            })
            if (index === -1) {
              let iStartIndex = Math.min(iLastCheckedIndex, iCurrCheckedIndex)
              let iEndIndex = Math.max(iLastCheckedIndex, iCurrCheckedIndex)
              let aUidsToCheck = files.slice(iStartIndex, iEndIndex + 1)
              if (aUidsToCheck.length > 0) {
                checkedList = _.union(checkedList, aUidsToCheck)
              }
            } else {
              if (index > iLastCheckedIndex) {
                checkedList.splice(index + 1)
              } else {
                checkedList.splice(0, index)
              }
            }
          }
        } else {
          checkedList = [file]
          this.currentFile = file
        }
       }
       if (checkedList.length === 1) {
         this.$store.dispatch('files/changeCurrentFile', { currentFile: file })
       }
      this.checkedList = checkedList
      this.$store.dispatch('files/changeCheckedItems', { checkedItems: this.checkedList })
    },
    hasDownloadAction (file) {
      if (file) {
        return file?.Actions?.download
      }
      return false
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
    openFolder(file) {
      this.$emit('openFolder', true)
      const path = {
        path: file.FullPath,
        name: file.Name
      }
      this.$store.dispatch('files/changeCurrentPaths', { path })
      this.$store.dispatch('files/getFiles', { currentStorage: this.currentStorage.Type, path: file.FullPath, isFolder: true })
    },
    isChecked(file) {
      return this.checkedList.find(checkedFile => checkedFile.Hash === file.Hash)
    }
  }
}
</script>

<style scoped lang="scss">

.select-text-disable {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.img-preview img {
  max-height: 105px;
}
.img-preview {
  display: block;
  height: 105px;
  max-width: 130px;
}
.img-block {
  height: 74px;
}
.file-icon {
  height: 20px;
  border-radius: 5px;
  background: #64aedc;
}
.file-icon__encrypt {
  height: 20px;
  border-radius: 5px;
  background: #555;
}
.tooltip {
  position: absolute;
  left: 0;
  background-color:rgba(255,255,255, 0.8);
  font-size: 12px;
  margin: 0 1px;
  border-radius: 4px
}
.tooltip-checked {
  background-color: rgba(235, 247, 203, 0.8);
}
.display-none {
  display: none;
}
.display-block {
  display: block;
}
.file-card:hover  .display-none {
  display: block;
}
.file-focus:hover {
  cursor: pointer;
}
.file-card {
  box-shadow: 0 2px 6px #ccc;
}
.file-focus__border:hover {
  border: 1px solid #c9c9c9;
}
.file-focus__border {
  border: 1px solid white;
  border-radius: 4px;
}
.file-selected {
  border-radius: 4px;
  background-color: rgba(235, 247, 203, 1);
}
.folder-selected {
  border-radius: 4px;
  background-color: rgba(235, 247, 203, 1);
  border: 1px solid #c9c9c9;
}
.file .icon {
  background-image: url('../../assets/sprites.png');
  background-repeat: no-repeat;
  background-position: 0px -360px;
  display: inline-block;
  height: 32px;
  width: 32px;
}

.folder .icon {
  background-image: url('../../assets/sprites.png');
  background-repeat: no-repeat;
  background-position: 0px -360px;
  display: inline-block;
  height: 32px;
  width: 32px;
}
.large .file .icon {
  background-position: 0px -400px;
  height: 64px;
  width: 64px;
}
.large .file .icon.xls,
.large .file .icon.xlsx {
  background-position: -160px -400px;
}
.large .file .icon.pdf {
  background-position: -400px -400px;
}
.large .file .icon.htm,
.large .file .icon.html {
  background-position: -720px -400px;
}
.large .file .icon.doc,
.large .file .icon.docx {
  background-position: -80px -400px;
}
.large .file .icon.rtf,
.large .file .icon.txt {
  background-position: -240px -400px;
}
.large .file .icon.ppt,
.large .file .icon.pptx,
.large .file .icon.pps {
  background-position: -800px -400px;
}
.large .file .icon.png,
.large .file .icon.gif,
.large .file .icon.bmp,
.large .file .icon.tiff,
.large .file .icon.jpg,
.large .file .icon.jpeg {
  background-position: -640px -400px;
}
.large .file .icon.zip,
.large .file .icon.\37 z,
.large .file .icon.cab,
.large .file .icon.tar,
.large .file .icon.tgz,
.large .file .icon.gz,
.large .file .icon.rar {
  background-position: -960px -400px;
}
.large .file .icon.psd {
  background-position: -1040px -400px;
}
.large .file .icon.ics {
  background-position: -1120px -400px;
}
.large .file .icon.vcf,
.large .file .icon.vcard {
  background-position: -1200px -400px;
}
.large .file .icon.eml,
.large .file .icon.msg {
  background-position: -1280px -400px;
}
.large .file .icon.mp3,
.large .file .icon.amr,
.large .file .icon.aac,
.large .file .icon.aif,
.large .file .icon.aifc,
.large .file .icon.aiff,
.large .file .icon.ogg,
.large .file .icon.wma,
.large .file .icon.flac,
.large .file .icon.ape,
.large .file .icon.wax,
.large .file .icon.midi,
.large .file .icon.mp4a,
.large .file .icon.weba,
.large .file .icon.ra,
.large .file .icon.ram,
.large .file .icon.rmp,
.large .file .icon.m3u,
.large .file .icon.wav,
.large .file .icon.soundcloud {
  background-position: -480px -400px;
}
.large .file .icon.avi,
.large .file .icon.mp4,
.large .file .icon.mkv,
.large .file .icon.wmv,
.large .file .icon.vimeo,
.large .file .icon.youtube {
  background-position: -1360px -400px;
}
.large .file .icon.url {
  background-position: -1440px -400px;
}
.large .folder .icon {
  background-position: -880px -400px;
  height: 65px;
  width: 66px;
}
</style>
