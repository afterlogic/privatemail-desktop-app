<template>
  <div>
    <div class="row q-pa-sm items-center">
      <span>
        <q-btn :disable="!currentFile || isFolder || checkedItems.length > 1 || loadingProgress() || !checkedItems.length" flat color="primary" icon="file_download"
               @click="downloadFile"/>
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Download file
        </q-tooltip>
      </span>
      <span>
        <q-btn :disable="!checkedItems.length || isFolder || loadingProgress() || isArchive()" flat color="primary"
               icon="alternate_email" @click="sendFile"/>
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Send file
        </q-tooltip>
      </span>
      <span>
        <q-btn
          :disable="!currentFile || currentStorage.Type === 'shared' || loadingProgress() || !checkedItems.length || isArchive()" flat color="primary" icon="edit" @click="editFile"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Rename
        </q-tooltip>
      </span>
      <span>
        <q-btn
          :disable="!checkedItems.length || currentStorage.Type === 'shared' || loadingProgress() || isArchive()" flat color="primary" icon="delete_outline"
          :label="checkedItems.length > 0 ? checkedItems.length : ''" @click="openRemoveItemsDialog"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Delete
        </q-tooltip>
      </span>
      <span>
        <q-btn
          :disable="!checkedItems.length || currentStorage.Type === 'shared' || loadingProgress() || isArchive()" flat color="primary" icon="content_cut" @click="cutFile"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Cut
        </q-tooltip>
      </span>
      <span>
        <q-btn
          :disable="!checkedItems.length || currentStorage.Type === 'shared' || loadingProgress() || isArchive()" flat color="primary" icon="file_copy" @click="copyFile"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Copy
        </q-tooltip>
      </span>
      <span>
        <q-btn
          :disable="availabilityPastAction || loadingProgress() || isArchive()"
          flat color="primary" icon="content_paste"
          :label="copiedFiles.files.length > 0 ? copiedFiles.files.length : ''" @click="pastFile"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Paste:<br>
             <span v-for="file in copiedFiles.files" :key="file.Name">{{file.Name}}<br></span>
        </q-tooltip>
      </span>
      <span>
        <q-btn
          :disable="!currentFile || currentStorage.Type === 'shared' || (currentStorage.Type === 'encrypted' && isFolder) || loadingProgress() || isArchive()"
          flat color="primary" icon="link" @click="linkDialog(null)"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Create secure link
        </q-tooltip>
      </span>
      <span v-if="enableSharedFiles && currentStorage.Type !== 'shared'">
        <q-btn
          :disable="!currentFile || (currentStorage.Type === 'encrypted' && isFolder) || currentStorage.Type === 'corporate' || loadingProgress() || isArchive()"
          flat color="primary" icon="share" @click="share(null)"
        />
           <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]">
          Share with teammates
        </q-tooltip>
      </span>
      <q-space/>
      <q-btn flat color="primary" icon="sync" @click="syncFiles"/>
      <!-- <q-btn flat color="primary" label="Flat" /> -->
    </div>
    <q-dialog v-model="createFolderDialog" @escape-key="cancelDialog">
      <q-card class="q-dialog-size q-pt-md q-ml-md q-mr-md" style="min-width: 400px">
        <q-item>
          <q-item-section>
            <q-item-label>New folder</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined autofocus dense v-model="folderName" style="width: 250px" @keyup.enter.prevent="createNewFolder"/>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat :ripple="false" color="primary" @click="createNewFolder"
                 label="Create" />
          <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancelDialog"
                 label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmCopyDialog">
      <q-card class="q-dialog-size" style="min-width: 300px">
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>{{ titleAfterCopying }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" v-close-popup
                 label="Ok" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmWarningDialog">
      <q-card class="q-dialog-size" style="min-width: 300px">
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>Some of the files you send are encrypted. To decrypt them, recipient will need Initialization Vector (IV) and AES key.</q-item-label>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat class="q-px-sm" :ripple="false" color="primary"
                 label="Ok" @click="saveFilesAsTempFiles(filesForSending)"/>
          <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" v-close-popup
                 label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <delete-items-dialog ref="deleteItemDialog" :items="checkedItems" @removeItems="removeFiles" :currentFile="currentFile"/>
    <rename-item-dialog ref="renameItemDialog" @renameItem="renameItem" />
    <share-with-teammates-dialog ref="shareWithTeammatesDialog"></share-with-teammates-dialog>
    <shareable-link-dialog ref="shareableLinkDialog" :file="currentFile"/>
  </div>
</template>

<style></style>

<script>
import DeleteItemsDialog from './DeleteItemsDialog'
import RenameItemDialog from './RenameItemDialog'
import ShareWithTeammatesDialog from './ShareWithTeammatesDialog'
import ShareableLinkDialog from './ShareableLinkDialog'

import { ipcRenderer } from 'electron'
import filesSettings from 'src/modules/files/settings'
import text from "../../utils/text";
import notification from "../../utils/notification";

export default {
  name: 'Toolbar',
  components: {
    DeleteItemsDialog,
    RenameItemDialog,
    ShareWithTeammatesDialog,
    ShareableLinkDialog
  },
  props: {
    currentFile: Object,
    files: Array,
    folders: Array
  },
  data () {
    return {
      createFolderDialog: false,
      confirmCopyDialog: false,
      folderName: '',
      titleAfterCopying: '',
      confirmWarningDialog: false,
      filesForSending: null,
      recipients: []
    }
  },
  mounted() {
    this.getRecipients()
  },
  computed: {
    enableSharedFiles () {
      return filesSettings.enableSharedFiles
    },
    checkedItems () {
      const currentFiles = this.folders.concat(this.files)
      const hashes = this.$store.getters['files/getCheckedItems']
      return  hashes.map( hash => {
        return currentFiles.find( file => file.Hash === hash )
      })
    },
    hasRecipients () {
      return !!this.recipients.length
    },
    copiedFiles () {
      return this.$store.getters['files/getCopiedFiles']
    },
    isFolder () {
      return this.currentFile ? this.currentFile.IsFolder : false
    },
    currentStorage () {
      return this.$store.getters['files/getCurrentStorage']
    },
    currentFolderPath () {
      return this.$store.getters['files/getCurrentPath']
    },
    availabilityPastAction () {
      let copiedFilesType = ''
      if (this.copiedFiles.files.length) {
        copiedFilesType = this.copiedFiles.files[0].FromType
      }
      return !this.copiedFiles.files.length > 0
        || (this.currentStorage.Type !== copiedFilesType && copiedFilesType === 'encrypted')
        || (copiedFilesType !== 'encrypted' && this.currentStorage.Type === 'encrypted')
        || this.currentStorage.Type === 'shared'
    },
  },
  methods: {
    isArchive () {
      let currentPath = this.$store.getters['files/getCurrentPath']
      return currentPath.split('.')[currentPath.split('.').length - 1] === 'zip'
    },
    cancelDialog () {
      this.createFolderDialog = false
    },
    createNewFolder () {
      if (text.validateFileOrFolderName(this.folderName)) {
        this.$store.dispatch('files/createFolder', {
          type: this.currentStorage.Type,
          path: this.currentFolderPath,
          folderName: this.folderName
        })
        this.createFolderDialog = false
        this.folderName = ''
      } else {
        notification.showError('Invalid folder name')
      }
    },
    showCreateNewFolderDialog () {
      this.folderName = ''
      this.createFolderDialog = true
    },
    downloadFile () {
      this.$emit('downloadFile')
    },
    loadingProgress () {
      let loading = false
      this.checkedItems.map( item => {
        if (item?.Loading) {
          loading = true
        }
      })
      return loading
    },
    sendFile () {
      let hasEncryptFile = false
      let files = this.checkedItems.map( item => {
        if (item.isEncrypted()) {
          hasEncryptFile = true
        }
        return {
          Storage: item.Type,
          Path: item.Path,
          Name: item.Name,
          Id: item.Id,
          IsEncrypted: false
        }
      })
      this.filesForSending = files
      if (hasEncryptFile) {
        this.confirmWarningDialog = true
      } else {
        this.saveFilesAsTempFiles(files)
      }
    },
    getRecipients() {
      ipcRenderer.once('contacts-get-frequently-used-contacts', (oEvent, {aContacts}) => {
        this.recipients = aContacts
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', {sSearch: '', storage: 'team'})
    },
    saveFilesAsTempFiles (files) {
      this.confirmWarningDialog = false
      this.$store.dispatch('files/saveFilesAsTempFiles', {
        files
      }).then(res => {
        this.openCompose({
          aAttachments: res
        })
      })
    },
    share (file = null) {
      let currentFile = null
      if (file) {
        currentFile = file
      } else {
        currentFile = this.currentFile
      }
      this.$refs.shareWithTeammatesDialog.openDialog(currentFile)
    },
    linkDialog (file = null) {
      let currentFile = null
      if (file) {
        currentFile = file
      } else {
        currentFile = this.currentFile
      }
      this.$refs.shareableLinkDialog.openDialog(currentFile)
    },
    editFile () {
      this.$refs.renameItemDialog.openDialog(this.currentFile.Name)
    },
    renameItem (name) {
      this.$store.dispatch('files/renameItem', {
        type: this.currentStorage.Type,
        path: this.currentFolderPath,
        name: this.currentFile.Name,
        newName: name,
        isLink: 0,
        isFolder: this.currentFile.IsFolder
      })
      this.currentFile.ChangeName(name)
      this.currentFile.ChangeFullPath(name)
    },
    openRemoveItemsDialog (oMouseEvent) {
        this.$refs.deleteItemDialog.openDialog()
    },
    removeFiles () {
      this.$store.dispatch('files/removeFiles', {
        type: this.currentStorage.Type,
        path: this.currentFolderPath,
        items: this.checkedItems,
        currentFiles: {
          files: this.files,
          folders: this.folders
        }
      })
    },
    cutFile () {
      this.titleAfterCopying = 'Items have been cut. Choose a destination folder and click Paste button to move them.'
      this.confirmCopyDialog = true
      let files = this.checkedItems.map( item => {
        return {
          FromType: item.Type,
          FromPath: item.Path,
          Name: item.Name,
          IsFolder: item.IsFolder
        }
      })
      this.$store.dispatch('files/copyFiles', {
        fromType: this.currentStorage.Type,
        fromPath: this.currentFolderPath,
        isCut: true,
        files: files
      })
    },
    copyFile () {
      this.titleAfterCopying = 'Items have been copied. Choose a destination folder and click Paste button to insert them.'
      this.confirmCopyDialog = true
      let files = this.checkedItems.map( item => {
        return {
          FromType: item.Type,
          FromPath: item.Path,
          Name: item.Name,
          IsFolder: item.IsFolder
        }
      })
      this.$store.dispatch('files/copyFiles', {
        fromType: this.currentStorage.Type,
        fromPath: this.currentFolderPath,
        isCut: false,
        files: files
      })
    },
    pastFile () {
      this.$store.dispatch('files/pastFiles', {
        toType: this.currentStorage.Type,
        toPath: this.currentFolderPath,
      })
    },
    syncFiles () {
      this.$store.dispatch('files/getFiles', {
        currentStorage: this.currentStorage.Type,
        path: this.currentFolderPath,
      })
    }
  }
}
</script>
