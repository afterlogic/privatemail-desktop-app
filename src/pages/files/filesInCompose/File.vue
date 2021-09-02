<template>
  <div class="large select-text-disable">
    <div class="file-focus file" v-if="!file.IsFolder"
         @click="function (oMouseEvent) { selectedFile(file, oMouseEvent) }" @dblclick="select">
      <div
        class="file-card"
        style="height: 150px; border-radius: 3px"
        :class="{
                 'file-selected': isChecked
                 }"
      >
                <span class="display-none tooltip" style="line-height: 1.2"
                      :class="{ 'display-block': isChecked, 'tooltip-checked': isChecked }">
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
      </div>
      <div class="flex q-mt-xs" style="justify-content: space-between;font-size: 10pt;">
        <div class="q-ml-sm">
          <b>{{ getShortName(file.Name) }}</b>
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">{{ file.Name }}</q-tooltip>
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
                'folder-selected': isChecked && file.IsFolder
               }">
        <div class="image q-px-sm" style="padding-top: 28px">
          <div class="img-block">
            <span class="icon"></span>
          </div>
        </div>
        <q-card-section tag="span" style="padding: 0; font-size: 10pt;">
          <div>
            {{ getShortName(file.Name) }}
          </div>
        </q-card-section>
      </div>
    </div>
  </div>
</template>

<script>
import text from '../../../utils/text'
import date from '../../../utils/date'

export default {
  name: 'File',
  props: {
    file: {
      Type: Object,
      Default: null
    },
    isChecked: {
      Type: Boolean,
      Default: false
    },
    currentStorage: {
      Type: Object,
      Default: {}
    }
  },
  data () {
    return {
      fileFormats: ['svg', 'txt', 'jpg', 'png', 'docx', 'pdf', 'JPG', 'jpeg', 'doc'],
      imgFormats: ['jpeg', 'png', 'jpg', 'JPG', 'jpeg'],
    }
  },
  computed: {

  },
  methods: {
    select () {
      this.$emit('select')
    },
    isEncrypted (file) {
      return file.ExtendedProps?.ParanoidKey ? true : false
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
    openFolder(file) {
      this.$emit('openFolder', true)
      const path = {
        path: file.FullPath,
        name: file.Name
      }
      this.$store.dispatch('files/changeCurrentPaths', { path })
      this.$store.dispatch('files/getFiles', { currentStorage: this.currentStorage.Type, path: file.FullPath, isFolder: true })
    },
    getShortName (name) {
      if (name.length > 12) {
        return name.substr(0, 10) + '...'
      }
      return name
    },
    getFileSize (file) {
      return text.getFriendlySize(file.Size)
    },
    isImg (file) {
      const formatFile = this.formatFile(file)
      return this.imgFormats.find( format => {
        return format === formatFile
      })
    },
    getDescription (file) {
      return 'Added by ' + file.Owner + ' on ' + date.getShortDate(file.LastModified)
    },
    formatFile (file) {
      let fileName = file.Name
      return fileName.split('.')[fileName.split('.').length - 1]
    },
    selectedFile (file, oMouseEvent) {
      this.$emit('selectedFile', { file, oMouseEvent })
    }
  }
}
</script>

<style scoped lang="scss">
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
  background-image: url('../../../assets/sprites.png');
  background-repeat: no-repeat;
  background-position: 0px -360px;
  display: inline-block;
  height: 32px;
  width: 32px;
}

.folder .icon {
  background-image: url('../../../assets/sprites.png');
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
