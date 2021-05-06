<template>
<div>
  <q-item  clickable v-ripple style="height: 50px">
    <q-item-section avatar>
      <q-icon v-if="folder.IconName" :name="folder.IconName" style="margin: auto"/>
      <q-icon v-else :name="'panorama_fish_eye'" size="8px" style="margin: auto"/>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{folder.Name}}</q-item-label>
    </q-item-section>
    <q-item-section>
      <q-toolbar style="margin-left: auto; width: auto;">
        <span>{{ folder.Count }}</span>
        <q-btn
          :disable="folder.Type !== 10 && folder.Type !== 12 && folder.Type !== 11"
          flat no-wrap color="primary" :icon="bHideFolder? 'visibility' : 'visibility_off'"
          @click="subscribeFolder"/>
        <q-btn :disable="folder.SubFolders.length > 0 || folder.Type !== 10" flat no-wrap color="primary"
               icon="delete_outline" @click="deleteFolder"/>
      </q-toolbar>
    </q-item-section>
  </q-item>
  <template v-if="folder.SubFolders">
    <ManageFolders v-for="subfolder in folder.SubFolders" :key="subfolder.Hash" :folder="subfolder" :level="folder.Namespaced ? level : level + 1" :currentFolderFullName="currentFolderFullName"></ManageFolders>
  </template>
</div>
</template>

<script>
import ManageFolders  from './ManageFolders'
import {ipcRenderer} from "electron";
export default {
  name: "ManageFolders",
  components: {
    ManageFolders
  },
  props: {
    folder: Object,
    currentFolderFullName: String,
    level: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      bHideFolder: true
    }
  },
  mounted() {
    this.bHideFolder = this.folder.IsSubscribed
  },
  methods: {
    subscribeFolder() {
      this.bHideFolder ? this.bHideFolder = false: this.bHideFolder = true
      ipcRenderer.send('mail-subscribe-folder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        iAccountId: this.$store.getters['mail/getCurrentAccountId'],
        sFolderName: this.folder.FullName,
        bSetAction: this.bHideFolder
      })
      ipcRenderer.once('mail-subscribe-folder-reject', (event, { bResult}) => {
        if (bResult) {
          this.$store.dispatch('mail/saveCurrentFolderTree', {
            folderName: this.folder.FullName,
            bHideFolder: this.bHideFolder
          })
        }
      })
    },
    deleteFolder() {
      ipcRenderer.send('mail-delete-folder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        iAccountId: this.$store.getters['mail/getCurrentAccountId'],
        sFolderFullName: this.folder.FullName,
      })
      ipcRenderer.once('mail-delete-folder', (event, { bResult, bError}) => {
        if (bResult) {
          this.$store.dispatch('mail/removeCurrentFolderTree', {folderName: this.folder.FullName})
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
