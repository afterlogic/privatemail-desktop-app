<template>
<div>
  <q-tabs v-if="editIdentity"
          v-model="identityTab"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-tab name="props" label="Properties" />
    <q-tab name="signature" label="Signature" />
  </q-tabs>

  <q-separator v-if="editIdentity" />

  <q-tab-panels v-if="editIdentity"
                v-model="identityTab"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
  >
    <q-tab-panel name="props" class="bg-grey-1">
      <q-list class="non-selectable" style="width: 450px;">
        <q-item tag="label" :disable="bIdentityDisableDefault">
          <q-item-section side top>
            <q-checkbox v-model="bIdentityDefault" :disable="bIdentityDisableDefault" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Set default</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Your name</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense bg-color="white" class="input-size" v-model="sIdentityName" v-on:keyup.enter="saveIdentitySettings" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Email</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense bg-color="white" class="input-size" v-if="aIdentityEmailOptions.length === 0" v-model="sIdentityEmail" :disable="bIdentityDisableEmail" v-on:keyup.enter="saveIdentitySettings" />
            <q-select outlined dense bg-color="white" class="input-size" v-if="aIdentityEmailOptions.length > 0" v-model="sIdentityEmail" :options="aIdentityEmailOptions" />
          </q-item-section>
        </q-item>
        <q-item v-if="!bIdentityIsAccountPart">
          <q-item-section>
            <q-item-label>
              <q-btn unelevated outline color="warning" label="Remove identity" @click="openRemoveIdentityDialog" />
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator spaced />
      <div class="q-pa-md">
        <q-btn unelevated color="primary" v-if="bIdentitySaving" label="Saving..." />
        <q-btn unelevated color="primary" v-if="!bIdentitySaving" label="Save" @click="saveIdentitySettings" />
      </div>
    </q-tab-panel>

    <q-tab-panel name="signature" class="bg-grey-1">
      <MailAccountsSignatureTab :noSignature="bIdentityNoSignature" :signature="sIdentitySignature" :isSaving="bIdentitySaving" :saveSignature="saveIdentitySettings" />
    </q-tab-panel>
  </q-tab-panels>
  <q-dialog v-model="bRemoveIdentityDialog" persistent>
    <q-card class="q-px-sm non-selectable">
      <q-card-section>
        <div class="text-h6">{{ editIdentity ? editIdentity.getFull() : '' }}</div>
      </q-card-section>

      <q-item>
        <q-item-label>Are you sure you want to remove identity?</q-item-label>
      </q-item>

      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" @click="removeIdentity" v-close-popup />
        <q-btn flat label="Cancel" color="grey-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</div>
</template>

<script>
import {ipcRenderer} from "electron";
import notification from "../../../utils/notification";
import errors from "../../../utils/errors";
import mailSettings from 'src/modules/mail/settings.js'
import MailAccountsSignatureTab from '../MailAccountsSignatureTab.vue'

export default {
  name: "editIdentityUI",
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

      // enableAutoresponder: false,
      // autoresponderSubject: '',
      // autoresponderMessage: '',
      // enableForward: '',
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
    if (this.editIdentity) {
      this.bIdentityIsAccountPart = this.iEditIdentityId === 0
      this.bIdentityDefault = this.editIdentity.bDefault
      this.bIdentityDisableDefault = this.editIdentity.bDefault
      this.sIdentityName = this.editIdentity.sFriendlyName
      this.sIdentityEmail = this.editIdentity.sEmail
      let oIdentityAccount = _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === this.editIdentity.iIdAccount
      })
      if (!this.bIdentityIsAccountPart && oIdentityAccount && _.isArray(oIdentityAccount.aAliases)) {
        this.aIdentityEmailOptions = _.map(oIdentityAccount.aAliases, (oAlias) => {
          return oAlias.sEmail
        })
      } else {
        this.aIdentityEmailOptions = []
      }
      if (this.aIdentityEmailOptions.length > 0) {
        this.aIdentityEmailOptions.unshift(oIdentityAccount.sEmail)
      }
      this.bIdentityDisableEmail = mailSettings.bOnlyUserEmailsInIdentities || this.bIdentityIsAccountPart
      this.bIdentityNoSignature = !this.editIdentity.bUseSignature
      this.sIdentitySignature = this.editIdentity.sSignature
    }
    this.iEditAccountId = -1
    this.iEditIdentityAccountId = Number(this.$route.params.accountId)
    this.iEditIdentityId = Number(this.$route.params.identityId)
    this.iEditAliasAccountId = -1
    this.iEditAliasId = -1
    this.changeEditIdentity(Number(this.$route.params.identityId), Number(this.$route.params.accountId))
    this.initSubscriptions()
  },
  beforeDestroy: function () {
    this.destroySubscriptions()
  },
  computed: {
    editIdentity () {
      let aIdentityAccountIdentities = this.identities[Number(this.$route.params.accountId)] || []
      return _.find(aIdentityAccountIdentities, (oIdentity) => {
        return oIdentity.iEntityId === Number(this.$route.params.identityId)
      })
    },
    identities () {
      return this.$store.getters['mail/getIdentities']
    },
  },
  watch: {
    '$route.params.identityId': function () {
      this.iEditAccountId = -1
      this.iEditIdentityAccountId = Number(this.$route.params.accountId)
      this.iEditIdentityId = Number(this.$route.params.identityId)
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
      this.changeEditIdentity(Number(this.$route.params.identityId), Number(this.$route.params.accountId))
    },
    editIdentity () {
      if (this.editIdentity) {
        this.bIdentityIsAccountPart = this.iEditIdentityId === 0
        this.bIdentityDefault = this.editIdentity.bDefault
        this.bIdentityDisableDefault = this.editIdentity.bDefault
        this.sIdentityName = this.editIdentity.sFriendlyName
        this.sIdentityEmail = this.editIdentity.sEmail
        let oIdentityAccount = _.find(this.accounts, (oAccount) => {
          return oAccount.iAccountId === this.editIdentity.iIdAccount
        })
        if (!this.bIdentityIsAccountPart && oIdentityAccount && _.isArray(oIdentityAccount.aAliases)) {
          this.aIdentityEmailOptions = _.map(oIdentityAccount.aAliases, (oAlias) => {
            return oAlias.sEmail
          })
        } else {
          this.aIdentityEmailOptions = []
        }
        if (this.aIdentityEmailOptions.length > 0) {
          this.aIdentityEmailOptions.unshift(oIdentityAccount.sEmail)
        }
        this.bIdentityDisableEmail = mailSettings.bOnlyUserEmailsInIdentities || this.bIdentityIsAccountPart
        this.bIdentityNoSignature = !this.editIdentity.bUseSignature
        this.sIdentitySignature = this.editIdentity.sSignature
      }
    },
  },
  methods: {
    changeEditIdentity(iIdentityId, iIdentityAccountId) {
      this.iEditAccountId = -1
      this.iEditIdentityAccountId = iIdentityAccountId
      this.iEditIdentityId = iIdentityId
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
    },
    saveIdentitySettings(bIdentityNoSignature, sIdentitySignature) {
      if (this.editIdentity) {
        this.bIdentitySaving = true
        ipcRenderer.send('mail-save-identity-settings', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.editIdentity.iIdAccount,
          iIdentityId: this.iEditIdentityId,
          bDefault: (this.identityTab === 'props') ? this.bIdentityDefault : undefined,
          sName: (this.identityTab === 'props') ? this.sIdentityName : undefined,
          sEmail: (this.identityTab === 'props') ? this.sIdentityEmail : undefined,
          bNoSignature: (this.identityTab === 'signature') ? bIdentityNoSignature : undefined,
          sSignature: (this.identityTab === 'signature') ? sIdentitySignature : undefined,
        })
      }
    },
    openRemoveIdentityDialog() {
      if (!this.bIdentityIsAccountPart) {
        this.bRemoveIdentityDialog = true
      }
    },
    removeIdentity() {
      if (!this.bIdentityIsAccountPart) {
        ipcRenderer.send('mail-remove-identity', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditIdentityAccountId,
          iIdentityId: this.iEditIdentityId,
        })
      }
    },
    onRemoveIdentity(oEvent, {bResult, oError}) {
      if (bResult) {
        notification.showReport('Identity was successfully removed.')
        this.$store.dispatch('mail/asyncGetIdentities')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing identity.'))
      }
    },
    onSaveIdentitySettings(oEvent, {
      bResult,
      iAccountId,
      iIdentityId,
      bDefault,
      sName,
      sEmail,
      bNoSignature,
      sSignature,
      oError
    }) {
      this.bIdentitySaving = false
      if (bResult) {
        notification.showReport('Settings have been updated successfully.')
        if (iIdentityId === 0) {
          this.$store.commit('mail/setAccountSettings', {iAccountId, sName, bNoSignature, sSignature})
        }
        this.$store.dispatch('mail/asyncGetIdentities')
        if (iIdentityId === this.iEditIdentityId) {
          if (typeof bDefault === 'boolean') {
            this.bIdentityDefault = bDefault
          }
          if (typeof sName === 'string') {
            this.sIdentityName = sName
          }
          if (typeof bNoSignature === 'boolean') {
            this.bIdentityNoSignature = bNoSignature
          }
          if (typeof sSignature === 'string') {
            this.sIdentitySignature = sSignature
          }
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
      }
    },
    initSubscriptions() {
      ipcRenderer.on('mail-save-identity-settings', this.onSaveIdentitySettings)
      ipcRenderer.on('mail-remove-identity', this.onRemoveIdentity)

    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-identity-settings', this.onSaveIdentitySettings)
      ipcRenderer.removeListener('mail-remove-identity', this.onRemoveIdentity)
    },
  }
}
</script>

<style scoped>

</style>
