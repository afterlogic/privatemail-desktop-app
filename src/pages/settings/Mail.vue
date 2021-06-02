<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Mail settings</div>
    <q-separator spaced />
    <q-list class="non-selectable" style="max-width: 500px;">
      <q-item>
        <q-item-section side center style="min-width: 140px;">
          Messages per page
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="iMailsPerPage" :options="aMailsPerPageList" dense style="width: 100%;">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section class="non-selectable">
                  <q-item-label v-html="scope.opt" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
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
    <div class="q-pa-md">
        <q-btn unelevated v-if="!bSaving" color="primary" label="Save" align="right" @click="save" />
        <q-btn unelevated v-if="bSaving" color="primary" label="Saving..." align="right" />
    </div>
    <UnsavedChangesDialog ref="unsavedChangesDialog" />
  </div>

</template>

<style></style>

<script>
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

import mailSettings from 'src/modules/mail/settings.js'
import UnsavedChangesDialog from "../UnsavedChangesDialog";

export default {
  name: 'MailSettings',
  components: {
    UnsavedChangesDialog
  },
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
      return  this.iMailsPerPage !== mailSettings.iMailsPerPage || this.bAllowAutosaveInDrafts !== mailSettings.bAllowAutosaveInDrafts
    },
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
