<template>
  <div class="col panel-rounded" style="box-sizing: border-box;">
    <q-scroll-area class="full-height">
      <transition name="inscription">
        <div class="pannel-hint non-selectable full-width inscription"
             v-if="!isUploadingFiles && !fileList.length && !folderList.length && !searchInProgress && currentStorage.Type !== 'shared' && isFolder"
        >
          Folder is empty
        </div>
      </transition>
      <transition name="inscription">
        <div class="pannel-hint non-selectable full-width inscription" v-if="isUploadingFiles">
          Loading...
        </div>
      </transition>
      <div class="pannel-hint non-selectable full-width inscription"
           v-if="!isUploadingFiles && !fileList.length && !folderList.length && !searchInProgress && currentStorage.Type !== 'shared' && !isFolder"
      >
        You can drag-n-drop files from other folders or from your desktop, or click New Folder to create a folder
      </div>
      <div class="pannel-hint non-selectable full-width inscription"
           v-else-if="!isUploadingFiles && !fileList.length && !folderList.length && searchInProgress">
        Nothing found
      </div>
      <div class="pannel-hint non-selectable full-width inscription"
           v-else-if="!fileList.length && !folderList.length && currentStorage.Type === 'shared' && !searchInProgress"
      >
        No shared files
      </div>
      <transition-group class="row q-pa-sm large" v-if="!isUploadingFiles" name="list" tag="div"
                        style="display: flex; flex-wrap: wrap">
          <folder-item
            v-for="folder in folderList" :key="folder.Hash"
            :file="folder"
            :selectFile="selectFile"
            :openFolder="openFolder"
            :dragEnter="dragEnter"
            :dragend="dragend"
            :onDragStart="onDragStart"
            :isChecked="isChecked"
            :openShareDialog="openShareDialog"
            :openLinkDialog="openLinkDialog"
            :checkedList="checkedList"
            :dragLeave="dragLeave"
            :ondrop="ondrop"
          />
        <file-item
          v-for="file in fileList" :key="file.Hash"
          :file="file"
          :selectFile="selectFile"
          :onDragStart="onDragStart"
          :dragend="dragend"
          :isChecked="isChecked"
          :openLinkDialog="openLinkDialog"
          :openEncryptedFileDialog="openEncryptedFileDialog"
          :openShareDialog="openShareDialog"
          :downloadFile="downloadFile"
          @openFolder="openFolder(file)"
        />
      </transition-group>
    </q-scroll-area>
    <encrypted-file-information-dialog ref="encryptedFileInformationDialog"
                                       @downloadEncrypted="downloadFile"></encrypted-file-information-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import webApi from '../../utils/webApi'

import EncryptedFileInformationDialog from './EncryptedFileInformationDialog'
import FileItem from './items/FileItem'
import FolderItem from './items/FolderItem'

export default {
  name: 'Files',
  components: {
    EncryptedFileInformationDialog,
    FileItem,
    FolderItem
  },
  props: {
    currentStorage: Object,
    downloadFiles: Array,
    fileList: Array,
    folderList: Array
  },
  data() {
    return {
      currentFile: null,
      checkedList: [],
      fileFormats: ['svg', 'txt', 'jpg', 'png', 'docx', 'pdf', 'JPG', 'jpeg', 'doc'],
      imgFormats: ['jpeg', 'png', 'jpg', 'JPG', 'jpeg'],
      elem: null
    }
  },
  computed: {
    currentFiles () {
      return this.$store.getters['files/getCurrentFiles']
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
    fileList (val) {
      this.$emit('addFileList', val)
    },
    folderList (val) {
      this.$emit('addFolderList', val)
    },
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
    openEncryptedFileDialog (file) {
      this.$refs.encryptedFileInformationDialog.openDialog(file)
    },
    downloadFile (file = null) {
      let url = ''
      const currentFile = file || this.currentFile
      if (currentFile && !currentFile.DownloadingStatus) {
        url = currentFile.DownloadUrl
        currentFile.changeDownloadingStatus(true)
        webApi.downloadByUrl(url, currentFile.Name, currentFile)
      }
    },
    openShareDialog (file) {
      this.$emit('shareFiles', file)
    },
    openLinkDialog (file) {
      this.$emit('linkDialog', file)
    },
    selectFile (file, oMouseEvent) {
      console.log(file, 'file')
      const hashes = this.$store.getters['files/getCheckedItems']
      const fileList = this.$store.getters['files/getCurrentFiles']
      let checkedList = hashes.map( hash => {
        return this.downloadFiles.find( file => file.Hash === hash) || fileList.find( file => file.Hash === hash)
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
          let files = this.fileList.map( file => {
            return file
          })
          let folders = this.folderList.map( folder => {
            return folder
          })
          let items = folders.concat(files)
          let iLastCheckedIndex = items.indexOf(this.currentFile)
          let iCurrCheckedIndex = items.indexOf(file)
          if (iLastCheckedIndex !== -1 && iCurrCheckedIndex !== -1) {
            const index = checkedList.findIndex( checkedFile => {
              return checkedFile === file
            })
            if (index === -1) {
              let iStartIndex = Math.min(iLastCheckedIndex, iCurrCheckedIndex)
              let iEndIndex = Math.max(iLastCheckedIndex, iCurrCheckedIndex)
              let aUidsToCheck = items.slice(iStartIndex, iEndIndex + 1)
              if (aUidsToCheck.length > 0) {
                checkedList = aUidsToCheck
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
         this.$store.dispatch('files/changeCurrentFile', { currentFile: file.Hash })
       }
      this.checkedList = checkedList
      const itemsHashes = this.checkedList.map( file => {
        return file.Hash
      })
      this.$store.dispatch('files/changeCheckedItems', { checkedItems: itemsHashes })
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
    },
    onDragStart (e, file) {
      let checkedListHashes = this.$store.getters['files/getCheckedItems']
      let checkedList = checkedListHashes.map( hash => {
        return this.currentFiles.find( file => file.Hash === hash) || this.downloadFiles.find( file => file.Hash === hash)
      })
      const checkedFile = checkedList.find(item => item.Hash === file.Hash)
      if (!checkedFile) {
        checkedList.push(file)
      }
      this.checkedList = checkedList

      let div = document.createElement('div');
      div.innerText = checkedList.length  +  ( checkedList.length > 1 ? ' files' : 'file')
      div.style.position = 'fixed';
      div.style.fontSize = '12px'
      div.style.color = 'white'
      div.style.background = 'black'
      div.style.padding = '2px 20px'
      div.style.borderRadius = '4px'
      document.body.appendChild(div);
      e.dataTransfer.setDragImage(div, 0, 0);
      checkedListHashes = this.checkedList.map( file => {
        return file.Hash
      })
      this.$store.dispatch('files/changeCheckedItems', {
        checkedItems: checkedListHashes
      })
      e.dataTransfer.setData('fromPath', file.Path)
      e.dataTransfer.setData('fromType', file.Type)
    },
    dragEnter (elem) {
      this.elem = elem
      if (elem.classList.contains('folder')) {
        elem.classList.add('border-drop')
      } else {
        this.dragEnter(elem.parentNode)
      }
    },
    dragLeave (elem) {
      if (!elem.classList.contains('large')) {
        if (elem.classList.contains('border-drop')) {
          elem.classList.remove('border-drop')
        } else {
          this.dragLeave(elem.parentNode)
        }
      }
    },
    ondrop (e, toPath, toType, file) {
      const dropFile = this.checkedList.find( elem => elem.Hash === file.Hash)
      if (!dropFile) {
        this.$store.commit('files/removeCheckedFiles', {
          checkedFiles: this.checkedList
        })
        const fromPath = this.$store.getters['files/getCurrentPath']
        this.$store.dispatch('files/filesMove', { fromPath, toPath, toType, fromType: toType, checkedList: this.checkedList })
        .then( res => {
          if (!res) {
            this.$store.dispatch('files/getFiles', { currentStorage: toType, path: fromPath, isFolder: true })
          }
        })
      }
    },
    dragend () {
      if (this.elem) {
        if (this.elem.classList.contains('border-drop')) {
          this.elem.classList.remove('border-drop')
        } else {
          this.dragLeave(this.elem.parentNode)
        }
      }
    }
  }
}
</script>

<style lang="scss">
.child-elements {
  pointer-events: none;
}
.border-drop {
 background-color: rgba(103, 128, 159, 0.2);
}
.inscription {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.inscription-enter-active {
  transition: all 3s;
}
.inscription-leave-active {
  transition: all 1s;
}
.inscription-enter, .inscription-leave-to {
  opacity: 0;
}
.list-item {
  display: inline-block;
  margin-right: 10px;
}
.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active до версии 2.1.8 */ {
  opacity: 0;
  transform: scale(0.5);
}
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
