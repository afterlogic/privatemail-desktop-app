<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="popup_panel select-text-disable">
      <div class="flex panels q-px-md q-pt-md">
        <q-card-section class="storages" style="padding: 0">
          <q-scroll-area class="full-height main-background" style="border-radius: 5px;">
            <q-list>
              <div v-for="storage in storageList" :key="storage.DisplayName">
                <q-item
                  :class="{'active-storage': currentStorage.DisplayName === storage.DisplayName}"
                  clickable v-ripple @click="selectStorage(storage)"
                  style="color: white; border-radius: 5px;"
                >
                  <q-item-section avatar>
                    <q-icon v-if="storage.Type === 'personal'">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path class="svg-icon"
                              d="m 12,6 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z"/>
                      </svg>
                    </q-icon>
                    <q-icon v-if="storage.Type === 'encrypted'">
                      <encrypted-icon></encrypted-icon>
                    </q-icon>
                    <q-icon v-if="storage.Type === 'corporate'">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path class="svg-icon"
                              d="m 12,3 c -4.9587181,0 -9,4.0412819 -9,9 0,4.958718 4.0412819,9 9,9 4.958718,0 9,-4.041282 9,-9 0,-4.9587181 -4.041282,-9 -9,-9 z m 0,2 c 3.877838,0 7,3.1221621 7,7 0,3.877838 -3.122162,7 -7,7 C 8.1221621,19 5,15.877838 5,12 5,8.1221621 8.1221621,5 12,5 Z m 0,1 c -3.3018639,0 -6,2.6981361 -6,6 0,3.301864 2.6981361,6 6,6 3.301864,0 6,-2.698136 6,-6 0,-3.3018639 -2.698136,-6 -6,-6 z m 0,2 c 2.220984,0 4,1.7790164 4,4 0,2.220984 -1.779016,4 -4,4 C 9.7790164,16 8,14.220984 8,12 8,9.7790164 9.7790164,8 12,8 Z"/>
                      </svg>
                    </q-icon>
                    <q-icon v-if="storage.Type === 'shared'">
                      <share-icon/>
                    </q-icon>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-item-label lines="1">{{ storage.DisplayName }}</q-item-label>
                  </q-item-section>
                  <!-- <q-item-section side>3</q-item-section> -->
                </q-item>
              </div>
            </q-list>
          </q-scroll-area>
        </q-card-section>
        <q-card-section class="files" style="padding: 0;  border: 1px solid rgba(0,0,0,0.12); border-radius: 5px;">
          <div style="position: sticky">
            <q-breadcrumbs class="q-px-md q-py-sm">
              <q-breadcrumbs-el class="breadcrumbs" v-for="path in currentPaths" :key="path.name" :label="path.name"  @click="changeFolder(path)"/>
            </q-breadcrumbs>
          </div>
          <div>
            <q-separator></q-separator>
          </div>
          <q-scroll-area class="full-height" style="max-height: 405px; margin-left: 0">
            <div class="pannel-hint non-selectable full-width" style="width: 100%" v-if="isUploadingFiles">
              Loading...
            </div>
            <div class="pannel-hint non-selectable full-width inscription"
                 v-if="!isUploadingFiles && !filesList.length && currentStorage.Type !== 'shared'"
            >
              Folder is empty
            </div>
            <div class="pannel-hint non-selectable full-width inscription"
                 v-if="!filesList.length && currentStorage.Type === 'shared' && !isUploadingFiles && !isFolder"
            >
              No shared files
            </div>
            <div class="row" v-if="!isUploadingFiles">
              <q-card
                flat
                class="q-mx-sm q-my-sm select-text-disable file"
                v-for="file in filesList" :key="file.Hash" align="center"
              >
                <file :file="file" :is-checked="isChecked(file)" @selectedFile="selectedFile"
                      :current-storage="currentStorage" @select="select" @openFolder="openFolder"></file>
              </q-card>
            </div>
          </q-scroll-area>
        </q-card-section>
      </div>
      <q-card-actions class="buttons" align="right">
        <q-btn :disable="!isFileSelected" flat :ripple="false" color="primary" @click="select"
               label="Select" />
        <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancel"
               label="Cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import ShareIcon from '../../../assets/icons/ShareIcon'
import EncryptedIcon from '../../../assets/icons/EncryptedIcon'
import File from './File'
import _ from 'lodash'

export default {
  name: 'FilesUI',
  components: {
    ShareIcon,
    EncryptedIcon,
    File
  },
  data () {
    return {
      confirm: false,
      searchProgress: false,
      searchText: '',
      checkedList: [],
    }
  },
  computed: {
    currentPaths () {
      return this.$store.getters['files/getCurrentPaths']
    },
    storageList () {
      return this.$store.getters['files/getStorageList']
    },
    currentStorage () {
      return this.$store.getters['files/getCurrentStorage']
    },
    isUploadingFiles () {
      return this.$store.getters['files/getLoadingStatus']
    },
    isFolder () {
      const currentPath = this.$store.getters['files/getCurrentPath']
      return !!currentPath
    },
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
    isFileSelected () {
      if(this.checkedList.length === 1) {
        return !this.checkedList[0].IsFolder
      } else if (this.checkedList.length > 1) {
        return true
      }
      return false
    }
  },
  methods: {
    openFolder () {
      this.checkedList = []
    },
    populate () {
      this.checkedList = []
      this.$store.commit('files/setLoadingStatus', { status: true })
      this.$store.dispatch('files/getFiles', { currentStorage: this.currentStorage.Type, path: '' })
      const path = {
        path: '',
        name: this.currentStorage.DisplayName,
      }
      this.$store.dispatch('files/changeCurrentPaths', {
        path,
        lastStorage: true
      })
    },
    openDialog () {
      this.populate()
      this.confirm = true
    },
    select () {
      let files = []
      this.checkedList.forEach(item => {
        if (!item.IsFolder) {
          files.push({
            Storage: item.Type,
            Path: item.Path,
            Name: item.Name,
            Id: item.Id,
            IsEncrypted: false,
            Hash: item.Hash,
            Size: item.Size,
            __progress: 0
          })
        }
      })
      this.saveFilesAsTempFiles(files)
    },
    saveFilesAsTempFiles (files) {
      this.confirm = false
      this.$emit('addAttachmentsFromFiles', files)
    },
    cancel () {
      this.confirm = false
    },
    selectStorage (currentStorage) {
      this.searchProgress = false
      this.searchText = ''
      const path = {
        path: '',
        name: currentStorage.DisplayName,
      }
      this.$store.dispatch('files/setCurrentStorage', { currentStorage })
      this.getFiles(currentStorage.Type, '', '')
      this.$store.dispatch('files/changeCurrentPaths', {
        path,
        lastStorage: true
      })
    },
    getFiles (currentStorage, path, pattern) {
      this.$store.dispatch('files/getFiles', {
        currentStorage: currentStorage,
        path: path,
        pattern: pattern })
    },
    isChecked(file) {
      return this.checkedList.find(checkedFile => checkedFile.Hash === file.Hash)
    },
    changeFolder (path) {
      this.searchProgress = false
      this.searchText = ''
      this.getFiles(this.currentStorage.Type, path.path, '')
      this.$store.dispatch('files/changeCurrentPaths', {path})
    },
    selectedFile ( {file, oMouseEvent} ) {
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
  }
}
</script>

<style scoped>
.file {
  width: 150px;
  height: 175px;
}
.select-text-disable {
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.active-storage {
  border: 1px solid var(--q-color-primary);
}
.breadcrumbs:hover {
  cursor: pointer;
  text-decoration: underline;
}
.storages {
  width: 30%;
}
.files {
  max-height: 449px;
  padding-left: 0;
  padding-right: 0;
  width: 70%;
}
.popup_panel {
  min-width: 840px;
  height: 520px;
}
.panels {
  height: 465px;
}
</style>
