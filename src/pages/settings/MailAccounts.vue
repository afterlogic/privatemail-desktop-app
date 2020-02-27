<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Email accounts settings</div>
    <div class="buttons" v-if="allowAddNewAccount">
      <q-btn unelevated color="primary" label="Add New Account" @click="openAddNewAccountDialog" />
    </div>
    <q-separator spaced />
    <q-list class="non-selectable">
      <span v-for="oAccount in accounts" :key="oAccount.iAccountId">
        <q-item v-ripple clickable
          :class="{checked: iEditAccountId === oAccount.iAccountId}"
          @click="changeEditAccount(oAccount.iAccountId)"
        >
          <q-item-section>
            <q-item-label>{{ oAccount.sEmail }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat color="primary" v-if="bAllowAliases" label="add alias" />
          </q-item-section>
          <q-item-section side>
            <q-btn flat color="primary" v-if="bAllowIdentities" label="add identity" @click.native.stop="openAddNewIdentityDialog(oAccount.iAccountId)"/>
          </q-item-section>
        </q-item>
        <span v-for="oIdentity in (identities[oAccount.iAccountId] || [])" :key="oIdentity.iEntityId">
          <q-item v-ripple clickable
            v-if="oIdentity.iIdAccount === oAccount.iAccountId"
            :class="{checked: iEditIdentityId === oIdentity.iEntityId && iEditIdentityAccountId === oAccount.iAccountId}"
            @click="changeEditIdentity(oIdentity.iEntityId, oIdentity.iIdAccount)"
          >
            <q-item-section avatar>
              <q-icon name="arrow_upward" />
            </q-item-section>
            <q-item-section style="white-space: nowrap;">
              Identity {{ oIdentity.getFull() }}
            </q-item-section>
            <q-item-section>
              <q-icon name="check" v-if="oIdentity.bDefault" style="font-size: 2em;" />
            </q-item-section>
          </q-item>
        </span>
        <span v-for="oAlias in oAccount.aAliases" :key="oAlias.iEntityId">
          <q-item v-ripple clickable
            :class="{checked: iEditAliasId === oAlias.iEntityId && iEditAliasAccountId === oAccount.iAccountId}"
            @click="changeEditAlias(oAlias.iEntityId, oAlias.iIdAccount)"
          >
            <q-item-section avatar>
              <q-icon name="arrow_upward" />
            </q-item-section>
            <q-item-section style="white-space: nowrap;">
              Alias {{ oAlias.getFull() }}
            </q-item-section>
          </q-item>
        </span>
      </span>
    </q-list>

    <q-separator spaced />

    <q-tabs v-if="editAccount"
      v-model="mailTab"
      inline-label
      :no-caps=true
      align="left"
      class="flex-start"
    >
      <q-tab name="props" label="Properties" />
      <!-- <q-tab name="folders" label="Folders" />
      <q-tab name="forward" label="Forward" />
      <q-tab name="autoresponder" label="Autoresponder" />
      <q-tab name="filters" label="Filters" /> -->
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
          <q-item tag="label" v-ripple>
            <q-item-section side top>
              <q-checkbox v-model="bUseThreading" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Use mail threading if supported by the server</q-item-label>
            </q-item-section>
          </q-item>

          <q-item tag="label" v-ripple>
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
        <div class="q-pa-md">
          <q-btn unelevated color="primary" v-if="bAccountSaving" label="Saving..." />
          <q-btn unelevated color="primary" v-if="!bAccountSaving" label="Save" @click="saveAccountSettings" />
        </div>
      </q-tab-panel>

      <!-- <q-tab-panel name="folders">
        <q-list padding>
          <q-item-label header>User Controls</q-item-label>

          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>Content filtering</q-item-label>
              <q-item-label caption>
                Set the content filtering level to restrict
                apps that can be downloaded
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section>
              <q-item-label>Password</q-item-label>
              <q-item-label caption>
                Require password for purchase or use
                password to restrict purchase
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <q-tab-panel name="forward">
        <div class="q-pa-md">
          <q-item tag="label">
            <q-item-section side top>
              <q-checkbox v-model="enableForward" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Enable forward</q-item-label>
            </q-item-section>
          </q-item>
          <div class="row">
            <div class="col-2">
              <q-item-label>Email</q-item-label>
            </div>
            <div class="col">
              <q-input outlined rounded v-model="forwardEmail" :dense=true style="width: 100%;">
                <template v-slot:prepend>
                  <q-icon name="search" ></q-icon>
                </template>
                <template v-slot:after>
                  <q-btn round dense flat icon="send" ></q-btn>
                </template>
              </q-input>
            </div>
          </div>
        </div>
        <q-separator spaced />
        <q-btn color="primary" label="Save" />
      </q-tab-panel>
      
      <q-tab-panel name="autoresponder" class="autoresponder">
        <div class="q-pa-md">
          <q-item tag="label">
            <q-item-section side top>
              <q-checkbox v-model="enableAutoresponder" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Enable autoresponder</q-item-label>
            </q-item-section>
          </q-item>
          <div class="row">
            <div class="col-2">
              <q-item-label>Subject</q-item-label>
            </div>
            <div class="col">
              <q-input outlined rounded v-model="autoresponderSubject" :dense=true style="width: 100%;">
                <template v-slot:prepend>
                  <q-icon name="search" ></q-icon>
                </template>
                <template v-slot:after>
                  <q-btn round dense flat icon="send" ></q-btn>
                </template>
              </q-input>
            </div>
          </div>

          <div class="row">
            <div class="col-2">
              <q-item-label>Message</q-item-label>
            </div>
            <div class="col">
              <q-editor
                v-model="autoresponderMessage"
                :definitions="{
                  bold: {label: 'Bold', icon: null, tip: 'My bold tooltip'}
                }"
              />
            </div>
          </div>
        </div>
        <q-separator spaced />
        <q-btn color="primary" label="Save" />
      </q-tab-panel>
      <q-tab-panel name="filters">
        <q-item-label header>Filters</q-item-label>
      </q-tab-panel> -->
    </q-tab-panels>

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
          <q-item tag="label" v-ripple>
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
              <q-input outlined dense class="input-size" v-model="sIdentityName" v-on:keyup.enter="saveIdentitySettings" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Email</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input outlined dense class="input-size" v-if="aIdentityEmailOptions.length === 0" v-model="sIdentityEmail" :disable="bIdentityDisableEmail" v-on:keyup.enter="saveIdentitySettings" />
              <q-select outlined dense class="input-size" v-if="aIdentityEmailOptions.length > 0" v-model="sIdentityEmail" :options="aIdentityEmailOptions" />
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

    <q-dialog v-model="bAddNewAccountDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">Add New Account</div>
        </q-card-section>

        <q-item>
          <q-item-section>
            <q-item-label>Your name</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense class="input-size" v-model="sNewAccountName" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Email *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense class="input-size" v-model="sNewAccountEmail" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
        </q-item>
        <q-item v-if="bSecondStepOfAddAccount">
          <q-item-section>
            <q-item-label>Login *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense class="input-size" v-model="sNewAccountLogin" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Password *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense class="input-size" type="password" v-model="sNewAccountPassword" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
        </q-item>
        <q-item v-if="bSecondStepOfAddAccount">
          <q-item-section>
            <q-item-label style="white-space: nowrap;">IMAP Server *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 200px;" v-model="sNewAccountImapServer" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
          <q-item-section side>
            <q-item-label style="white-space: nowrap;">Port *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 50px;" v-model.number="iNewAccountImapPort" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
          <q-item-section side>
            <q-checkbox v-model="bNewAccountImapSsl" />
          </q-item-section>
          <q-item-section side>
            <q-item-label>SSL</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="bSecondStepOfAddAccount">
          <q-item-section>
            <q-item-label style="white-space: nowrap;">SMTP Server *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 200px;" v-model="sNewAccountSmtpServer" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
          <q-item-section side>
            <q-item-label style="white-space: nowrap;">Port *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 50px;" v-model.number="iNewAccountSmtpPort" v-on:keyup.enter="addNewAccount" />
          </q-item-section>
          <q-item-section side>
            <q-checkbox v-model="bNewAccountSmtpSsl" />
          </q-item-section>
          <q-item-section side>
            <q-item-label>SSL</q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple v-if="bSecondStepOfAddAccount">
          <q-item-section side center>
            <q-checkbox v-model="bNewAccountSmtpAuth" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Use SMTP authentication</q-item-label>
          </q-item-section>
        </q-item>

        <q-card-actions align="right">
          <q-btn flat label="Adding..." color="primary" v-if="bAddingNewAccount" />
          <q-btn flat label="Add" color="primary" @click="addNewAccount" v-if="!bAddingNewAccount" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

    <q-dialog v-model="bNewIdentityDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">Add New Identity</div>
        </q-card-section>

        <q-item>
          <q-item-section>
            <q-item-label>Your name</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense class="input-size" v-model="sNewIdentityName" v-on:keyup.enter="addNewIdentity" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Email *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense class="input-size" v-if="aNewIdentityEmailOptions.length === 0" :disable="bNewIdentityDisableEmail" v-model="sNewIdentityEmail" v-on:keyup.enter="addNewIdentity" />
            <q-select outlined dense class="input-size" v-if="aNewIdentityEmailOptions.length > 0" v-model="sNewIdentityEmail" :options="aNewIdentityEmailOptions" />
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat label="Adding..." color="primary" v-if="bNewIdentityAdding" />
          <q-btn flat label="Add" color="primary" @click="addNewIdentity" v-if="!bNewIdentityAdding" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

<style lang="scss" scoped>
.autoresponder .row + .row {
  margin-top: 1rem;
}
.buttons {
  text-align: right;
}
.input-size {
  width: 300px;
}
</style>

<script>
import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'

import mailSettings from 'src/modules/mail/settings.js'

import MailAccountsSignatureTab from './MailAccountsSignatureTab.vue'

export default {
  name: 'MailAccounts',

  components: {
    MailAccountsSignatureTab,
  },

  data () {
    return {
      mailTab: 'props',
      identityTab: 'props',

      iEditAccountId: -1,
      iEditIdentityId: -1,
      iEditIdentityAccountId: -1,
      iEditAliasAccountId: -1,
      iEditAliasId: -1,

      // enableAutoresponder: false,
      // autoresponderSubject: '',
      // autoresponderMessage: '',
      // enableForward: '',
      // forwardEmail: '',

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
      sNewAccountImapServer: '',
      sNewAccountImapPort: 143,
      bNewAccountImapSsl: false,
      sNewAccountSmtpServer: '',
      iNewAccountSmtpPort: 25,
      bNewAccountSmtpSsl: false,
      bNewAccountSmtpAuth: true,

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
    currentIdentities () {
      return this.$store.getters['mail/getCurrentIdentities']
    },
    identities () {
      return this.$store.getters['mail/getIdentities']
    },
    editIdentity () {
      let aIdentityAcountIdentities = this.identities[this.iEditIdentityAccountId] || []
      return _.find(aIdentityAcountIdentities, (oIdentity) => {
        return oIdentity.iEntityId === this.iEditIdentityId
      })
    },
    editAlias () {
      let aAliasAcountIdentities = this.identities[this.iEditAliasAccountId] || []
      return _.find(aAliasAcountIdentities, (oAlias) => {
        return oAlias.iEntityId === this.iEditAliasId
      })
    },
  },

  watch: {
    accounts () {
      if (!this.editAccount && this.accounts.length > 0) {
        this.iEditAccountId = this.accounts[0].iAccountId
      }
    },
    editAccount () {
      if (this.editAccount) {
        this.bDefaultAccount = this.editAccount.bDefault
        this.bUseThreading = this.editAccount.bUseThreading
        this.bSaveRepliesToCurrFolder = this.editAccount.bSaveRepliesToCurrFolder
      }
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
    bNewAccountImapSsl () {
      if (this.bNewAccountImapSsl && this.iNewAccountImapPort === 143) {
        this.iNewAccountImapPort = 993
      } else if (this.iNewAccountImapPort === 993) {
        this.iNewAccountImapPort = 143
      }
    },
    bNewAccountSmtpSsl () {
      if (this.bNewAccountSmtpSsl && this.iNewAccountSmtpPort === 25) {
        this.iNewAccountSmtpPort = 465
      } else if (this.iNewAccountSmtpPort === 465) {
        this.iNewAccountSmtpPort = 25
      }
    },
  },

  mounted () {
    if (this.iEditAccountId === -1 && this.accounts.length > 0) {
      this.changeEditAccount(this.accounts[0].iAccountId)
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
      this.iEditAccountId = iAccountId
      this.iEditIdentityAccountId = -1
      this.iEditIdentityId = -1
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
    },
    changeEditIdentity (iIdentityId, iIdentityAccountId) {
      this.iEditAccountId = -1
      this.iEditIdentityAccountId = iIdentityAccountId
      this.iEditIdentityId = iIdentityId
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
    },
    changeEditAlias (iAliasId, iAliasAccountId) {
      this.iEditAccountId = -1
      this.iEditIdentityAccountId = -1
      this.iEditIdentityId = -1
      this.iEditAliasAccountId = iAliasAccountId
      this.iEditAliasId = iAliasId
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
    onRemoveAccount (oEvent, { bResult, iAccountId, oError }) {
      if (bResult) {
        notification.showReport('Account was successfully removed.')
        this.$store.commit('mail/removeAccount', { iAccountId })
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing account.'))
      }
    },
    openAddNewAccountDialog () {
      if (this.allowAddNewAccount) {
        this.bAddingNewAccount = false
        this.sNewAccountName = ''
        this.sNewAccountEmail = ''
        this.sNewAccountPassword = ''
        this.bSecondStepOfAddAccount = false
        this.sNewAccountLogin = ''
        this.sNewAccountImapServer = ''
        this.iNewAccountImapPort = 143
        this.bNewAccountImapSsl = false
        this.sNewAccountSmtpServer = ''
        this.iNewAccountSmtpPort = 25
        this.bNewAccountSmtpSsl = false
        this.bNewAccountSmtpAuth = true
        this.bAddNewAccountDialog = true
      }
    },
    addNewAccount () {
      if (this.bSecondStepOfAddAccount) {
        this.addNewAccountFull()
      } else {
        this.addNewAccountShort()
      }
    },
    addNewAccountFull () {
      if (this.allowAddNewAccount) {
        if (_.trim(this.sNewAccountEmail) === '' || _.trim(this.sNewAccountPassword) === '' || _.trim(this.sNewAccountImapServer) === ''
            || _.trim(this.iNewAccountImapPort) === '' || _.trim(this.sNewAccountSmtpServer) === '' || _.trim(this.iNewAccountSmtpPort) === '') {
          notification.showError('Not all required fields are filled.')
        } else {
          this.bAddingNewAccount = true
          ipcRenderer.send('mail-add-new-account-full', {
            sApiHost: this.$store.getters['main/getApiHost'],
            sAuthToken: this.$store.getters['user/getAuthToken'],
            sName: this.sNewAccountName,
            sEmail: this.sNewAccountEmail,
            sLogin: this.sNewAccountLogin,
            sPassword: this.sNewAccountPassword,
            sImapServer: this.sNewAccountImapServer,
            iImapPort: this.iNewAccountImapPort,
            bImapSsl: this.bNewAccountImapSsl,
            sSmtpServer: this.sNewAccountSmtpServer,
            iSmtpPort: this.iNewAccountSmtpPort,
            bSmtpSsl: this.bNewAccountSmtpSsl,
            bSmtpAuth: this.bNewAccountSmtpAuth,
          })
        }
      }
    },
    addNewAccountShort () {
      if (this.allowAddNewAccount) {
        if (_.trim(this.sNewAccountEmail) === '' || _.trim(this.sNewAccountPassword) === '') {
          notification.showError('Not all required fields are filled.')
        } else {
          this.bAddingNewAccount = true
          let sMainAccount = this.$store.getters['mail/getDefaultAccount']
          let sMainAccountEmail = sMainAccount ? sMainAccount.sEmail : ''
          let sMainAccountDomain = _.trim(sMainAccountEmail).split('@')[1]
          ipcRenderer.send('mail-add-new-account', {
            sApiHost: this.$store.getters['main/getApiHost'],
            sAuthToken: this.$store.getters['user/getAuthToken'],
            sName: this.sNewAccountName,
            sEmail: this.sNewAccountEmail,
            sMainAccountDomain,
            sPassword: this.sNewAccountPassword,
          })
        }
      }
    },
    onAddNewAccount (oEvent, { bResult, oAccountData, bUnknownDomain, oError }) {
      this.bAddingNewAccount = false
      if (bResult) {
        this.bAddNewAccountDialog = false
        notification.showReport('Account was successfully added.')
        this.$store.commit('mail/addAccount', { oAccountData })
      } else if (bUnknownDomain) {
        this.sNewAccountLogin = this.sNewAccountEmail
        this.bSecondStepOfAddAccount = true
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding account.'))
      }
    },
    saveIdentitySettings (bIdentityNoSignature, sIdentitySignature) {
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
    onSaveIdentitySettings (oEvent, { bResult, iAccountId, iIdentityId, bDefault, sName, sEmail, bNoSignature, sSignature, oError }) {
      this.bIdentitySaving = false
      if (bResult) {
        notification.showReport('Settings have been updated successfully.')
        if (iIdentityId === 0) {
          this.$store.commit('mail/setAccountSettings', { iAccountId, sName, bNoSignature, sSignature })
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
    openAddNewIdentityDialog (iAccountId) {
      let oAccount = _.find(this.accounts, (oTmpAccount) => {
        return oTmpAccount.iAccountId === iAccountId
      })
      this.bNewIdentityAdding = false
      this.sNewIdentityName = ''
      this.sNewIdentityEmail = oAccount.sEmail
      this.iNewIdentityAccountId = iAccountId
      this.bNewIdentityDisableEmail = mailSettings.bOnlyUserEmailsInIdentities
      this.bNewIdentityDialog = true

      if (oAccount && _.isArray(oAccount.aAliases)) {
        this.aNewIdentityEmailOptions = _.map(oAccount.aAliases, (oAlias) => {
          return oAlias.sEmail
        })
      } else {
        this.aNewIdentityEmailOptions = []
      }
      if (this.aNewIdentityEmailOptions.length > 0) {
        this.aNewIdentityEmailOptions.unshift(oAccount.sEmail)
      }
    },
    addNewIdentity () {
      if (_.trim(this.sNewIdentityEmail) === '') {
        notification.showError('Not all required fields are filled.')
      } else {
        this.bNewIdentityAdding = true
        ipcRenderer.send('mail-add-new-identity', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iNewIdentityAccountId,
          sName: this.sNewIdentityName,
          sEmail: this.sNewIdentityEmail,
        })
      }
    },
    onAddNewIdentity (oEvent, { iNewIdentityId, iAccountId, oError }) {
      this.bNewIdentityAdding = false
      if (typeof iNewIdentityId === 'number') {
        this.bNewIdentityDialog = false
        this.changeEditIdentity (iNewIdentityId, iAccountId)
        notification.showReport('Identity was successfully added.')
        this.$store.dispatch('mail/asyncGetIdentities')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding identity.'))
      }
    },
    openRemoveIdentityDialog () {
      if (!this.bIdentityIsAccountPart) {
        this.bRemoveIdentityDialog = true
      }
    },
    removeIdentity () {
      if (!this.bIdentityIsAccountPart) {
        ipcRenderer.send('mail-remove-identity', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditIdentityAccountId,
          iIdentityId: this.iEditIdentityId,
        })
      }
    },
    onRemoveIdentity (oEvent, { bResult, oError }) {
      if (bResult) {
        notification.showReport('Identity was successfully removed.')
        this.$store.dispatch('mail/asyncGetIdentities')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing identity.'))
      }
    },
    initSubscriptions () {
      ipcRenderer.on('mail-save-account-settings', this.onSaveAccountSettings)
      ipcRenderer.on('mail-remove-account', this.onRemoveAccount)
      ipcRenderer.on('mail-add-new-account', this.onAddNewAccount)
      ipcRenderer.on('mail-add-new-account-full', this.onAddNewAccount)
      ipcRenderer.on('mail-save-identity-settings', this.onSaveIdentitySettings)
      ipcRenderer.on('mail-add-new-identity', this.onAddNewIdentity)
      ipcRenderer.on('mail-remove-identity', this.onRemoveIdentity)
    },
    destroySubscriptions () {
      ipcRenderer.removeListener('mail-save-account-settings', this.onSaveAccountSettings)
      ipcRenderer.removeListener('mail-remove-account', this.onRemoveAccount)
      ipcRenderer.removeListener('mail-add-new-account', this.onAddNewAccount)
      ipcRenderer.removeListener('mail-add-new-account-full', this.onAddNewAccount)
      ipcRenderer.removeListener('mail-save-identity-settings', this.onSaveIdentitySettings)
      ipcRenderer.removeListener('mail-add-new-identity', this.onAddNewIdentity)
      ipcRenderer.removeListener('mail-remove-identity', this.onRemoveIdentity)
    },
  },
}
</script>
