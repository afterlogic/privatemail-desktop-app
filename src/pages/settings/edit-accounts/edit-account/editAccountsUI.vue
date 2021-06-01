<template>
  <div>
  <q-tabs v-if="editAccount"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-route-tab :to="'/settings/accounts/account/' + iEditAccountId + '/props'" name="props" label="Properties" />
    <q-route-tab :to="'/settings/accounts/account/' + iEditAccountId + '/folders'" name="folders" label="Manage Folders" />
    <q-route-tab v-if="!isEditAccount" :to="'/settings/accounts/account/' + iEditAccountId + '/forward'" name="forward" label="Forward"/>
    <q-route-tab v-if="!isEditAccount" :to="'/settings/accounts/account/' + iEditAccountId + '/autoresponder'" name="autoresponder" label="Autoresponder"/>
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
        :accounts="accounts"
        :isEditAccount="isEditAccount"
      ></router-view>
    </q-tab-panel>
  </q-tab-panels>

  </div>
</template>

<script>
import mailSettings from "../../../../modules/mail/settings";
import cServer from "../../../../modules/mail/classes/cServer";

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
  },

  mounted () {
    if (this.iEditAccountId === -1 && this.accounts.length > 0) {
      this.changeEditAccount(Number(this.$route.params.accountId))
    }
    this.bAllowIdentities = mailSettings.bAllowIdentities
    this.bAllowAliases = mailSettings.bAllowAliases
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
  },
}
</script>

<style scoped>

</style>
