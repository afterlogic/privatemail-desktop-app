<template>
<div>
  <q-list class="non-selectable">
    <q-item tag="label">
      <q-item-section side top>
        <q-checkbox v-model="bUseThreading" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Use mail threading if supported by the server</q-item-label>
      </q-item-section>
    </q-item>

    <q-item tag="label">
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
  <div class="q-pa-md row ">
    <q-btn unelevated color="primary" v-if="bAccountSaving" label="Saving..." />
    <q-btn unelevated color="primary" v-if="!bAccountSaving" label="Save" @click="saveAccountSettings" />
    <q-space />
    <q-btn unelevated color="primary" v-if="bAllowChangePasswordOnMailServer" label="Change Password" @click="openChangePassword" />
  </div>

  <q-dialog v-model="bRemoveAccountDialog" persistent>
    <q-card class="q-px-sm non-selectable q-dialog-size">
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

  <q-dialog v-model="bChangeAccountPasswordDialog" persistent>
    <q-card class="q-px-sm non-selectable q-dialog-size">
      <q-card-section>
        <div class="text-h6">Change password</div>
      </q-card-section>

      <q-item>
        <q-item-section>
          <q-item-label>Current password</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input outlined dense class="input-size" type="password" v-model="sChangePasswordCurrent" v-on:keyup.enter="changePassword" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>New password</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input outlined dense class="input-size" type="password" v-model="sChangePasswordNew" v-on:keyup.enter="changePassword" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>Confirm new password</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-input outlined dense class="input-size" type="password" v-model="sChangePasswordConfirmNew" v-on:keyup.enter="changePassword" />
        </q-item-section>
      </q-item>
      <q-card-actions align="right">
        <q-btn flat label="Saving..." color="primary" v-if="bChangingPassword" />
        <q-btn flat label="Save" color="primary" @click="changePassword" v-if="!bChangingPassword" />
        <q-btn flat label="Cancel" color="grey-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="bWarningAboutLogoutDialog" persistent>
    <q-card class="q-px-sm non-selectable q-dialog-size">
      <q-card-section>
        <div class="text-h6"></div>
      </q-card-section>

      <q-item>
        <q-item-label>Your password has been changed. You will be redirected to login page.</q-item-label>
      </q-item>

      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" @click="logoutAfterChangePassword" v-close-popup />
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
  props: {
    accounts: {
      type: Array
    }
  },
  data() {
    return {
      bUseThreading: false,
      bSaveRepliesToCurrFolder: false,
      bDefaultAccount: false,
      bAccountSaving: false,
      bAllowChangePasswordOnMailServer: false,
      iEditAccountId: '',
      bRemoveAccountDialog: false,
      bChangeAccountPasswordDialog: false,
      sChangePasswordCurrent: '',
      sChangePasswordNew: '',
      sChangePasswordConfirmNew: '',
      bChangingPassword: false,
      bWarningAboutLogoutDialog: false,
    }
  },
  mounted () {
    this.iEditAccountId = Number(this.$route.params.accountId)
    this.initSubscriptions()
  },
  beforeDestroy() {
    this.destroySubscriptions()
  },
  computed: {
    editAccount () {
      return _.find(this.accounts, (oAccount) => {
        return oAccount.iAccountId === this.iEditAccountId
      })
    },
  },
  watch: {
    '$route.params.accountId': function () {
      this.iEditAccountId = Number(this.$route.params.accountId)
    },
    editAccount () {
      if (this.editAccount) {
        this.bDefaultAccount = this.editAccount.bDefault
        this.bUseThreading = this.editAccount.bUseThreading
        this.bSaveRepliesToCurrFolder = this.editAccount.bSaveRepliesToCurrFolder
        this.bAllowChangePasswordOnMailServer = !!this.editAccount.oExtend.AllowChangePasswordOnMailServer
      }
    },
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
      if (this.editAccount) {
        return this.editAccount.bUseThreading !== this.bUseThreading || this.editAccount.bSaveRepliesToCurrFolder !== this.bSaveRepliesToCurrFolder
      }
      return false
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
    openRemoveAccountDialog () {
      if (!this.bDefaultAccount) {
        this.bRemoveAccountDialog = true
      }
    },
    openChangePassword () {
      this.bChangeAccountPasswordDialog = true
      this.sChangePasswordCurrent = ''
      this.sChangePasswordNew = ''
      this.sChangePasswordConfirmNew = ''
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
        if (this.accounts.length) {
          this.$router.push(`/settings/accounts/account/${this.accounts[0].iAccountId}/props`)
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing account.'))
      }
    },
    initSubscriptions() {
      ipcRenderer.on('mail-save-account-settings', this.onSaveAccountSettings)
      ipcRenderer.on('mail-change-password', this.onChangePassword)
      ipcRenderer.on('mail-remove-account', this.onRemoveAccount)
    },
    destroySubscriptions() {
      ipcRenderer.removeListener('mail-save-account-settings', this.onSaveAccountSettings)
      ipcRenderer.removeListener('mail-change-password', this.onChangePassword)
      ipcRenderer.removeListener('mail-remove-account', this.onRemoveAccount)
    },
    onSaveAccountSettings (oEvent, { bResult, iAccountId, bUseThreading, bSaveRepliesToCurrFolder, oError }) {
      this.bAccountSaving = false
      if (bResult) {
        notification.showReport('Settings have been updated successfully.')
        this.$store.commit('mail/setAccountSettings', { iAccountId, bUseThreading, bSaveRepliesToCurrFolder })
        this.$store.dispatch('mail/asyncRefresh', false)
        if (iAccountId === this.iEditAccountId) {
          this.bUseThreading = bUseThreading
          this.bSaveRepliesToCurrFolder = bSaveRepliesToCurrFolder
        }
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
      }
    },
    changePassword () {
      if (this.sChangePasswordNew !== this.sChangePasswordConfirmNew) {
        notification.showError('Passwords do not match')
      } else {
        this.bChangingPassword = true
        ipcRenderer.send('mail-change-password', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          iAccountId: this.iEditAccountId,
          sCurrentPassword: this.sChangePasswordCurrent,
          sNewPassword: this.sChangePasswordNew,
        })
      }
    },
    onChangePassword(oEvent, {bResult, oError}) {
      this.bChangingPassword = false
      if (bResult) {
        notification.showReport('Password was successfully changed.')
        this.bWarningAboutLogoutDialog = true
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while changing password.'))
      }
    },
    logoutAfterChangePassword() {
      this.$router.push({path: '/login'})
    },
  }
}
</script>

<style scoped>

</style>
