<template>
  <div>
  <q-tabs v-if="editAccount"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-route-tab :to="'/settings/accounts/account/' + iEditAccountId + '/props'" label="Properties" />
    <q-route-tab :to="'/settings/accounts/account/' + iEditAccountId + '/folders'" label="Manage Folders" />
    <q-route-tab v-if="editAccount.bAllowForward" :to="'/settings/accounts/account/' + iEditAccountId + '/forward'" label="Forward"/>
    <q-route-tab v-if="editAccount.bAllowAutoresponder" :to="'/settings/accounts/account/' + iEditAccountId + '/autoresponder'" label="Autoresponder"/>
  </q-tabs>

  <q-separator v-if="editAccount" />

  <q-tab-panels v-if="editAccount"
                v-model="mailTab"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
  >
    <q-tab-panel name="Static" class="bg-grey-1">
      <router-view
        ref="routerView"
        :accounts="accounts"
        :isEditAccount="isEditAccount"
        :accountForward="accountForward"
        :autoresponder="oAutoresponder"
      />
    </q-tab-panel>
  </q-tab-panels>

  </div>
</template>

<script>
import mailSettings from "../../../../modules/mail/settings";
import cServer from "../../../../modules/mail/classes/cServer";
import {ipcRenderer} from "electron";

export default {
  name: "editAccountsUI",
  components: {
  },
  data () {
    return {
      mailTab: 'Static',

      iEditAccountId: -1,
      bAllowChangePasswordOnMailServer: false,

      nTotal: 0,
      isEditAccount: false,
      accountForward: {
        forwardEmail: '',
        forwardEmailFromServer: '',
        bEnableForward: false,
        bEnableForwardFromServer: false,
      },
      oAutoresponder: {
        enableAutoresponder: false,
        subject: '',
        message: '',
        enableAutoresponderFromServer: false,
        subjectFromServer: '',
        messageFromServer: ''
      },
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
  },

  watch: {
    accounts () {
      if (!this.editAccount && this.accounts.length > 0) {
        this.iEditAccountId = this.accounts[0].iAccountId
      }
    },
   $route () {
      this.iEditAccountId = Number(this.$route.params.accountId)
      if (this.accounts.length > 0) {
        this.getForward()
        this.getAutoresponder()
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
  },

  mounted () {
    if (this.iEditAccountId === -1 && this.accounts.length > 0) {
      this.changeEditAccount(Number(this.$route.params.accountId))
    }
    this.bAllowIdentities = mailSettings.bAllowIdentities
    this.bAllowAliases = mailSettings.bAllowAliases
    this.getForward()
    this.getAutoresponder()
  },
  methods: {
    hasChanges () {
      return this.$refs.routerView.hasChanges()
    },
    populate () {
      return this.$refs.routerView.populate()
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
          this.accountForward.forwardEmail = bResult.Email
          this.accountForward.forwardEmailFromServer = bResult.Email
          this.accountForward.bEnableForward = bResult.Enable
          this.accountForward.bEnableForwardFromServer = bResult.Enable
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
          this.oAutoresponder.enableAutoresponderFromServer = bResult.Enable
          this.oAutoresponder.subjectFromServer = bResult.Subject
          this.oAutoresponder.messageFromServer = bResult.Message
        } else {
          this.oAutoresponder.enableAutoresponder = false
          this.oAutoresponder.subject = ''
          this.oAutoresponder.message = ''
          this.oAutoresponder.enableAutoresponderFromServer = false
          this.oAutoresponder.subjectFromServer = ''
          this.oAutoresponder.messageFromServer = ''
        }
      })
    },
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
  },
}
</script>

<style scoped>

</style>
