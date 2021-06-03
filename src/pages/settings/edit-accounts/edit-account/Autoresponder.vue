<template>
  <div>
    <div>
      <div class="q-pa-md">
        <q-item tag="label">
          <q-item-section side top>
            <q-checkbox v-model="oAutoresponder.enableAutoresponder"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Enable autoresponder</q-item-label>
          </q-item-section>
        </q-item>
      </div>
      <div class="row q-pa-md" style="margin-left: 18px">
        <div class="col-2">
          <span class="q-ml-sm">Subject</span>
        </div>
        <div class="col">
          <q-input
            :disable="!oAutoresponder.enableAutoresponder"
            v-model="oAutoresponder.subject" outlined
            :dense=true bg-color="white" style="width: 100%;"
          />
        </div>
      </div>

      <div class="row q-pa-md" style="margin-left: 18px">
        <div class="col-2">
          <span class="q-ml-sm">Message</span>
        </div>
        <div class="col">
          <q-editor
            bg-color="white"
            :disable="!oAutoresponder.enableAutoresponder"
            v-model="oAutoresponder.message"
            :definitions="{
                  bold: {label: 'Bold', icon: null, tip: 'My bold tooltip'}
                }"
          />
        </div>
      </div>
      <q-separator spaced/>
      <div class="q-pa-md" align="right">
        <q-btn class="q-ml-md" unelevated v-if="!bAutoresponderSaving" color="primary" label="Save"
               @click="updateAutoresponder"/>
        <q-btn class="q-ml-md" unelevated v-else  color="primary" label="Saving..."/>
      </div>
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
  name: "Autoresponder",
  components: {
    UnsavedChangesDialog
  },
  props: {
    autoresponder: {
      type: Object
    }
  },
  data() {
    return {
      oAutoresponder: {
        enableAutoresponder: false,
        subject: '',
        message: '',
        enableAutoresponderFromServer: false,
        subjectFromServer: '',
        messageFromServer: ''
      },
      bAutoresponderSaving: false,
    }
  },
  mounted() {
    this.fillAutoresponderData()
    this.iEditAccountId = Number(this.$route.params.accountId)
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
    fillAutoresponderData() {
      this.oAutoresponder.enableAutoresponder = this.autoresponder.enableAutoresponder
      this.oAutoresponder.subject = this.autoresponder.subject
      this.oAutoresponder.message = this.autoresponder.message
      this.oAutoresponder.enableAutoresponderFromServer = this.autoresponder.enableAutoresponderFromServer
      this.oAutoresponder.subjectFromServer = this.autoresponder.subjectFromServer
      this.oAutoresponder.messageFromServer = this.autoresponder.messageFromServer
    },
    hasChanges () {
      return this.oAutoresponder.enableAutoresponderFromServer !== this.oAutoresponder.enableAutoresponder ||
      this.oAutoresponder.subjectFromServer !== this.oAutoresponder.subject ||
      this.oAutoresponder.messageFromServer !== this.oAutoresponder.message
    },
    updateAutoresponder() {
      this.bAutoresponderSaving = true
      let oParameters = {
        AccountID: this.iEditAccountId,
        Enable: this.oAutoresponder.enableAutoresponder,
        Subject: this.oAutoresponder.subject,
        Message: this.oAutoresponder.message
      }
      ipcRenderer.send('mail-update-autoresponder', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        oParameters: oParameters
      })
      ipcRenderer.once('mail-update-autoresponder', (event, {bResult, oError}) => {
        this.bAutoresponderSaving = false
        if (bResult) {
          this.oAutoresponder.enableAutoresponderFromServer = this.oAutoresponder.enableAutoresponder
          this.oAutoresponder.subjectFromServer = this.oAutoresponder.subject
          this.oAutoresponder.messageFromServer = this.oAutoresponder.message
          notification.showReport('Autoresponder has been updated successfully.')
        } else {
          notification.showError(errors.getText(oError, 'Error setup forward email.'))
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
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
