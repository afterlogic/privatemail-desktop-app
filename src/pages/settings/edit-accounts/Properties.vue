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
</div>
</template>

<script>
import {ipcRenderer} from "electron";

export default {
  name: "Properties",
  props: {
    bUseThreading: {
      type: Boolean
    },
    bSaveRepliesToCurrFolder: {
      type: Boolean
    },
    bDefaultAccount: {
      type: Boolean
    },
    bAccountSaving: {
      type: Boolean
    },
    bAllowChangePasswordOnMailServer: {
      type: Boolean
    },
    openRemoveAccountDialog: {
      type: Function
    },
    openChangePassword: {
      type: Function
    }
  },
  computed: {

  },
  methods: {
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
  }
}
</script>

<style scoped>

</style>
