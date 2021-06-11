<template>
  <div>
    <q-list padding bordered>
      <div v-if="!isEditAccount">
        <EditFolders v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :isEditAccount="isEditAccount"
                       :iAccountId="iEditAccountId"></EditFolders>
      </div>
      <div v-else-if="editFoldersTree.length">
        <EditFolders  v-for="folder in editFoldersTree" :key="folder.Hash" :folder="folder"
                       :isEditAccount="isEditAccount" :iAccountId="iEditAccountId"></EditFolders>
      </div>
      <q-item clickable v-ripple style="height: 50px">
        <q-item-section avatar style="margin-left: 15px">
          Total
        </q-item-section>
        <q-item-section avatar style="margin-left: auto; padding-right: 100px">
          {{ totalScore() }}
        </q-item-section>
      </q-item>
      <div class="folders-line q-ml-md">
        Deleting non-empty folders is not allowed. To delete such folder, delete its contents first.
      </div>
      <div class="folders-line q-ml-md">
        To match a special folder (like Sent) and certain IMAP mailbox, click Setup special folders.
      </div>

      <div class="buttons q-mb-md q-mt-md q-mr-md q-ml-md" v-if="allowAddNewAccount">
        <q-btn unelevated color="primary" label="Add New Folder" @click="createFolder"/>
        <q-btn unelevated color="primary" class="on-left" label="Setup special folders"
               @click="displaySpecialFoldersDialog"/>
      </div>

      <q-dialog v-model="bCreateFolder" persistent>
        <q-card class="q-px-sm non-selectable q-dialog-size">
          <q-card-section>
            <div class="text-h6"> New Folder</div>
          </q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label>Parent Folder</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                flat
                outlined
                dense
                v-model="sParentName"
                :options="createFoldersArray(isEditAccount? editFoldersTree: foldersTree)"
                style="width: 300px;"
                color="primary"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Folder Name</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input
                class="q-ml-md"
                flat
                outlined
                dense
                style="width: 300px;"
                v-model="sNewFolderName"
                lazy-rules
              />
            </q-item-section>
          </q-item>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="OK" @click="createNewFolder"/>
            <q-btn flat color="grey-6" label="Cancel" @click="resetForm" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="bDisplaySpecialFoldersDialog" persistent>
        <q-card class="q-px-sm non-selectable q-dialog-size">
          <q-card-section>
            <div class="text-h6">Setup special folders</div>
          </q-card-section>
          <q-card-section>
            <div>Which IMAP mailboxes to use for pre-defined folders.</div>
          </q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label>Sent</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                outlined
                dense
                v-model="oSpecialFoldersOptions['Sent']"
                :options="specialFoldersOptions()"
                style="width: 300px;"
                color="primary"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Drafts</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                outlined
                dense
                v-model="oSpecialFoldersOptions['Drafts']"
                :options="specialFoldersOptions()"
                style="width: 300px;"
                color="primary"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Trash</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                outlined
                dense
                v-model="oSpecialFoldersOptions['Trash']"
                :options="specialFoldersOptions()"
                style="width: 300px;"
                color="primary"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Spam</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                outlined
                dense
                v-model="oSpecialFoldersOptions['Spam']"
                :options="specialFoldersOptions()"
                style="width: 300px;"
                color="primary"
              />
            </q-item-section>
          </q-item>
          <q-card-actions align="right">
            <q-btn flat color="primary" label="OK" @click="setupSpecialFolders"/>
            <q-btn flat color="grey-6" label="Cancel" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-list>
  </div>
</template>

<script>
import {ipcRenderer} from "electron";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";
import mailSettings from "../../../../modules/mail/settings";
import mailEnums from "../../../../modules/mail/enums";
import EditFolders from "./EditFolders";

export default {
  name: "ManageFolders",
  props: {
    accounts: {
      type: Array
    },
    isEditAccount: {
      type: Boolean
    },
  },
  components: {
    EditFolders
  },
  data() {
    return {
      iEditAccountId: -1,
      bCreateFolder: false,
      sParentName: 'No Parent',
      sNewFolderName: '',
      bDisplaySpecialFoldersDialog: false,
      oSpecialFoldersOptions: {
        'Sent': '',
        'Drafts': '',
        'Trash': '',
        'Spam': ''
      },
    }
  },
  mounted () {
    this.iEditAccountId = Number(this.$route.params.accountId)
    this.initSubscriptions()
  },
  beforeDestroy() {
    this.destroySubscriptions()
  },
  computed: {
    editAccount () {
      return _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === this.iEditAccountId
      })
    },
    foldersTree () {
      return this.$store.getters['mail/getCurrentFoldersTree']
    },
    editFoldersTree () {
      return this.$store.getters['mail/getEditFoldersTree']
    },
    allowAddNewAccount () {
      return mailSettings.bAllowAddAccounts && (mailSettings.bAllowMultiAccounts || this.accounts.length === 0)
    },
  },
  watch: {
    '$route.params.accountId': function () {
      this.iEditAccountId = Number(this.$route.params.accountId)
    },
    editAccount () {
      if (this.editAccount) {
        this.bDefaultAccount = this.editAccount.bDefault
        this.bUseThreading = this.editAccount.bUseThreading
        this.bSaveRepliesToCurrFolder = this.editAccount.bSaveRepliesToCurrFolder
        this.bAllowChangePasswordOnMailServer = !!this.editAccount.oExtend.AllowChangePasswordOnMailServer
      }
    },
  },
  methods: {
    initSubscriptions() {

    },
    destroySubscriptions() {

    },
    totalScore() {
      function removeFolderTree(currentTree) {
        let score = 0
        for (let i = 0; i < currentTree.length; i++) {
          score += currentTree[i].Count
          if (currentTree[i].SubFolders.length > 0) {
            score += removeFolderTree(currentTree[i].SubFolders)
          }
        }
        return score
      }
      return removeFolderTree(this.isEditAccount ? this.editFoldersTree : this.foldersTree)
    },
    createFolder() {
      this.bCreateFolder = true
    },
    displaySpecialFoldersDialog() {
      let arr = this.createFoldersArray(this.isEditAccount ? this.editFoldersTree : this.foldersTree)
      arr.map(oFolder => {
        if (oFolder.type) {
          let folderName = oFolder['value'].split(oFolder.delimiter)
          folderName = folderName[folderName.length - 1]
          switch (oFolder.type) {
            case mailEnums.FolderType.Sent:
              this.oSpecialFoldersOptions.Sent = {
                label: folderName,
                value: oFolder['value']
              }
              break
            case mailEnums.FolderType.Drafts:
              this.oSpecialFoldersOptions.Drafts = {
                label: folderName,
                value: oFolder['value']
              }
              break
            case mailEnums.FolderType.Trash:
              this.oSpecialFoldersOptions.Trash = {
                label: folderName,
                value: oFolder['value']
              }
              break
            case mailEnums.FolderType.Spam:
              this.oSpecialFoldersOptions.Spam = {
                label: folderName,
                value: oFolder['value']
              }
              break
          }
        }
      })
      this.bDisplaySpecialFoldersDialog = true
    },
    createFoldersArray(foldersTree) {
      let aFolderList = ['No Parent']
      function createFoldersArray(currentTree, spaces, level) {
        for (let i = 0; i < currentTree.length; i++) {
          let displayName = currentTree[i].DisplayName !== '' ? currentTree[i].DisplayName : currentTree[i].Name
          if (currentTree[i].SubFolders.length > 0) {
            aFolderList.push({value: currentTree[i].FullName, label: spaces + displayName, type: currentTree[i].Type, delimiter: currentTree[i].Delimiter})
            level++
            if (level === 1) {
              createFoldersArray(currentTree[i].SubFolders, spaces, level)
            } else {
              createFoldersArray(currentTree[i].SubFolders, spaces + '&nbsp;&nbsp;&nbsp;&nbsp;', level)
            }
          } else {
            aFolderList.push({value: currentTree[i].FullName, label: spaces + displayName, type: currentTree[i].Type,  delimiter: currentTree[i].Delimiter})
          }
        }
      }
      createFoldersArray(foldersTree, '', 0)
      return aFolderList
    },
    createNewFolder() {
      if (this.sParentName === 'No Parent' || this.sParentName === '') {
        this.sParentName = {value: this.foldersTree[0].FullName, label: 'No Parent'}
      }
      ipcRenderer.send('mail-create-folder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        iAccountId: this.iEditAccountId,
        sFolderParentFullNameRaw: this.sParentName.value,
        sFolderName: this.sNewFolderName,
        sDelimiter: this.isEditAccount ? this.editFoldersTree[0].Delimiter: this.foldersTree[0].Delimiter
      })
      ipcRenderer.once('mail-create-folder', (event, {bResult, oError}) => {
        if (bResult) {
          this.sNewFolderName = ''
          this.sParentName = 'No Parent'
          this.bCreateFolder = false
          let parameters = {bEditAccount: this.isEditAccount, iEditAccountId: this.iEditAccountId}
          this.$store.dispatch('mail/asyncGetFolderList', parameters)
        } else {
          notification.showError(errors.getText(oError, 'Error creating folder.'))
        }
      })
    },
    resetForm() {
      this.sNewFolderName = ''
      this.sParentName = 'No Parent'
    },
    specialFoldersOptions() {
      let aFolderList = this.createFoldersArray(this.isEditAccount ? this.editFoldersTree : this.foldersTree)
      return aFolderList.map(oFolder => {
        if (oFolder.type) {
          let folderName = oFolder['value'].split(oFolder.delimiter)
          folderName = folderName[folderName.length - 1]
          switch (oFolder.type) {
            case mailEnums.FolderType.Inbox:
              oFolder.disable = true
              oFolder.label = folderName
              break
            case mailEnums.FolderType.Sent:
              oFolder.disable = true
              oFolder.label = folderName
              break
            case mailEnums.FolderType.Drafts:
              oFolder.disable = true
              oFolder.label = folderName
              break
            case mailEnums.FolderType.Spam:
              oFolder.disable = true
              oFolder.label = folderName
              break
            case mailEnums.FolderType.Trash:
              oFolder.disable = true
              oFolder.label = folderName
              break
            case mailEnums.FolderType.Scheduled:
              oFolder.disable = true
              oFolder.label = folderName
              break
          }
        }
        return oFolder
      })
    },
    setupSpecialFolders() {
      let oParameters = {
        AccountID: this.iEditAccountId,
        Sent: this.oSpecialFoldersOptions.Sent.value,
        Drafts: this.oSpecialFoldersOptions.Drafts.value,
        Trash: this.oSpecialFoldersOptions.Trash.value,
        Spam: this.oSpecialFoldersOptions.Spam.value,
      }
      ipcRenderer.send('mail-setup-system-folder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        oParameters: oParameters
      })
      ipcRenderer.once('mail-setup-system-folder', (event, {bResult, oError}) => {
        if (bResult) {
          let parameters = {bEditAccount: this.isEditAccount, iEditAccountId: this.iEditAccountId}
          this.$store.dispatch('mail/asyncGetFolderList', parameters)
          this.bDisplaySpecialFoldersDialog = false
        } else {
          notification.showError(errors.getText(oError, 'Error setup special folder.'))
        }
      })
    },
  }
}
</script>

<style scoped>

</style>
