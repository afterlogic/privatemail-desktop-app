<template>
  <div>
    <div class="text-h4 q-mb-md">Mail</div>
    <q-separator spaced />
    <q-list style="max-width: 500px;">
      <q-item>
        <q-item-section side top style="min-width: 140px;">
          Messages per page
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="iMailsPerPage" :options="aMailsPerPageList" dense style="width: 100%;"/>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side center>
          <q-checkbox v-model="bAllowAutosaveInDrafts" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Allow autosave in Drafts</q-item-label>
          <!-- <q-item-label caption>
            Some feature description
          </q-item-label> -->
        </q-item-section>
      </q-item>

      <!-- <q-item tag="label" v-ripple>
        <q-item-section side top>
        </q-item-section>
        <q-item-section>
          <q-item-label>Allow handling email links</q-item-label>
          <q-item-label caption>
            Open Compose screen on clicking mailto link on any web site.
            The link above may do nothing if you already set mailto association before.
          </q-item-label>
        </q-item-section>
      </q-item> -->
    </q-list>
    <q-separator spaced />
    <q-btn v-if="!bSaving" color="primary" label="Save" align="right" @click="save" />
    <q-btn v-if="bSaving" color="primary" label="Saving..." align="right" />
  </div>

</template>

<style></style>

<script>
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

import mailSettings from 'src/modules/mail/settings.js'

export default {
  name: 'MailSettings',

  data () {
    return {
      iMailsPerPage: 20,
      aMailsPerPageList: [10, 20, 30, 50, 75, 100, 150, 200],
      bAllowAutosaveInDrafts: false,

      bSaving: false,
    }
  },

  mounted () {
    this.iMailsPerPage = mailSettings.iMailsPerPage
    this.bAllowAutosaveInDrafts = mailSettings.bAllowAutosaveInDrafts
  },

  methods: {
    save () {
      this.bSaving = true
      webApi.sendRequest({
        sModule: 'Mail',
        sMethod: 'UpdateSettings',
        oParameters: {
          MailsPerPage: this.iMailsPerPage,
          AllowAutosaveInDrafts: this.bAllowAutosaveInDrafts,
        },
        fCallback: (bResult, oError) => {
          this.bSaving = false
          if (bResult) {
            mailSettings.setMailsPerPage(this.iMailsPerPage)
            mailSettings.setAllowAutosaveInDrafts(this.bAllowAutosaveInDrafts)
            notification.showReport('Settings have been updated successfully.')
          } else {
            notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
          }
        },
      })
    },
  },
}
</script>
