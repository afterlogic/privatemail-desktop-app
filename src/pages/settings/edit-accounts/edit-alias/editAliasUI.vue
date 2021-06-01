<template>
<div>
  <q-tabs v-if="editAlias"
          inline-label
          :no-caps=true
          align="left"
          class="flex-start"
  >
    <q-route-tab :to="'/settings/accounts/alias/' + iEditAliasAccountId + '/' + iEditAliasId + '/props'" label="Properties" />
    <q-route-tab :to="'/settings/accounts/alias/' + iEditAliasAccountId + '/' + iEditAliasId + '/signature'" label="Signature" />
  </q-tabs>

  <q-separator v-if="editAlias" />

  <q-tab-panels v-if="editAlias"
                v-model="aliasTab"
                animated
                transition-prev="jump-up"
                transition-next="jump-up"
  >
    <q-tab-panel name="Static" class="bg-grey-1">
     <router-view
       :accounts="accounts"
       :bAliasNoSignature="bAliasNoSignature"
       :sAliasSignature="sAliasSignature"
       :bAliasSaving="bAliasSaving"
       :saveAliasSettings="saveAliasSettings"
     />
    </q-tab-panel>

  </q-tab-panels>
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
  data () {
    return {
      aliasTab: 'Static',

      iEditAliasAccountId: -1,
      iEditAliasId: -1,

      bAllowAliases: false,
      sAliasName: '',
      bAliasNoSignature: false,
      sAliasSignature: '',
      bAliasSaving: false,
    }
  },
  mounted() {
    if (this.editAlias) {
      this.sAliasName = this.editAlias.sFriendlyName
      this.bAliasNoSignature = !this.editAlias.bUseSignature
      this.sAliasSignature = this.editAlias.sSignature
    }
    this.iEditAliasAccountId = Number(this.$route.params.accountId)
    this.iEditAliasId = Number(this.$route.params.aliasId)
    this.initSubscriptions()
  },
  computed: {
    accounts () {
      return this.$store.getters['mail/getAccounts']
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
  beforeDestroy: function () {
    this.destroySubscriptions()
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
          sName:  undefined,
          bNoSignature:  bAliasNoSignature,
          sSignature: sAliasSignature,
        })
      }
    },
    onSaveAliasSettings (oEvent, { bResult, iAccountId, iAliasId, sName, sEmail, bNoSignature, sSignature, oError }) {
      this.bAliasSaving = false
      if (bResult) {
        notification.showReport('Settings have been updated successfully.')
        if (iAliasId === 0) {
          this.$store.commit('mail/setAccountSettings', { iAccountId, sName, bNoSignature, sSignature })
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
    initSubscriptions() {
      ipcRenderer.on('mail-save-alias-settings-signature', this.onSaveAliasSettings )
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-alias-settings-signature', this.onSaveAliasSettings )
    },
  }
}
</script>

<style scoped>

</style>
