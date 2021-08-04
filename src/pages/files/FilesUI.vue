<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;" class="full-height full-width" separator-class="main-split-separator">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-md q-pb-md">
<!--              <q-btn flat no-caps no-wrap @click="uploadFiles" label="Upload files" size=18px color="primary" class="full-width big-button" />-->
             <q-btn-dropdown :disable="currentStorage.Type === 'shared'" size=18px type="button" class="full-width big-button" flat no-caps no-wrap color="primary" label="New" >
               <q-list class="bg-primary" style="font-size: 18px; color: white">
                 <q-item clickable v-close-popup @click="uploadFiles">
                   <q-item-section>
                     <q-item-label>Upload files</q-item-label>
                   </q-item-section>
                 </q-item>

                 <q-item clickable v-close-popup @click="createFolder">
                   <q-item-section>
                     <q-item-label>Create folder</q-item-label>
                   </q-item-section>
                 </q-item>

                 <q-item :disable="currentStorage.Type === 'encrypted'" clickable v-close-popup @click="createShortcut">
                   <q-item-section>
                     <q-item-label>Create shortcut</q-item-label>
                   </q-item-section>
                 </q-item>
               </q-list>
              </q-btn-dropdown>
              <create-shortcut-dialog ref="createShortcutDialog"></create-shortcut-dialog>
              <q-uploader
                multiple
                style="max-height: initial; display: none"
                class="col full-height full-width"
                flat
                ref="uploader"
                auto-upload
                hide-upload-btn
                :factory="addedFiles"
                @uploaded="showReport"
              >
              </q-uploader>
            </div>
            <div class="col" style="overflow: hidden;">
              <q-scroll-area class="full-height ">
                <q-list>
                  <div  v-for="storage in storageList" :key="storage.DisplayName">
                    <q-item
                      :class="{active: currentStorage.DisplayName === storage.DisplayName}"
                      clickable v-ripple @click="selectStorage(storage)">
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
            </div>
          </div>
        </template>
        <template v-slot:after>
          <div class="column no-wrap full-height bg-white text-grey-8 panel-rounded" style="overflow: hidden">
            <div class="col-auto">
              <toolbar ref="toolbar" :currentFile="currentFile" @downloadFile="$refs.files.downloadFile()"/>
              <q-toolbar style="width: 100%; background: #eee;">
                <q-input outlined rounded dense bg-color="white" class="search-field" v-model="searchText" v-on:keyup.enter="search" style="width: 100%;">
                  <template v-slot:prepend>
                    <q-icon name="search" @click="search"></q-icon>
                  </template>
                  <!-- <template v-slot:after>
                    <q-btn round dense flat icon="send" ></q-btn>
                  </template> -->
                </q-input>
              </q-toolbar>
              <q-breadcrumbs class="q-px-md q-py-sm">
                <q-breadcrumbs-el class="breadcrumbs" v-for="path in currentPaths" :key="path.name" :label="path.name" @click="changeFolder(path)" />
                <q-breadcrumbs-el label="Search results" v-if="searchProgress">
                  (&nbsp;<span class="breadcrumbs text-primary" @click="clearSearch">Clear</span>&nbsp;)
                </q-breadcrumbs-el>
              </q-breadcrumbs>
              <q-separator />
            </div>
            <router-view :currentStorage="currentStorage" @openFolder="clearSearchData()" ref="files" @shareFiles="shareFiles" @linkDialog="linkDialog"/>
          </div>
        </template>
      </q-splitter>
    </q-page>
  </q-page-container>
</template>

<style scoped lang="scss">
</style>

<script>
import Toolbar from './Toolbar'
import notification from '../../utils/notification'
import ShareIcon from '../../assets/icons/ShareIcon'
import EncryptedIcon from '../../assets/icons/EncryptedIcon'
import CreateShortcutDialog from './CreateShortcutDialog'

export default {
  name: "FilesUI",
  components: {
    Toolbar,
    ShareIcon,
    EncryptedIcon,
    CreateShortcutDialog
  },
  data () {
    return {
      splitterFolderModel: 20,
      splitterMessageModel: 50,
      checkboxVal: false,
      searchText: '',
      currentFile: null,
      searchProgress: false
    }
  },
  mounted() {
    this.populate()
  },
  computed: {
    isUploadingFiles () {
      return this.$store.getters['files/getLoadingStatus']
    },
    storageList () {
      return this.$store.getters['files/getStorageList']
    },
    currentStorage () {
      return this.$store.getters['files/getCurrentStorage']
    },
    currentPaths () {
      return this.$store.getters['files/getCurrentPaths']
    },
    currentFilePath () {
      return this.$store.getters['files/getCurrentPath']
    }
  },
  beforeDestroy () {
    this.$store.commit('files/setCurrentPaths', { path: [] })
    this.$store.commit('files/setCurrentPath', { path: '' })
  },
  methods: {
    createShortcut () {
      this.$refs.createShortcutDialog.openDialog()
    },
    createFolder () {
      this.$refs.toolbar.showCreateNewFolderDialog()
    },
    shareFiles (file) {
      this.$refs.toolbar.share(file)
    },
    linkDialog (file) {
      this.$refs.toolbar.linkDialog(file)
    },
    clearSearchData () {
      this.searchProgress = false
      this.searchText = ''
    },
    clearSearch () {
      this.searchProgress = false
      this.searchText = ''
      this.getFiles(this.currentStorage.Type, this.currentFilePath, '')
    },
    getFiles (currentStorage, path, pattern) {
      this.$store.dispatch('files/getFiles', {
        currentStorage: currentStorage,
        path: path,
        pattern: pattern })
    },
    search () {
      this.searchProgress = true
      this.$store.dispatch('files/getFiles', {
        currentStorage: this.currentStorage.Type,
        path: this.currentFilePath,
        isFolder: true,
        pattern: this.searchText })
    },
    changeFolder (path) {
      this.searchProgress = false
      this.searchText = ''
      this.getFiles(this.currentStorage.Type, path.path, '')
      this.$store.dispatch('files/changeCurrentPaths', {path})
    },
    addedFiles () {
      this.$store.commit('files/setLoadingStatus', { status: true })
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
          {name: 'jua-post-type', value: 'ajax'},
          {name: 'Module', value: 'Files'},
          {name: 'Method', value: 'UploadFile'},
          {name: 'Parameters', value: JSON.stringify({"Type": this.currentStorage.Type, "SubPath": "", "Path": this.currentFilePath, "Overwrite": false})},
        ],
      }
    },
    showReport () {
      notification.showReport('Complete')
      this.getFiles(this.currentStorage.Type, this.currentFilePath, '')
    },
    populate () {
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
      if (this.$route.path !== `/files/${currentStorage.Type}`) {
        this.$router.push(`/files/${currentStorage.Type}`)
      }
    },
    uploadFiles() {
      this.$refs.uploader.pickFiles()
    }
  }
}
</script>
<style scoped>

.breadcrumbs:hover {
  cursor: pointer;
  text-decoration: underline;
}

</style>
