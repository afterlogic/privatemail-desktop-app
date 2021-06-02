<template>
<div>
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
  <UnsavedChangesDialog ref="unsavedChangesDialog" />
</div>
</template>

<script>
import {ipcRenderer} from "electron";
import mailSettings from "../../../../modules/mail/settings";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";
import UnsavedChangesDialog from "../../../UnsavedChangesDialog";

export default {
  name: "Properties",
  components: {
    UnsavedChangesDialog
  },
  data() {
    return {
      bIdentityDisableDefault: false,
      bIdentityDefault: false,
      sIdentityName: '',
      aIdentityEmailOptions: [],
      bIdentityDisableEmail: false,
      sIdentityEmail: '',
      bIdentityIsAccountPart: false,
      bRemoveIdentityDialog: false,
      bIdentitySaving: false,
      iEditIdentityId: -1,
      iEditIdentityAccountId: -1
    }
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
  mounted() {
    this.initSubscriptions()
    if (this.editIdentity) {
      this.iEditIdentityAccountId =  Number(this.$route.params.accountId)
      this.iEditIdentityId = Number(this.$route.params.identityId)
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
  watch: {
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
    '$route.params.identityId': function () {
      this.iEditIdentityAccountId =  Number(this.$route.params.accountId)
      this.iEditIdentityId = Number(this.$route.params.identityId)
    },
  },
  beforeDestroy() {
    this.destroySubscriptions()
  },
  beforeRouteUpdate(to, from, next) {
    if (this.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.hasChanges() && _.isFunction(this?.$refs?.unsavedChangesDialog?.openConfirmDiscardChangesDialog)) {
      this.$refs.unsavedChangesDialog.openConfirmDiscardChangesDialog(next)
    } else {
      next()
    }
  },
  methods: {
    hasChanges () {
      return   this.bIdentityDefault !== this.editIdentity.bDefault ||
      this.sIdentityName !== this.editIdentity.sFriendlyName ||
      this.sIdentityEmail !== this.editIdentity.sEmail
    },
    saveIdentitySettings() {
      if (this.editIdentity) {
        this.bIdentitySaving = true
        ipcRenderer.send('mail-save-identity-settings', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.editIdentity.iIdAccount,
          iIdentityId: this.iEditIdentityId,
          bDefault:  this.bIdentityDefault,
          sName: this.sIdentityName,
          sEmail: this.sIdentityEmail,
          bNoSignature: undefined,
          sSignature: undefined,
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
    onRemoveIdentity(oEvent, {bResult, oError}) {
      if (bResult) {
        notification.showReport('Identity was successfully removed.')
        this.$store.dispatch('mail/asyncGetIdentities')
        this.$router.push(`/settings/accounts/account/${this.editIdentity.iIdAccount}/props`)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing identity.'))
      }
    },
    initSubscriptions() {
      ipcRenderer.on('mail-save-identity-settings-properties', this.onSaveIdentitySettings)
      ipcRenderer.on('mail-remove-identity', this.onRemoveIdentity)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-remove-identity', this.onRemoveIdentity)
      ipcRenderer.removeListener('mail-save-identity-settings-properties', this.onSaveIdentitySettings)
    },
  }
}
</script>

<style scoped>

</style>
