<template>
<div>
  <q-tabs v-if="editIdentity"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-route-tab :to="'/settings/accounts/identity/' + iEditIdentityAccountId + '/' + iEditIdentityId + '/props'" label="Properties" />
    <q-route-tab :to="'/settings/accounts/identity/' + iEditIdentityAccountId + '/' + iEditIdentityId + '/signature'" label="Signature" />
  </q-tabs>

  <q-separator v-if="editIdentity" />

  <q-tab-panels v-if="editIdentity"
                v-model="identityTab"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
  >
    <q-tab-panel name="Static" class="bg-grey-1">
        <router-view
          :bIdentityNoSignature="bIdentityNoSignature"
          :sIdentitySignature="sIdentitySignature"
          :bIdentitySaving="bIdentitySaving"
          :saveIdentitySettings="saveIdentitySettings"
        />
    </q-tab-panel>
  </q-tab-panels>
</div>
</template>

<script>
import mailSettings from 'src/modules/mail/settings.js'
import {ipcRenderer} from "electron";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";

export default {
  name: "editIdentityUI",
  data () {
    return {
      identityTab: 'Static',

      iEditIdentityId: -1,
      iEditIdentityAccountId: -1,
      iEditAccountId: -1,

      bAllowIdentities: false,
      aIdentityEmailOptions: [],
      bIdentityNoSignature: false,
      sIdentitySignature: '',
      bRemoveIdentityDialog: false,
      bNewIdentityDialog: false,
      sNewIdentityName: '',
      sNewIdentityEmail: '',
      aNewIdentityEmailOptions: [],
      iNewIdentityAccountId: -1,
      bNewIdentityDisableEmail: false,
      bNewIdentityAdding: '',
      bIdentitySaving: false,
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
      this.iEditIdentityId = Number(this.$route.params.identityId)
      this.initSubscriptions()
      this.changeEditIdentity(Number(this.$route.params.identityId), Number(this.$route.params.accountId))
    }
  },
  beforeDestroy() {
    this.destroySubscriptions()
  },
  computed: {
    accounts () {
      return this.$store.getters['mail/getAccounts']
    },
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
      this.iIdentityId = Number(this.$route.params.identityId)
      if (this.editIdentity) {
        this.bIdentityNoSignature = !this.editIdentity.bUseSignature
      }
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
    accounts () {
      if (!this.editAccount && this.accounts.length > 0) {
        this.iEditAccountId = this.accounts[0].iAccountId
      }
    },
  },

  methods: {
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
    changeEditIdentity(iIdentityId, iIdentityAccountId) {
      this.iEditAccountId = -1
      this.iEditIdentityAccountId = iIdentityAccountId
      this.iEditIdentityId = iIdentityId
      this.iEditAliasAccountId = -1
      this.iEditAliasId = -1
    },
    saveIdentitySettings (bIdentityNoSignature, sIdentitySignature) {
      if (this.editIdentity) {
        this.bIdentitySaving = true
        ipcRenderer.send('mail-save-identity-settings', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.editIdentity.iIdAccount,
          iIdentityId: this.iEditIdentityId,
          bDefault: undefined,
          sName: undefined,
          sEmail: undefined,
          bNoSignature: bIdentityNoSignature,
          sSignature: sIdentitySignature,
        })
      }
    },
    initSubscriptions() {
      ipcRenderer.on('mail-save-identity-settings-signature', this.onSaveIdentitySettings)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-identity-settings-signature', this.onSaveIdentitySettings)
    },
  }
}
</script>

<style scoped>

</style>
