<template>
  <div>
  <q-tabs v-if="editAccount"
          v-model="mailTab"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-tab name="props" label="Properties" />
    <q-tab name="folders" label="Manage Folders" />
    <q-tab name="forward" label="Forward" @click="getForward"/>
    <q-tab name="autoresponder" label="Autoresponder" @click="getAutoresponder"/>
  </q-tabs>

  <q-separator v-if="editAccount" />

  <q-tab-panels v-if="editAccount"
                v-model="mailTab"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
  >
    <q-tab-panel name="props" class="bg-grey-1">
      <q-list class="non-selectable">
        <q-item tag="label">
          <q-item-section side top>
            <q-checkbox v-model="bUseThreading" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Use mail threading if supported by the server</q-item-label>
          </q-item-section>
        </q-item>

        <q-item tag="label">
          <q-item-section side top>
            <q-checkbox v-model="bSaveRepliesToCurrFolder" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Save replies to the current folder</q-item-label>
            <q-item-label caption>
              When enabled, threads will include your replies and thus will look more complete.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="!bDefaultAccount">
          <q-item-section>
            <q-item-label>
              <q-btn unelevated outline color="warning" label="Remove account" @click="openRemoveAccountDialog" />
            </q-item-label>
            <q-item-label caption>
              Removes this account from the list. It won't delete the actual account from the mail server.
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator spaced />
      <div class="q-pa-md row ">
        <q-btn unelevated color="primary" v-if="bAccountSaving" label="Saving..." />
        <q-btn unelevated color="primary" v-if="!bAccountSaving" label="Save" @click="saveAccountSettings" />
        <q-space />
        <q-btn unelevated color="primary" v-if="bAllowChangePasswordOnMailServer" label="Change Password" @click="openChangePassword" />
      </div>
    </q-tab-panel>
    <q-tab-panel name="folders" class="bg-grey-1">
      <q-list padding bordered>
        <div v-if="!isEditAccount">
          <ManageFolders v-for="folder in foldersTree" :key="folder.Hash" :folder="folder" :isEditAccount="isEditAccount" :iAccountId="iEditAccountId"></ManageFolders>
        </div>
        <div v-else>
          <ManageFolders v-for="folder in editFoldersTree" :key="folder.Hash" :folder="folder" :isEditAccount="isEditAccount" :iAccountId="iEditAccountId"></ManageFolders>
        </div>
        <q-item  clickable v-ripple style="height: 50px">
          <q-item-section avatar style="margin-left: 15px">
            Total
          </q-item-section>
          <q-item-section avatar style="margin-left: auto; padding-right: 100px">
            {{ totalScore() }}
          </q-item-section>
        </q-item>
        <div class="folders-line">
          Deleting non-empty folders is not allowed. To delete such folder, delete its contents first.
        </div>
        <div class="folders-line">
          To match a special folder (like Sent) and certain IMAP mailbox, click Setup special folders.
        </div>

        <div class="buttons q-mb-md q-mt-md q-mr-md" v-if="allowAddNewAccount">
          <q-btn unelevated color="primary" label="Add New Folder" @click="createFolder"/>
          <q-btn unelevated color="primary" class="on-left" label="Setup special folders" @click="displaySpecialFoldersDialog" />
        </div>

        <q-dialog v-model="bCreateFolder" persistent>
          <q-card class="q-px-sm non-selectable">
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
          <q-card class="q-px-sm non-selectable">
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
              <q-btn  flat color="primary" label="OK" @click="setupSpecialFolders"/>
              <q-btn flat color="grey-6" label="Cancel" v-close-popup/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-list>
    </q-tab-panel>
    <q-tab-panel name="forward" class="bg-grey-1">
      <div class="q-pa-md">
        <q-item>
          <q-item-section side top>
            <q-checkbox v-model="bEnableForward" label="Enable forward"/>
          </q-item-section>
        </q-item>
        <q-item class="items-center">
          <q-item-section side top>
            <span class="q-ml-sm">Email</span>
          </q-item-section>
          <q-item-section side top>
            <q-input :disable="!bEnableForward" v-model="forwardEmail" outlined bg-color="white" :dense=true style="width: 350px; margin-left: 100px"/>
          </q-item-section>
        </q-item>
      </div>
      <q-separator spaced/>
      <q-card-actions align="right">
        <q-btn style="margin-left: 20px; width: 80px" color="primary" label="Save" @click="updateForward"/>
      </q-card-actions>
    </q-tab-panel>
    <q-tab-panel name="autoresponder" class="autoresponder bg-grey-1">
      <div class="q-pa-md">
        <q-item tag="label">
          <q-item-section side top>
            <q-checkbox v-model="oAutoresponder.enableAutoresponder"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Enable autoresponder</q-item-label>
          </q-item-section>
        </q-item>
        <div class="row" style="margin-left: 18px">
          <div class="col-2">
            <span class="q-ml-sm">Subject</span>
          </div>
          <div class="col">
            <q-input
              :disable="!oAutoresponder.enableAutoresponder"
              v-model="oAutoresponder.subject" outlined
              :dense=true bg-color="white" style="width: 100%;"
            />
          </div>
        </div>

        <div class="row" style="margin-left: 18px">
          <div class="col-2">
            <span class="q-ml-sm">Message</span>
          </div>
          <div class="col">
            <q-editor
              bg-color="white"
              :disable="!oAutoresponder.enableAutoresponder"
              v-model="oAutoresponder.message"
              :definitions="{
                  bold: {label: 'Bold', icon: null, tip: 'My bold tooltip'}
                }"
            />
          </div>
        </div>
      </div>
      <q-separator spaced />
      <q-card-actions align="right">
        <q-btn style="margin-right: 10px; width: 80px" color="primary" label="Save" @click="updateAutoresponder"/>
      </q-card-actions>
    </q-tab-panel>
    <q-tab-panel name="filters">
      <q-item-label header>Filters</q-item-label>
    </q-tab-panel>
  </q-tab-panels>

    <q-dialog v-model="bRemoveAccountDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">{{ editAccount ? editAccount.sEmail : '' }}</div>
        </q-card-section>

        <q-item>
          <q-item-label>Are you sure you want to remove account?</q-item-label>
        </q-item>

        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" @click="removeAccount" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import ManageFolders from "../ManageFolders";
import mailSettings from "../../../modules/mail/settings";
import cServer from "../../../modules/mail/classes/cServer";
import {ipcRenderer} from "electron";
import notification from "../../../utils/notification";
import errors from "../../../utils/errors";
import mailEnums from "../../../modules/mail/enums";

export default {
  name: "editAccountsUI",
  components: {
    ManageFolders
  },

  data () {
    return {
      mailTab: 'props',
      identityTab: 'props',
      aliasTab: 'props',

      iEditAccountId: -1,
      iEditIdentityId: -1,
      iEditIdentityAccountId: -1,
      iEditAliasAccountId: -1,
      iEditAliasId: -1,

      // enableAutoresponder: false,
      // autoresponderSubject: '',
      // autoresponderMessage: '',
      // enableForward: '',
      forwardEmail: '',

      bDefaultAccount: false,
      bUseThreading: false,
      bSaveRepliesToCurrFolder: false,
      bAccountSaving: false,
      bRemoveAccountDialog: false,
      bAddNewAccountDialog: false,
      sNewAccountName: '',
      sNewAccountEmail: '',
      sNewAccountPassword: '',
      bAddingNewAccount: false,
      bSecondStepOfAddAccount: false,
      sNewAccountLogin: '',
      oNewAccountServer: {
        label: 'Configure manually',
        value: null,
      },
      sNewAccountImapServer: '',
      sNewAccountImapPort: 143,
      bNewAccountImapSsl: false,
      sNewAccountSmtpServer: '',
      iNewAccountSmtpPort: 25,
      bNewAccountSmtpSsl: false,
      bNewAccountSmtpAuth: true,

      bAllowChangePasswordOnMailServer: false,
      bChangeAccountPasswordDialog: false,
      sChangePasswordCurrent: '',
      sChangePasswordNew: '',
      sChangePasswordConfirmNew: '',
      bChangingPassword: false,
      bWarningAboutLogoutDialog: false,

      bAllowIdentities: false,
      bIdentityIsAccountPart: false,
      bIdentityDefault: false,
      bIdentityDisableDefault: false,
      sIdentityName: '',
      sIdentityEmail: '',
      aIdentityEmailOptions: [],
      bIdentityDisableEmail: false,
      bIdentityNoSignature: false,
      sIdentitySignature: '',
      bIdentitySaving: false,
      bRemoveIdentityDialog: false,
      bNewIdentityDialog: false,
      sNewIdentityName: '',
      sNewIdentityEmail: '',
      aNewIdentityEmailOptions: [],
      iNewIdentityAccountId: -1,
      bNewIdentityDisableEmail: false,
      bNewIdentityAdding: '',

      bAllowAliases: false,
      sAliasName: '',
      bAliasNoSignature: false,
      sAliasSignature: '',
      bAliasSaving: false,
      bRemoveAliasDialog: false,
      bNewAliasDialog: false,
      sNewAliasName: '',
      sNewAliasDomain: '',
      aNewAliasDomainOptions: [],
      bNewAliasAdding: false,
      nTotal: 0,
      bCreateFolder: false,
      aFolderList: [],
      sNewFolderName: '',
      sParentName: 'No Parent',
      bDisplaySpecialFoldersDialog: false,
      oSpecialFoldersOptions: {
        'Sent': '',
        'Drafts': '',
        'Trash': '',
        'Spam': ''
      },
      isEditAccount: false,
      bEnableForward: false,
      oAutoresponder: {
        enableAutoresponder: false,
        subject: '',
        message: ''
      }
    }
  },

  computed: {
    accounts () {
      return this.$store.getters['mail/getAccounts']
    },
    editAccount () {
      return _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === this.iEditAccountId
      })
    },
    allowAddNewAccount () {
      return mailSettings.bAllowAddAccounts && (mailSettings.bAllowMultiAccounts || this.accounts.length === 0)
    },
    newAccountServerOptions () {
      let aServers = this.$store.getters['mail/getServers']
      let aNewAccountServerOptions = _.map(aServers, function (oServer) {
        return {
          label: oServer.sName,
          value: oServer,
        }
      })
      aNewAccountServerOptions.push({
        label: 'Configure manually',
        value: null,
      })
      return aNewAccountServerOptions
    },
    existingServerSelected () {
      return this.oNewAccountServer && this.oNewAccountServer.value instanceof cServer
    },
    identities () {
      return this.$store.getters['mail/getIdentities']
    },
    editIdentity () {
      let aIdentityAccountIdentities = this.identities[this.iEditIdentityAccountId] || []
      return _.find(aIdentityAccountIdentities, (oIdentity) => {
        return oIdentity.iEntityId === this.iEditIdentityId
      })
    },
    editAlias () {
      let aAliasAccount = _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === this.iEditAliasAccountId
      })

      if (_.isArray(aAliasAccount && aAliasAccount.aAliases)) {
        return _.find(aAliasAccount.aAliases, (oAlias) => {
          return oAlias.iEntityId === this.iEditAliasId
        })
      }
      return null
    },
    foldersTree () {
      return this.$store.getters['mail/getCurrentFoldersTree']
    },
    editFoldersTree () {
      return this.$store.getters['mail/getEditFoldersTree']
    }
  },

  watch: {
    accounts () {
      if (!this.editAccount && this.accounts.length > 0) {
        this.iEditAccountId = this.accounts[0].iAccountId
      }
    },
    '$route.params.accountId': function () {
      this.iEditAccountId = Number(this.$route.params.accountId)
      if (this.accounts.length > 0) {
        this.changeEditAccount(Number(this.$route.params.accountId))
      }
      this.bAllowIdentities = mailSettings.bAllowIdentities
      this.bAllowAliases = mailSettings.bAllowAliases
    },
    editAccount () {
      if (this.editAccount) {
        this.bDefaultAccount = this.editAccount.bDefault
        this.bUseThreading = this.editAccount.bUseThreading
        this.bSaveRepliesToCurrFolder = this.editAccount.bSaveRepliesToCurrFolder
        this.bAllowChangePasswordOnMailServer = !!this.editAccount.oExtend.AllowChangePasswordOnMailServer
      }
    },

    editAlias () {
      if (this.editAlias) {
        this.sAliasName = this.editAlias.sFriendlyName
        this.bAliasNoSignature = !this.editAlias.bUseSignature
        this.sAliasSignature = this.editAlias.sSignature
      }
    },
    iEditAccountId () {
      this.getForward()
      this.getAutoresponder()
    }
  },

  mounted () {
    if (this.iEditAccountId === -1 && this.accounts.length > 0) {
      this.changeEditAccount(Number(this.$route.params.accountId))
    }
    this.bAllowIdentities = mailSettings.bAllowIdentities
    this.bAllowAliases = mailSettings.bAllowAliases
    this.initSubscriptions()
  },
  beforeDestroy: function () {
    this.destroySubscriptions()
  },
  methods: {
    changeEditAccount (iAccountId) {
      if (iAccountId !== this.$store.getters['mail/getCurrentAccountId']) {
        this.isEditAccount = true
        let parameters = {bEditAccount: true, iEditAccountId: iAccountId}
        this.$store.dispatch('mail/asyncGetFolderList', parameters)
      } else {
        this.isEditAccount = false
      }
      this.iEditAccountId = iAccountId
      this.iEditIdentityAccountId = -1
      this.iEditIdentityId = -1
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
    },
    saveAccountSettings () {
      this.bAccountSaving = true
      ipcRenderer.send('mail-save-account-settings', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        iAccountId: this.iEditAccountId,
        bUseThreading: this.bUseThreading,
        bSaveRepliesToCurrFolder: this.bSaveRepliesToCurrFolder,
      })
    },
    onSaveAccountSettings (oEvent, { bResult, iAccountId, bUseThreading, bSaveRepliesToCurrFolder, oError }) {
      this.bAccountSaving = false
      if (bResult) {
        notification.showReport('Settings have been updated successfully.')
        this.$store.commit('mail/setAccountSettings', { iAccountId, bUseThreading, bSaveRepliesToCurrFolder })
        this.$store.dispatch('mail/asyncRefresh', false)
        if (iAccountId === this.iEditAccountId) {
          this.bUseThreading = bUseThreading
          this.bSaveRepliesToCurrFolder = bSaveRepliesToCurrFolder
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
      }
    },
    openRemoveAccountDialog () {
      if (!this.bDefaultAccount) {
        this.bRemoveAccountDialog = true
      }
    },
    removeAccount () {
      if (!this.bDefaultAccount) {
        ipcRenderer.send('mail-remove-account', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditAccountId,
        })
      }
    },
    openChangePassword () {
      this.bChangeAccountPasswordDialog = true
      this.sChangePasswordCurrent = ''
      this.sChangePasswordNew = ''
      this.sChangePasswordConfirmNew = ''
    },
    changePassword () {
      if (this.sChangePasswordNew !== this.sChangePasswordConfirmNew) {
        notification.showError('Passwords do not match')
      } else {
        this.bChangingPassword = true
        ipcRenderer.send('mail-change-password', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditAccountId,
          sCurrentPassword: this.sChangePasswordCurrent,
          sNewPassword: this.sChangePasswordNew,
        })
      }
    },
    initSubscriptions() {
      ipcRenderer.on('mail-save-account-settings', this.onSaveAccountSettings)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-account-settings', this.onSaveAccountSettings)
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
      return removeFolderTree(this.foldersTree)
    },
    createFolder() {
      this.bCreateFolder = true
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
    resetForm() {
      this.sNewFolderName = ''
      this.sParentName = 'No Parent'
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
    updateForward() {
      if (this.bEnableForward) {
        let oParameters = {
          AccountID: this.iEditAccountId,
          Enable: this.bEnableForward,
          Email: this.forwardEmail
        }
        ipcRenderer.send('mail-update-forward', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          oParameters: oParameters
        })

        ipcRenderer.once('mail-update-forward', (event, {bResult, oError}) => {
          if (bResult) {

          } else {
            notification.showError(errors.getText(oError, 'Error setup forward email.'))
          }
        })
      }
    },
    getForward() {
      if (this.iEditAccountId !== -1) {
        ipcRenderer.send('mail-get-forward', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditAccountId
        })
      }
      ipcRenderer.once('mail-get-forward', (event, {bResult, oError}) => {
        if (bResult) {
          this.forwardEmail = bResult.Email
          this.bEnableForward = bResult.Enable
        }
      })
    },
    updateAutoresponder() {
      let oParameters = {
        AccountID: this.iEditAccountId,
        Enable: this.oAutoresponder.enableAutoresponder,
        Subject: this.oAutoresponder.subject,
        Message: this.oAutoresponder.message
      }
      ipcRenderer.send('mail-update-autoresponder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        oParameters: oParameters
      })
      ipcRenderer.once('mail-update-autoresponder', (event, {bResult, oError}) => {
        if (bResult) {
          notification.showReport('Autoresponder has been updated successfully.')
        } else {
          notification.showError(errors.getText(oError, 'Error setup forward email.'))
        }
      })
    },
    getAutoresponder() {
      if (this.iEditAccountId !== -1) {
        ipcRenderer.send('mail-get-autoresponder', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditAccountId
        })
      }
      ipcRenderer.once('mail-get-autoresponder', (event, {bResult, oError}) => {
        if (bResult) {
          this.oAutoresponder.enableAutoresponder = bResult.Enable
          this.oAutoresponder.subject = bResult.Subject
          this.oAutoresponder.message = bResult.Message
        } else {
          this.oAutoresponder.enableAutoresponder = false
          this.oAutoresponder.subject = ''
          this.oAutoresponder.message = ''
        }
      })
    }
  },
}
</script>

<style scoped>

</style>
