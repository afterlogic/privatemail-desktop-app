<template>
  <div>
    <q-toolbar>
      <q-btn :disable="!currentStorage" flat color="primary" icon="create_new_folder" @click="showCreateNewFolderDialog" />
      <!--<q-btn flat color="primary" label="Shortcut" @click=""/>-->
      <q-btn :disable="!currentFile" flat color="primary" label="Download" @click="downloadFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="alternate_email" @click="sendFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="edit" @click="editFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="link" @click="createSecureLink" />
      <q-btn :disable="!currentFile" flat color="primary" icon="delete_outlined" :label="checkedItems.length > 0 ? checkedItems.length : ''" @click="openRemoveItemsDialog" />
      <q-btn :disable="!currentFile" flat color="primary" label="cut" @click="cutFile" />
      <q-btn :disable="!currentFile" flat color="primary" icon="file_copy" @click="copyFile" />
      <q-btn :disable="!currentFile" flat color="primary" label="past" @click="pastFile" />
      <q-space/>
      <q-btn flat color="primary" icon="sync" @click="syncFiles" />
      <!-- <q-btn flat color="primary" label="Flat" /> -->
    </q-toolbar>
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
    <delete-items-dialog ref="deleteItemDialog" :items="checkedItems" @removeItems="removeFiles"></delete-items-dialog>
  </div>
</template>

<style></style>

<script>
import DeleteItemsDialog from './DeleteItemsDialog'

export default {
  name: 'Toolbar',
  components: {
    DeleteItemsDialog
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
    createNewFolder (){
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
      console.log('Comming soon')
    },
    sendFile () {
      console.log('Comming soon')
    },
    editFile () {
      console.log('Comming soon')
    },
    createSecureLink () {
      console.log('Comming soon')
    },
    openRemoveItemsDialog () {
      this.$refs.deleteItemDialog.openDialog()
      console.log('Comming soon')
    },
    removeFiles () {
      this.$store.dispatch('files/removeFiles', {
        type: this.currentStorage.Type,
        path: this.currentFolderPath,
        items: this.checkedItems
      })
    },
    cutFile () {
      console.log('Comming soon')
    },
    copyFile () {
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
