<template>
  <div>
    <div class="q-pa-md">
      <q-item>
        <q-item-section side top>
          <q-checkbox  v-model="bEnableForward" label="Enable forward"/>
        </q-item-section>
      </q-item>
      <q-item class="items-center">
        <q-item-section side top>
          <span class="q-ml-sm">Email</span>
        </q-item-section>
        <q-item-section side top>
          <q-input :disable="!bEnableForward" v-model="forwardEmail" outlined bg-color="white" :dense=true
                   style="width: 350px; margin-left: 100px"/>
        </q-item-section>
      </q-item>
    </div>
    <q-separator spaced/>
    <q-card-actions align="right">
      <q-btn v-if="!bForwardSaving" style="margin-left: 20px; width: 80px" color="primary" label="Save"
             @click="updateForward"/>
      <q-btn v-else style="margin-left: 20px; width: 80px" color="primary" label="Saving..."/>
    </q-card-actions>
    <UnsavedChangesDialog ref="unsavedChangesDialog" />
  </div>
</template>

<script>
import {ipcRenderer} from "electron";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";
import UnsavedChangesDialog from "../../../UnsavedChangesDialog";

export default {
  name: "Forward",
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
      bEnableForward: false,
      bEnableForwardFromServer: false,
      forwardEmail: '',
      forwardEmailFromServer: '',
      bForwardSaving: false,
      iEditAccountId: -1,
    }
  },
  mounted() {
    this.iEditAccountId = Number(this.$route.params.accountId)
    this.getForward()
  },
  computed: {

  },
  watch: {
    iEditAccountId () {
      this.getForward()
    },
    '$route.params.accountId': function () {
      this.iEditAccountId = Number(this.$route.params.accountId)
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
        return this.bEnableForwardFromServer !== this.bEnableForward ||
          (this.forwardEmailFromServer !== this.forwardEmail && this.forwardEmailFromServer !== '')
    },
    updateForward() {
        this.bForwardSaving = true
        let oParameters = {
          AccountID: this.iEditAccountId,
          Enable: this.bEnableForward,
          Email: this.bEnableForward ? this.forwardEmail : ''
        }
        ipcRenderer.send('mail-update-forward', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          oParameters: oParameters
        })

        ipcRenderer.once('mail-update-forward', (event, {bResult, oError}) => {
          this.bForwardSaving = false
          if (bResult) {
            this.forwardEmailFromServer = this.forwardEmail
            this.bEnableForwardFromServer = this.bEnableForward
            notification.showReport('Forward has been updated successfully.')
          } else {
            notification.showError(errors.getText(oError, 'Error setup forward email.'))
          }
        })
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
          this.forwardEmail = bResult.Email
          this.forwardEmailFromServer = bResult.Email
          this.bEnableForward = bResult.Enable
          this.bEnableForwardFromServer = bResult.Enable
        }
      })
    },
  }
}
</script>

<style scoped>

</style>
