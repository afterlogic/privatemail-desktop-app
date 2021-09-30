<template>
  <div
       class="col panel-rounded testVadimVadim"
       style="box-sizing: border-box; padding: 5px"
       @drop="dropDesktop($event)"
       @dragover.prevent
       @dragenter.prevent
  >
      <q-scroll-area class="full-height" ref="scrollArea" style="border: 3px dashed white;">
        <div class="pannel-hint non-selectable full-width inscription"
             v-if="!isUploadingFiles && !fileList.length && !folderList.length && !searchInProgress && currentStorage.Type !== 'shared' && isFolder"
        >
          Folder is empty
        </div>
        <div class="pannel-hint non-selectable full-width inscription" v-if="isUploadingFiles">
          Loading...
        </div>
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
             v-else-if="!fileList.length && !folderList.length && currentStorage.Type === 'shared' && !searchInProgress && !isUploadingFiles"
        >
          No shared files
        </div>
        <div v-if="!isUploadingFiles" class="row q-pa-sm large" style="display: flex; flex-wrap: wrap">

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
        </div>
      </q-scroll-area>
    <encrypted-file-information-dialog ref="encryptedFileInformationDialog"
                                       @downloadEncrypted="downloadFile"></encrypted-file-information-dialog>

  </div>
</template>

<script>
import _ from 'lodash'

import EncryptedFileInformationDialog from './EncryptedFileInformationDialog'
import FileItem from './items/FileItem'
import FolderItem from './items/FolderItem'
import {getStateDropZone} from "../../store/files/getters";

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
      elem: null,
      cancelToken: null,
      isDraggable: false,
      counter: 0
    }
  },
  computed: {
    currentFiles () {
      return this.$store.getters['files/getCurrentFiles']
    },
    showDropZone () {
      if (!this.isDraggable) {
        return this.$store.getters['files/getStateDropZone']
      } else {
        return false
      }
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
    },
    currentFolderPath () {
      return this.$store.getters['files/getCurrentPath']
    },
  },
  methods: {
    /*dragEnterDesktop() {
      if (!this.isDraggable) {
        this.counter++
        // droppable-zone
        this.$refs.scrollArea.$el.classList.add('droppable-zone')
      } else {

      }
    },
    dragLeaveDesktop () {
      if (!this.isDraggable) {
        this.counter--
        if (this.counter === 0) {
          this.$refs.scrollArea.$el.classList.remove('droppable-zone')
        }
      }
    },*/
    dropDesktop(e) {
      if (!this.isDraggable) {
        this.counter = 0
        this.$refs.scrollArea.$el.classList.remove('droppable-zone')
        this.$emit('uploadFilesFromDesktop', e.dataTransfer.files)
      }
    },
    addedFiles () {
      if (this.currentStorage.Type !== 'encrypted') {
        let url = this.$store.getters['main/getApiHost'] + '/?/Api/'
        let sAuthToken = this.$store.getters['user/getAuthToken']
        let headers = []
        if (sAuthToken) {
          headers.push({ name: 'Authorization', value: 'Bearer ' + sAuthToken })
        }
        return {
          url,
          method: 'POST',
          headers,
          fieldName: 'jua-uploader',
          formFields: [
            { name: 'jua-post-type', value: 'ajax' },
            { name: 'Module', value: 'Files' },
            { name: 'Method', value: 'UploadFile' },
            { name: 'Parameters', value: JSON.stringify({"Type": this.currentStorage.Type, "SubPath": "", "Path": this.currentFilePath, "Overwrite": false })},
          ],
        }
      }
    },
    onFileAdded (files) {
      this.$emit('onFileAdded', files)
    },
    showReport () {

    },
    finishUpload () {

    },
    openEncryptedFileDialog (file) {
      this.$refs.encryptedFileInformationDialog.openDialog(file)
    },
    downloadFile (file = null) {
      const currentFile = file || this.currentFile
      if (!currentFile.Downloading) {
        currentFile.downloadFile()
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
      this.isDraggable = true
      let checkedListHashes = this.$store.getters['files/getCheckedItems']
      let checkedList = checkedListHashes.map( hash => {
        return this.currentFiles.find( file => file.Hash === hash) || this.downloadFiles.find( file => file.Hash === hash)
      })
      const checkedFile = checkedList.find(item => item.Hash === file.Hash)
      if (!checkedFile) {
        checkedList.push(file)
      }
      this.checkedList = checkedList
      const hasFolder = checkedList.find( item => item.IsFolder === true)
      const hasFile = checkedList.find( item => item.IsFolder === false)

      let inscription = ''
      if (hasFolder && hasFile) {
        inscription = (e.ctrlKey ? '+ ': '') + checkedList.length + ' items'
      } else if (hasFile && !hasFolder) {
        inscription = (e.ctrlKey ? '+ ': '') + checkedList.length  +  ( checkedList.length > 1 ? ' files' : ' file')
      } else if (hasFolder && !hasFile) {
        inscription = (e.ctrlKey ? '+ ': '') + checkedList.length  +  ( checkedList.length > 1 ? ' folders' : ' folder')
      }
      let div = document.createElement('div');
      div.innerText = inscription
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
      e.dataTransfer.setData('file', 'true')
    },
    dragEnter (elem) {
      this.elem = elem
      if (elem?.classList.contains('folder')) {
        elem.classList.add('border-drop')
      } else {
        if (elem?.parentNode) {
          this.dragEnter(elem?.parentNode)
        }
      }
    },
    dragLeave (elem) {
      if (!elem?.classList.contains('large')) {
        if (elem?.classList.contains('border-drop')) {
          elem.classList.remove('border-drop')
        } else {
          if (elem?.parentNode) {
            this.dragLeave(elem?.parentNode)
          }
        }
      }
    },
    ondrop (e, toPath, toType, file) {
      const dropFile = this.checkedList.find( elem => elem.Hash === file.Hash)
      if (!dropFile) {
        if (!e.ctrlKey) {
          this.$store.commit('files/removeCheckedFiles', {
            checkedFiles: this.checkedList,
            currentFiles: {
              files: this.fileList,
              folders: this.folderList
            }
          })
          const fromPath = this.$store.getters['files/getCurrentPath']
          this.$store.dispatch('files/filesMove', { fromPath, toPath, toType, fromType: toType, checkedList: this.checkedList })
          .then( res => {
            if (!res) {
              this.$store.dispatch('files/getFiles', { currentStorage: toType, path: fromPath, isFolder: true })
            }
          })
        } else {
          let files = this.checkedList.map( item => {
            return {
              FromType: item.Type,
              FromPath: item.Path,
              Name: item.Name,
              IsFolder: item.IsFolder
            }
          })
          this.$store.dispatch('files/pastFiles', {
            toType: toType,
            toPath: toPath,
            files: files,
            isDraggable: true
          })
        }
      }
    },
    dragend () {
      this.isDraggable = false
      if (this.elem) {
        if (this.elem?.classList.contains('border-drop')) {
          this.elem.classList.remove('border-drop')
        } else {
          if (this.elem?.parentNode) {
            this.dragLeave(this.elem?.parentNode)
          }
        }
      }
    }
  },
  watch: {
    showDropZone (showDropZone) {
      if (showDropZone) {
        this.$refs.scrollArea.$el.classList.add('droppable-zone')
      } else {
        this.$refs.scrollArea.$el.classList.remove('droppable-zone')
      }
    },
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
  }
}
</script>

<style lang="scss">
.droppable-zone {
  border: 3px dashed #e2da36 !important;
  pointer-events: none;
  opacity: 0.8;
}
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
.fade-item {
  display: inline-block;
  margin-right: 10px;
}
.fade-enter-active, .fade-leave-active {
  transition: all 1s;
  opacity: 0;
  transform: scale(0.5);
}
.none-enter-active, .none-leave-active {
  display: none;
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

.large .folder .icon {
  background-position: -880px -400px;
  height: 65px;
  width: 66px;
}
</style>
