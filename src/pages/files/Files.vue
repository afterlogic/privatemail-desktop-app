<template>
  <div class="col panel-rounded" style="box-sizing: border-box;">
      <q-scroll-area class="full-height">
        <div style="text-align: center" class="q-mt-xl" v-if="isUploadingFiles">
          Loading...
        </div>
        <div style="text-align: center" class="q-mt-xl" v-if="!isUploadingFiles && !filesList.length">
          You can drag-n-drop files from other folders or from your desktop, or click New Folder to create a folder
        </div>
        <div class="row q-pa-sm large" v-if="!isUploadingFiles">
          <q-card
            flat
            class="q-mx-sm q-mb-md select-text-disable"
            v-for="file in filesList" :key="file.Id" style="width: 150px; height: 175px;" align="center"
          >
            <div class="file-focus file q-mt-md" v-if="!file.IsFolder" @click="function (oMouseEvent) { selectedFile(file, oMouseEvent) }">
              <div
                class="file-card"
                style="height: 150px; border-radius: 3px"
                :class="{
                 'file-selected': isChecked(file)
                 }"
              >
                <span class="display-none tooltip" :class="{ 'display-block': isChecked(file), 'tooltip-checked': isChecked(file) }">
                  {{ getDescription(file) }}
                </span>
                <div class="image q-px-sm" style="padding-top: 28px" v-if="!getPreviewFile(file)">
                  <div class="img-block">
                    <span class="icon" :class="formatFile(file)"></span>
                  </div>
                </div>
                <div class="image q-px-sm q-pt-sm" v-if="getPreviewFile(file)">
                    <img class="img-preview" :src="getPreviewFile(file)" alt="">
                </div>
                <div class="flex q-mt-sm q-mx-sm" style="position: absolute; top: 85px; width: 100%;">
                  <div class="q-mr-sm q-mb-xs q-ml-sm file-icon" v-if="isShared(file)" @click="openShareDialog(file)">
                      <share-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div class="q-mr-sm q-mb-xs q-ml-sm file-icon" v-if="hasLink(file)" @click="openLinkDialog(file)">
                      <link-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                </div>
                <div v-if="getPreviewFile(file)" class="q-mx-sm" style="height: 26px; border-bottom: 1px solid #dedede;"></div>
                <div v-if="!getPreviewFile(file)" class="q-mx-sm" style="height: 14px; border-bottom: 1px solid #dedede;"></div>
                <div class="flex q-mt-sm" style="justify-content: space-between; font-size: 9pt">
                  <div class="q-ml-sm">
                    <span v-if="hasViewAction(file)" class="q-mr-md text-primary" @click="viewFile(file)">View</span>
                    <span v-if="hasOpenAction(file)" class="q-mr-md text-primary" @click="viewFile(file)">Open</span>
                  </div>
                  <div class="q-mr-sm">
                    <span v-if="hasDownloadAction(file)" class="text-primary" @click="downloadFile(file)">Download</span>
                  </div>
                </div>
              </div>
              <div class="flex q-mt-xs" style="justify-content: space-between;font-size: 10pt;">
                <div>
                  <b>{{ getShortName(file.Name) }}</b>
                  <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">{{file.Name}}</q-tooltip>
                </div>
                <div style="align-items: center">
                  <span>{{ getFileSize(file) }}</span>
                </div>
              </div>
            </div>
            <div
              class="file-focus folder q-mt-md"
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
                <div class="flex q-px-md" style="position: absolute; top: 65px; width: 100%;">
                  <div class="q-mr-sm q-mb-xs q-ml-sm file-icon" v-if="isShared(file)" @click="openShareDialog(file)">
                    <share-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div class="q-mr-sm q-mb-xs q-ml-sm file-icon" v-if="hasLink(file)" @click="openLinkDialog(file)">
                    <link-icon style="fill: white !important;" :width="20" :height="20"/>
                  </div>
                  <div v-if="!hasLink(file) && !isShared(file)" style="height: 26px"></div>
                </div>
                <q-card-section tag="span" style="padding: 0">
                  <div>
                    {{ getShortName(file.Name) }}
                  </div>
                </q-card-section>
              </div>
            </div>
          </q-card>
        </div>
      </q-scroll-area>
  </div>
</template>

<script>
import webApi from 'src/utils/webApi'
import ShareIcon from '../../assets/icons/ShareIcon'
import LinkIcon from '../../assets/icons/LinkIcon'
import date from '../../utils/date'
import _ from 'lodash'
import text from '../../utils/text'

export default {
  name: 'Files',
  components: {
    ShareIcon,
    LinkIcon
  },
  props: {
    currentStorage: {
      Type: Object,
      Default: {}
    }
  },
  data() {
    return {
      currentFile: null,
      checkedList: [],
      fileFormats: ['svg', 'txt', 'jpg', 'png', 'docx', 'pdf'],
    }
  },
  computed: {
    filesList () {
      let folders = []
      let files = []
      const currentFiles = this.$store.getters['files/getCurrentFiles']
      currentFiles.map( file => {
        if (file.IsFolder) {
          folders.push(file)
        } else {
          files.push(file)
        }
      })
      return folders.concat(files)
    },
    isUploadingFiles () {
      return this.$store.getters['files/getLoadingStatus']
    }
  },
  watch: {
    $route () {
      this.currentFile = null
    }
  },
  methods: {
    getDescription (file) {
      return 'Added by ' + file.Owner + ' on ' + date.getShortDate(file.LastModified)
    },
    getShortName (name) {
      if (name.length > 14) {
        return name.substr(0, 12) + '...'
      }
      return name
    },
    getFileSize (file) {
      return text.getFriendlySize(file.Size)
    },
    formatFile (file) {
      let fileName = file.Name
      return fileName.split('.')[fileName.split('.').length - 1]
    },
    openShareDialog (file) {
      this.$emit('shareFiles', file)
    },
    openLinkDialog (file) {
      this.$emit('linkDialog', file)
    },
    isShared (file) {
      const shares = file.ExtendedProps?.Shares
      return _.isArray(shares) && shares.length
    },
    hasLink (file) {
      return file?.ExtendedProps?.PublicLink
    },
    downloadFile (file = null) {
      let url = ''
      if (file) {
        url = file.Actions.download.url
      } else {
        url = this.currentFile.Actions.download.url
      }
      webApi.downloadByUrl(url)
    },
    viewFile (file) {
      const url = file.Actions.view.url
      webApi.viewByUrlInNewWindow(url, file.Name)
    },
    getPreviewFile (file) {
      if (file?.ThumbnailUrl) {
        let api = this.$store.getters['main/getApiHost']
        let link = file.ThumbnailUrl
        return api + '/' + link
      }
      return null
    },
    selectedFile (file, oMouseEvent) {
      console.log(file, 'file')
       if (oMouseEvent) {
        if (oMouseEvent.ctrlKey) {
          this.checkedList = _.union(this.checkedList, [file])
        } else if (oMouseEvent.shiftKey) {
          let files = _.map(this.filesList, function (file) {
            return {
              Path: file.Path,
              Name: file.Name,
              IsFolder: file.IsFolder
            }
          })
        } else {
          this.checkedList = [file]
          this.currentFile = file
          this.$store.dispatch('files/changeCurrentFile', { currentFile: file })
        }
       }
      this.$store.dispatch('files/changeCheckedItems', { checkedItems:  this.checkedList })
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
      return this.checkedList.find(checkedFile => checkedFile.Name === file.Name)
    },
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
.img-preview {
  display: block;
  height: 82px;
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
.tooltip {
  position: absolute;
  left: 0;
  background-color:rgba(255,255,255, 0.6);
  font-size: 12px;
  margin: 0 1px;
  border-radius: 4px
}
.tooltip-checked {
  background-color: rgba(235, 247, 203, 0.6);
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
