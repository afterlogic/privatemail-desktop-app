<template>
<div>
  <q-tabs v-if="editAlias"
          v-model="aliasTab"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-tab name="props" label="Properties" />
    <q-tab name="signature" label="Signature" />
  </q-tabs>

  <q-separator v-if="editAlias" />

  <q-tab-panels v-if="editAlias"
                v-model="aliasTab"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
  >
    <q-tab-panel name="props" class="bg-grey-1">
      <q-list class="non-selectable" style="width: 450px;">
        <q-item>
          <q-item-section>
            <q-item-label>Your name</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense bg-color="white" class="input-size" v-model="sAliasName" v-on:keyup.enter="saveAliasSettings" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              <q-btn unelevated outline color="warning" label="Remove alias" @click="openRemoveAliasDialog" />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator spaced />
      <div class="q-pa-md">
        <q-btn unelevated color="primary" v-if="bAliasSaving" label="Saving..." />
        <q-btn unelevated color="primary" v-if="!bAliasSaving" label="Save" @click="saveAliasSettings" />
      </div>
    </q-tab-panel>

    <q-tab-panel name="signature" class="bg-grey-1">
      <MailAccountsSignatureTab :noSignature="bAliasNoSignature" :signature="sAliasSignature" :isSaving="bAliasSaving" :saveSignature="saveAliasSettings" />
    </q-tab-panel>
  </q-tab-panels>
  <q-dialog v-model="bRemoveAliasDialog" persistent>
    <q-card class="q-px-sm non-selectable">
      <q-card-section>
        <div class="text-h6">{{ editAlias ? editAlias.getFull() : '' }}</div>
      </q-card-section>

      <q-item>
        <q-item-label>Are you sure you want to remove alias? It will be deleted from the mail server too.</q-item-label>
      </q-item>

      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" @click="removeAlias" v-close-popup />
        <q-btn flat label="Cancel" color="grey-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</div>
</template>

<script>
import MailAccountsSignatureTab from "../MailAccountsSignatureTab";
import {ipcRenderer} from "electron";
import cServer from "../../../../modules/mail/classes/cServer";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";

export default {
  name: "editAliasUI",
  components: {
    MailAccountsSignatureTab,
  },
  data () {
    return {
      mailTab: 'props',
      identityTab: 'props',
      aliasTab: 'props',

      iEditIdentityId: -1,
      iEditIdentityAccountId: -1,
      iEditAliasAccountId: -1,
      iEditAliasId: -1,

      forwardEmail: '',

      bDefaultAccount: false,
      bUseThreading: false,
      bSaveRepliesToCurrFolder: false,
      bAccountSaving: false,
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
  mounted() {
    console.log('his.$route.params.identityIdhis.$route.params.identityIdhis.$route.params.identityId')
    if (this.editAlias) {
      this.sAliasName = this.editAlias.sFriendlyName
      this.bAliasNoSignature = !this.editAlias.bUseSignature
      this.sAliasSignature = this.editAlias.sSignature
    }
    this.initSubscriptions()
  },
  beforeDestroy: function () {
    this.destroySubscriptions()
  },
  computed: {
    accounts () {
      return this.$store.getters['mail/getAccounts']
    },
    tingServerSelected () {
      return this.oNewAccountServer && this.oNewAccountServer.value instanceof cServer
    },
    editAlias () {
      let aAliasAccount = _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === Number(this.$route.params.accountId)
      })
      if (_.isArray(aAliasAccount && aAliasAccount.aAliases)) {
        return _.find(aAliasAccount.aAliases, (oAlias) => {
          return oAlias.iEntityId === Number(this.$route.params.aliasId)
        })
      }
      return null
    },
  },
  watch: {
    '$route.params.aliasId': function () {
      this.changeEditAlias(this.$route.params.aliasId, this.$route.params.accountId)
      if (this.editAlias) {
        this.sAliasName = this.editAlias.sFriendlyName
        this.bAliasNoSignature = !this.editAlias.bUseSignature
        this.sAliasSignature = this.editAlias.sSignature
      }
    },
    accounts () {
      if (!this.editAccount && this.accounts.length > 0) {
        this.iEditAccountId = this.accounts[0].iAccountId
      }
    },
    editAlias () {
      if (this.editAlias) {
        this.sAliasName = this.editAlias.sFriendlyName
        this.bAliasNoSignature = !this.editAlias.bUseSignature
        this.sAliasSignature = this.editAlias.sSignature
      }
    },
  },
  methods: {
    changeEditAlias(iAliasId, iAliasAccountId) {
      this.iEditIdentityAccountId = -1
      this.iEditIdentityId = -1
      this.iEditAliasAccountId = iAliasAccountId
      this.iEditAliasId = iAliasId
    },
    saveAliasSettings(bAliasNoSignature, sAliasSignature) {
      if (this.editAlias) {
        this.bAliasSaving = true
        ipcRenderer.send('mail-save-alias-settings', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.editAlias.iIdAccount,
          iAliasId: this.iEditAliasId,
          sName: (this.aliasTab === 'props') ? this.sAliasName : undefined,
          bNoSignature: (this.aliasTab === 'signature') ? bAliasNoSignature : undefined,
          sSignature: (this.aliasTab === 'signature') ? sAliasSignature : undefined,
        })
      }
    },
    openRemoveAliasDialog() {
      this.bRemoveAliasDialog = true
    },
    removeAlias() {
      if (this.editAlias) {
        ipcRenderer.send('mail-remove-alias', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          sAliasEmail: this.editAlias.sEmail,
        })
      }
    },
    onSaveAliasSettings(oEvent, {bResult, iAccountId, iAliasId, sName, sEmail, bNoSignature, sSignature, oError}) {
      this.bAliasSaving = false
      if (bResult) {
        notification.showReport('Settings have been updated successfully.')
        if (iAliasId === 0) {
          this.$store.commit('mail/setAccountSettings', {iAccountId, sName, bNoSignature, sSignature})
        }
        this.$store.dispatch('mail/asyncGetAliases')
        if (iAliasId === this.iEditAliasId) {
          if (typeof sName === 'string') {
            this.sAliasName = sName
          }
          if (typeof bNoSignature === 'boolean') {
            this.bAliasNoSignature = bNoSignature
          }
          if (typeof sSignature === 'string') {
            this.sAliasSignature = sSignature
          }
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
      }
    },
    onRemoveAlias(oEvent, {bResult, oError}) {
      if (bResult) {
        notification.showReport('Alias was successfully removed.')
        this.$store.dispatch('mail/asyncGetAliases')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing alias.'))
      }
    },
    initSubscriptions() {
      ipcRenderer.on('mail-save-alias-settings', this.onSaveAliasSettings)
      ipcRenderer.on('mail-remove-alias', this.onRemoveAlias)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-alias-settings', this.onSaveAliasSettings)
      ipcRenderer.removeListener('mail-remove-alias', this.onRemoveAlias)
    },
  }
}
</script>

<style scoped>

</style>
