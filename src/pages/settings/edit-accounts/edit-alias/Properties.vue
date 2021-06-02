<template>
<div>
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
  <UnsavedChangesDialog ref="unsavedChangesDialog" />
</div>
</template>

<script>
import {ipcRenderer} from "electron";
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
      sAliasName: '',
      bAliasSaving: false,
      bRemoveAliasDialog: false,
    }
  },
  props: {
    accounts: {
      type:  Array
    }
  },
  mounted() {
    if (this.editAlias) {
      this.sAliasName = this.editAlias.sFriendlyName
    }
    this.initSubscriptions()
  },
  watch: {
    '$route.params.aliasId': function () {
      if (this.editAlias) {
        this.iEditAliasId = Number(this.$route.params.aliasId)
        this.sAliasName = this.editAlias.sFriendlyName
      }
    },
    editAlias () {
      if (this.editAlias) {
        this.sAliasName = this.editAlias.sFriendlyName
      }
    },
  },
  computed: {
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
  beforeDestroy: function () {
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
      return  this.sAliasName !== this.editAlias.sFriendlyName
    },
    saveAliasSettings() {
      if (this.editAlias) {
        this.bAliasSaving = true
        ipcRenderer.send('mail-save-alias-settings', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.editAlias.iIdAccount,
          iAliasId: this.iEditAliasId,
          sName: this.sAliasName,
          bNoSignature: undefined,
          sSignature: undefined,
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
      ipcRenderer.on('mail-save-alias-settings-properties', this.onSaveAliasSettings)
      ipcRenderer.on('mail-remove-alias', this.onRemoveAlias)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-alias-settings-props', this.onSaveAliasSettings)
      ipcRenderer.removeListener('mail-remove-alias', this.onRemoveAlias)
    },
  }
}
</script>

<style scoped>

</style>
