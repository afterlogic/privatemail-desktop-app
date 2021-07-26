<template>
  <div>
    <div class="row q-pa-sm items-center">
      <q-btn :disable="!currentStorage" flat color="primary" icon="create_new_folder" @click="showCreateNewFolderDialog" />
      <!--<q-btn flat color="primary" label="Shortcut" @click=""/>-->
      <q-btn :disable="!currentFile || isFolder" flat color="primary" label="Download" @click="downloadFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="alternate_email" @click="sendFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="edit" @click="editFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="link" @click="createSecureLink" />
      <span>
         <q-btn :disable="!currentFile" flat color="primary" icon="delete_outlined" :label="checkedItems.length > 0 ? checkedItems.length : ''" @click="openRemoveItemsDialog" />
      </span>
      <q-btn :disable="!currentFile" flat color="primary" label="cut" @click="cutFile" />
      <span>
        <q-btn :disable="!currentFile" flat color="primary" icon="file_copy" @click="copyFile" />
      </span>
      <q-btn :disable="!currentFile" flat color="primary" icon="content_paste" :label="copiedFiles.files.length > 0 ? copiedFiles.files.length : ''" @click="pastFile" />
      <q-space/>
      <q-btn flat color="primary" icon="sync" @click="syncFiles" />
      <!-- <q-btn flat color="primary" label="Flat" /> -->
    </div>
    <q-dialog v-model="createFolderDialog" persistent>
      <q-card class="q-dialog-size" style="min-width: 300px">
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>New folder</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense v-model="folderName" />
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat :ripple="false" color="primary" @click="createNewFolder"
                 label="Save" />
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancelDialog"
                 label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <delete-items-dialog ref="deleteItemDialog" :items="checkedItems" @removeItems="removeFiles" />
    <rename-item-dialog ref="renameItemDialog" @renameItem="renameItem" />
  </div>
</template>

<style></style>

<script>
import DeleteItemsDialog from './DeleteItemsDialog'
import RenameItemDialog from './RenameItemDialog'

export default {
  name: 'Toolbar',
  components: {
    DeleteItemsDialog,
    RenameItemDialog
  },
  data () {
    return {
      createFolderDialog: false,
      folderName: ''
    }
  },
  computed: {
    checkedItems () {
      return this.$store.getters['files/getCheckedItems']
    },
    copiedFiles () {
      return this.$store.getters['files/getCopiedFiles']
    },
    isFolder () {
      const file = this.$store.getters['files/getCurrentFile']
      console.log(file, 'filefilefile')
      return file?.IsFolder
    },
    currentFile () {
      return this.$store.getters['files/getCurrentFile']
    },
    currentStorage () {
      return this.$store.getters['files/getCurrentStorage']
    },
    currentFolderPath () {
      return this.$store.getters['files/getCurrentPath']
    }
  },
  methods: {
    cancelDialog () {
      this.createFolderDialog = false
    },
    createNewFolder () {
      this.$store.dispatch('files/createFolder', {
        type: this.currentStorage.Type,
        path: this.currentFolderPath,
        folderName: this.folderName
      })
      this.createFolderDialog = false
      this.folderName = ''
    },
    showCreateNewFolderDialog () {
      this.createFolderDialog = true
    },
    downloadFile () {
      this.$emit('downloadFile')
    },
    sendFile () {
      console.log('Comming soon')
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
    },
    createSecureLink () {
      console.log('Comming soon')
    },
    openRemoveItemsDialog () {
      this.$refs.deleteItemDialog.openDialog()
    },
    removeFiles () {
      this.$store.dispatch('files/removeFiles', {
        type: this.currentStorage.Type,
        path: this.currentFolderPath,
        items: this.checkedItems
      })
    },
    cutFile () {
      console.log('cutFile', this.$store.getters['files/getCopiedFiles'])
    },
    copyFile () {
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
        files: files
      })
      console.log('Comming soon')
    },
    pastFile () {
      console.log('Comming soon')
    },
    syncFiles () {
      console.log('Comming soon')
    }
  }
}
</script>
