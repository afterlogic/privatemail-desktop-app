<template>
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
      <div class="row" style="margin-left: 18px">
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

      <div class="row" style="margin-left: 18px">
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
    </div>
    <q-separator spaced/>
    <q-card-actions align="right">
      <q-btn v-if="!bAutoresponderSaving" style="margin-right: 10px; width: 80px" color="primary" label="Save"
             @click="updateAutoresponder"/>
      <q-btn v-else style="margin-right: 10px; width: 80px" color="primary" label="Saving..."/>
    </q-card-actions>
<!--    </q-tab-panel>-->
  </div>
</template>

<script>
import {ipcRenderer} from "electron";
import notification from "../../../../utils/notification";
import errors from "../../../../utils/errors";

export default {
  name: "Autoresponder",
  data() {
    return {
      oAutoresponder: {
        enableAutoresponder: false,
        subject: '',
        message: ''
      },
      bAutoresponderSaving: false,
    }
  },
  mounted() {
    this.iEditAccountId = Number(this.$route.params.accountId)
    this.getAutoresponder()
  },
  watch: {
    iEditAccountId () {
      this.getAutoresponder()
    }
  },
  methods: {
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
