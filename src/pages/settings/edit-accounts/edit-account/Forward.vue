<template>
  <div>
    <q-list class="non-selectable" style="width: 450px;">
      <q-item>
        <q-item-section side top>
          <q-checkbox  v-model="bEnableForward" label="Enable forward"/>
        </q-item-section>
      </q-item>
      <q-item class="q-ml-xs">
          <q-item-section>
            <q-item-label>Email</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense bg-color="white" class="input-size" :disable="!bEnableForward" v-model="forwardEmail"/>
          </q-item-section>
        </q-item>

    </q-list>
    <q-separator spaced/>
    <div class="q-pa-md">
      <q-btn unelevated v-if="!bForwardSaving" class="q-mr-md" color="primary" label="Save"
             @click="updateForward"/>
      <q-btn unelevated v-else class="q-mr-md" color="primary" label="Saving..."/>
    </div>
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
    },
    accountForward: {
      type: Object
    },
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
    this.bEnableForward = this.accountForward.bEnableForward
      this.bEnableForwardFromServer = this.accountForward.bEnableForwardFromServer
      this.forwardEmail = this.accountForward.forwardEmail
      this.forwardEmailFromServer = this.accountForward.forwardEmail
    this.getForward()
  },
  computed: {

  },
  watch: {
    iEditAccountId () {
      this.getForward()
    },
    '$route.params.accountId': function () {
      this.bEnableForward = this.accountForward.bEnableForward
      this.bEnableForwardFromServer = this.accountForward.bEnableForwardFromServer
      this.forwardEmail = this.accountForward.forwardEmail
      this.forwardEmailFromServer = this.accountForward.forwardEmailFromServer
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
.input-size {
  width: 300px;
}
</style>
