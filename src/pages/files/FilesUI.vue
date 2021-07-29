<template>
  <q-page-container style="height: 100vh">
    <q-page class="flex flex-stretch" style="height: 100%">
      <q-splitter v-model="splitterFolderModel" style="height: 100%; width: 100%;" class="full-height full-width" separator-class="main-split-separator">
        <template v-slot:before>
          <div class="column full-height">
            <div class="col-auto q-px-md q-pb-md">
              <q-btn flat no-caps no-wrap @click="uploadFiles" label="Upload files" size=18px color="primary" class="full-width big-button" />
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
                        <q-icon name="folder"></q-icon>
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
<!--            <div class="col">
              <q-scroll-area class="full-height">
                <div class="row q-pa-sm">
                  <q-card class="q-ma-md" v-for="n in 20" :key="n">
                    <q-card-section>
                      <div class="text-subtitle2">by John Doe</div>
                    </q-card-section>

                    <q-separator />
                    <q-card-section>
                      Image.jpg
                    </q-card-section>
                  </q-card>
                </div>
              </q-scroll-area>
            </div>-->
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

export default {
  name: "FilesUI",
  components: {
    Toolbar,
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
  watch: {

  },
  beforeDestroy () {
    this.$store.commit('files/setCurrentPaths', { path: [] })
    this.$store.commit('files/setCurrentPath', { path: '' })
  },
  methods: {
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
