<template>
  <div class="col panel-rounded">
      <q-scroll-area class="full-height">
        <div style="text-align: center" class="q-mt-xl" v-if="isUploadingFiles">
          Loading...
        </div>
        <div style="text-align: center" class="q-mt-xl" v-if="!isUploadingFiles && !filesList.length">
          You can drag-n-drop files from other folders or from your desktop, or click New Folder to create a folder
        </div>
        <div class="row q-pa-sm" v-if="!isUploadingFiles">
          <q-card
            class="q-ma-md"
            :class="{ 'bg-yellow-1': isChecked(file) }"
            v-for="file in filesList" :key="file.Id" style="width: 136px" align="center"
          >
            <div class="file-focus" v-if="!file.IsFolder" @click="function (oMouseEvent) { selectedFile(file, oMouseEvent) }">
              <q-separator/>
              <q-card-section >
                {{ file.Name }}
              </q-card-section>
              <q-card-actions align="center">
                <q-btn v-if="hasViewAction" flat @click="viewFile(file)">view</q-btn>
                <q-btn v-if="hasDownloadAction" flat @click="downloadFile(file)">download</q-btn>
              </q-card-actions>
            </div>
            <div class="file-focus" v-if="file.IsFolder" @click="function (oMouseEvent) { selectedFile(file, oMouseEvent) }" @dblclick="openFolder(file)">
              <q-card-section >
                <div class="text-subtitle2">folder</div>
              </q-card-section>

              <q-separator/>
              <q-card-section >
                {{ file.Name }}
              </q-card-section>
            </div>
          </q-card>
        </div>
      </q-scroll-area>
  </div>
</template>

<script>
import webApi from 'src/utils/webApi'

export default {
  name: 'Files',
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
    }
  },
  computed: {
    filesList () {
      return this.$store.getters['files/getCurrentFiles']
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
    selectedFile (file, oMouseEvent) {
      let selectedFile = {
        Path: file.Path,
        Name: file.Name,
        IsFolder: file.IsFolder
      }
      if (oMouseEvent) {
        if (oMouseEvent.ctrlKey) {
          this.checkedList = _.union(this.checkedList, [selectedFile])
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
    hasDownloadAction () {
      if (this.currentFile) {
        return this.currentFile?.Actions?.download
      }
      return false
    },
    hasViewAction () {
      if (this.currentFile) {
        return this.currentFile?.Actions?.view
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

<style scoped>
.file-focus:hover {
  cursor: pointer;
}
</style>
