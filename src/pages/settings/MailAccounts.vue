<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Email accounts settings</div>
    <div class="buttons q-mb-md" v-if="allowAddNewAccount">
      <q-btn unelevated color="primary" label="Add New Account" @click="openAddNewAccountDialog" />
    </div>
    <q-list class="non-selectable bg-grey-1 rounded-borders q-mb-md" bordered separator>
      <span v-for="oAccount in accounts" :key="oAccount.iAccountId">
        <div class="bg-grey-4 text-black">
          <q-item dense v-ripple clickable
            :class="{selected: iEditAccountId === oAccount.iAccountId}"
            @click="changeEditAccount(oAccount.iAccountId)"
          >
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ oAccount.sEmail }}</q-item-label>
            </q-item-section>
            <q-item-section side>

              <q-btn flat color="primary" :text-color="iEditAccountId === oAccount.iAccountId ? 'white' : ''" v-if="bAllowAliases && oAccount.bDefault" label="add alias" @click.native.stop="openAddNewAliasDialog(oAccount.iAccountId)" />
            </q-item-section>
            <q-item-section side>
              <q-btn flat color="primary" :text-color="iEditAccountId === oAccount.iAccountId ? 'white' : ''" v-if="bAllowIdentities" label="add identity" @click.native.stop="openAddNewIdentityDialog(oAccount.iAccountId)"/>
            </q-item-section>
          </q-item>
        </div>
        <q-list class="non-selectable text-black" separator>
          <q-item dense v-ripple clickable
            v-for="oIdentity in (identities[oAccount.iAccountId] || [])" :key="oIdentity.iEntityId"
            :class="{selected: iEditIdentityId === oIdentity.iEntityId && iEditIdentityAccountId === oAccount.iAccountId}"
            @click="changeEditIdentity(oIdentity.iEntityId, oIdentity.iIdAccount)"
          >
            <q-item-section side>
              <q-icon size="16px" name="arrow_upward" />
            </q-item-section>
            <q-item-section style="white-space: nowrap;">
              <q-item-label>
                <span class="nodata">Identity </span>
                <span class="text-weight-medium">{{ oIdentity.getFull() }}</span>
                <q-icon name="check" size="18px" v-if="oIdentity.bDefault" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-list class="non-selectable text-black" separator>
          <q-item dense v-ripple clickable
            v-for="oAlias in oAccount.aAliases" :key="oAlias.iEntityId"
            :class="{selected: iEditAliasId === oAlias.iEntityId && iEditAliasAccountId === oAccount.iAccountId}"
            @click="changeEditAlias(oAlias.iEntityId, oAlias.iIdAccount)"
          >
            <q-item-section side>
              <q-icon size="16px" name="arrow_upward" />
            </q-item-section>
            <q-item-section style="white-space: nowrap;">
              <q-item-label>
                <span class="nodata">Alias </span>
                <span class="text-weight-medium">{{ oAlias.getFull() }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </span>
    </q-list>

    <router-view></router-view>

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
        <q-item v-if="bSecondStepOfAddAccount && newAccountServerOptions.length > 1">
          <q-item-section>
            <q-item-label>Server *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select outlined dense class="input-size" v-model="oNewAccountServer" :options="newAccountServerOptions" />
          </q-item-section>
        </q-item>
        <q-item v-if="bSecondStepOfAddAccount">
          <q-item-section>
            <q-item-label style="white-space: nowrap;">IMAP Server *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 200px;" v-model="sNewAccountImapServer" v-on:keyup.enter="addNewAccount" :disable="existingServerSelected" />
          </q-item-section>
          <q-item-section side>
            <q-item-label style="white-space: nowrap;">Port *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 50px;" v-model.number="iNewAccountImapPort" v-on:keyup.enter="addNewAccount" :disable="existingServerSelected" />
          </q-item-section>
          <q-item-section side>
            <q-checkbox v-model="bNewAccountImapSsl" :disable="existingServerSelected"><q-item-label class="q-ml-sm">SSL</q-item-label></q-checkbox>
          </q-item-section>
        </q-item>
        <q-item v-if="bSecondStepOfAddAccount">
          <q-item-section>
            <q-item-label style="white-space: nowrap;">SMTP Server *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 200px;" v-model="sNewAccountSmtpServer" v-on:keyup.enter="addNewAccount" :disable="existingServerSelected" />
          </q-item-section>
          <q-item-section side>
            <q-item-label style="white-space: nowrap;">Port *</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense style="width: 50px;" v-model.number="iNewAccountSmtpPort" v-on:keyup.enter="addNewAccount" :disable="existingServerSelected" />
          </q-item-section>
          <q-item-section side>
            <q-checkbox v-model="bNewAccountSmtpSsl" :disable="existingServerSelected"><q-item-label class="q-ml-sm">SSL</q-item-label></q-checkbox>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-if="bSecondStepOfAddAccount">
          <q-item-section side center>
            <q-checkbox v-model="bNewAccountSmtpAuth" :disable="existingServerSelected" />
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
    <q-dialog v-model="bNewIdentityDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">Create Identity</div>
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
          <q-btn flat label="Creating..." color="primary" v-if="bNewIdentityAdding" />
          <q-btn flat label="Create" color="primary" @click="addNewIdentity" v-if="!bNewIdentityAdding" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <q-dialog v-model="bNewAliasDialog" persistent>
      <q-card class="q-px-sm non-selectable" style="width: 700px;">
        <q-card-section>
          <div class="text-h6">Create Alias</div>
        </q-card-section>

        <q-item>
          <q-item-section side>
            <q-item-label>Alias name</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-input outlined dense v-model="sNewAliasName" v-on:keyup.enter="addNewAlias" />
          </q-item-section>
          <q-item-section side>
            <q-item-label>@</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select outlined dense v-model="sNewAliasDomain" :options="aNewAliasDomainOptions" />
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat label="Creating..." color="primary" v-if="bNewAliasAdding" />
          <q-btn flat label="Create" color="primary" @click="addNewAlias" v-if="!bNewAliasAdding" />
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
import cServer from 'src/modules/mail/classes/cServer.js'
import mailSettings from 'src/modules/mail/settings.js'

export default {
  name: 'MailAccounts',

  data () {
    return {
      iEditAccountId: -1,
      iEditIdentityId: -1,
      iEditIdentityAccountId: -1,
      iEditAliasAccountId: -1,
      iEditAliasId: -1,

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

      bAllowIdentities: false,
      bIdentityIsAccountPart: false,
      bIdentityDefault: false,
      bIdentityDisableDefault: false,

      bNewIdentityDialog: false,
      sNewIdentityName: '',
      sNewIdentityEmail: '',
      aNewIdentityEmailOptions: [],
      iNewIdentityAccountId: -1,
      bNewIdentityDisableEmail: false,
      bNewIdentityAdding: '',

      bAllowAliases: false,

      bNewAliasDialog: false,
      sNewAliasName: '',
      sNewAliasDomain: '',
      aNewAliasDomainOptions: [],
      bNewAliasAdding: false,
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
  },

  watch: {
    accounts () {
      if (!this.editAccount && this.accounts.length > 0) {
        this.iEditAccountId = this.accounts[0].iAccountId
      }
    },
    $route(to, from) {
      this.iEditAccountId = -1
      this.iEditIdentityAccountId = -1
      this.iEditIdentityId = -1
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
      if (this.$route.params.aliasId === undefined && this.$route.params.identityId === undefined) {
        this.iEditAccountId = Number(this.$route.params.accountId)
      } else if (this.$route.params.identityId !== undefined) {
        this.iEditIdentityAccountId = Number(this.$route.params.accountId)
        this.iEditIdentityId = Number(this.$route.params.identityId)
      } else if (this.$route.params.aliasId !== undefined) {
        this.iEditAliasAccountId = Number(this.$route.params.accountId)
        this.iEditAliasId = Number(this.$route.params.aliasId)
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
    existingServerSelected () {
      if (this.existingServerSelected) {
        let oServer = this.oNewAccountServer.value
        this.sNewAccountImapServer = oServer.sIncomingServer
        this.iNewAccountImapPort = oServer.iIncomingPort
        this.bNewAccountImapSsl = oServer.bIncomingUseSsl
        this.sNewAccountSmtpServer = oServer.sOutgoingServer
        this.iNewAccountSmtpPort = oServer.iOutgoingPort
        this.bNewAccountSmtpSsl = oServer.bOutgoingUseSsl
        let sSmtpAuthTypeUseUserCredentials = '2'
        this.bNewAccountSmtpAuth = sSmtpAuthTypeUseUserCredentials === oServer.sSmtpAuthType
      } else {
        this.sNewAccountImapServer = ''
        this.iNewAccountImapPort = 143
        this.bNewAccountImapSsl = false
        this.sNewAccountSmtpServer = ''
        this.iNewAccountSmtpPort = 25
        this.bNewAccountSmtpSsl = false
        this.bNewAccountSmtpAuth = true
      }
    },
  },

  mounted () {
    if (this.accounts.length) {
      this.iEditAccountId =  Number(this.$route.params.accountId)
      this.bAllowIdentities = mailSettings.bAllowIdentities
      this.bAllowAliases = mailSettings.bAllowAliases
      this.initSubscriptions()
    }
  },

  beforeDestroy: function () {
    this.destroySubscriptions()
  },

  methods: {
    changeEditAccount(iAccountId) {
      if (this.$route.path !== `/settings/accounts/account/${iAccountId}/props`) {
        let parameters = {bEditAccount: true, iEditAccountId: iAccountId}
        this.$store.commit('mail/setEditFolderList', {Tree: []})
        this.$store.dispatch('mail/asyncGetFolderList', parameters)
        this.$router.push(`/settings/accounts/account/${iAccountId}/props`)
      }

    },
    changeEditIdentity(iIdentityId, iIdentityAccountId) {
      if (this.$route.path !== `/settings/accounts/identity/${iIdentityAccountId}/${iIdentityId}/props`) {
        this.$router.push(`/settings/accounts/identity/${iIdentityAccountId}/${iIdentityId}/props`)
      }
    },
    changeEditAlias(iAliasId, iAliasAccountId) {
      if (this.$route.path !== `/settings/accounts/alias/${iAliasAccountId}/${iAliasId}/props`) {
        this.$router.push(`/settings/accounts/alias/${iAliasAccountId}/${iAliasId}/props`)
      }
    },

    openAddNewAccountDialog() {
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
        this.oNewAccountServer = {
          label: 'Configure manually',
          value: null,
        }
        this.bAddNewAccountDialog = true
      }
    },
    addNewAccount() {
      if (this.bSecondStepOfAddAccount) {
        this.addNewAccountFull()
      } else {
        this.addNewAccountShort()
      }
    },
    addNewAccountFull() {
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
            iServerId: this.existingServerSelected ? this.oNewAccountServer.value.iEntityId : 0,
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
    addNewAccountShort() {
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
    onAddNewAccount(oEvent, {bResult, oAccountData, bUnknownDomain, oError}) {
      this.bAddingNewAccount = false
      if (bResult) {
        this.bAddNewAccountDialog = false
        notification.showReport('Account was successfully added.')
        this.$store.commit('mail/addAccount', {oAccountData})
        this.$store.dispatch('mail/asyncGetIdentities')
      } else if (bUnknownDomain) {
        this.sNewAccountLogin = this.sNewAccountEmail
        this.bSecondStepOfAddAccount = true
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding account.'))
      }
    },
    openAddNewIdentityDialog(iAccountId) {
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
    addNewIdentity() {
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
    onAddNewIdentity(oEvent, {iNewIdentityId, iAccountId, oError}) {
      this.bNewIdentityAdding = false
      if (typeof iNewIdentityId === 'number') {
        this.bNewIdentityDialog = false
        this.changeEditIdentity(iNewIdentityId, iAccountId)
        notification.showReport('Identity was successfully added.')
        this.$store.dispatch('mail/asyncGetIdentities')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding identity.'))
      }
    },
    openAddNewAliasDialog(iAccountId) {
      let oAccount = _.find(this.accounts, (oTmpAccount) => {
        return oTmpAccount.iAccountId === iAccountId
      })
      this.bNewAliasAdding = false
      this.sNewAliasName = ''
      this.aNewAliasDomainOptions = oAccount.aServerDomains
      this.sNewAliasDomain = oAccount.aServerDomains.length > 0 ? oAccount.aServerDomains[0] : ''
      this.bNewAliasDialog = true
    },
    addNewAlias() {
      if (_.trim(this.sNewAliasName) === '') {
        notification.showError('Not all required fields are filled.')
      } else {
        this.bNewAliasAdding = true
        ipcRenderer.send('mail-add-new-alias', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          sAliasName: this.sNewAliasName,
          sAliasDomain: this.sNewAliasDomain,
        })
      }
    },
    onAddNewAlias(oEvent, {bResult, oError}) {
      this.bNewAliasAdding = false
      if (bResult) {
        this.bNewAliasDialog = false
        notification.showReport('Alias was successfully added.')
        this.$store.dispatch('mail/asyncGetAliases')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding alias.'))
      }
    },

    initSubscriptions() {
      ipcRenderer.on('mail-add-new-account', this.onAddNewAccount)
      ipcRenderer.on('mail-add-new-account-full', this.onAddNewAccount)
      ipcRenderer.on('mail-add-new-identity', this.onAddNewIdentity)
      ipcRenderer.on('mail-add-new-alias', this.onAddNewAlias)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-add-new-account', this.onAddNewAccount)
      ipcRenderer.removeListener('mail-add-new-account-full', this.onAddNewAccount)
      ipcRenderer.removeListener('mail-add-new-identity', this.onAddNewIdentity)
      ipcRenderer.removeListener('mail-add-new-alias', this.onAddNewAlias)
    },
  }
}
</script>
