<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Contacts settings</div>
    <q-separator spaced />
    <q-list class="non-selectable" style="max-width: 500px;">
      <q-item>
        <q-item-section side center style="min-width: 140px;">
          Contacts per page
        </q-item-section>
        <q-item-section>
          <q-select outlined dense v-model="iContactsPerPage" :options="aContactsPerPageList" style="width: 100%;">
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
    </q-list>
    <q-separator spaced />
    <div class="q-pa-md">
      <q-btn unelevated v-if="!bSaving" color="primary" label="Save" align="right" @click="save" />
      <q-btn unelevated v-if="bSaving" color="primary" label="Saving..." align="right" />
    </div>
  </div>

</template>

<style></style>

<script>
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import webApi from 'src/utils/webApi.js'

import contactsSettings from 'src/modules/contacts/settings.js'

export default {
  name: 'ContactsSettings',

  data () {
    return {
      iContactsPerPage: 20,
      aContactsPerPageList: [10, 20, 30, 50, 75, 100, 150, 200],

      bSaving: false,
    }
  },

  mounted () {
    this.iContactsPerPage = contactsSettings.iContactsPerPage
  },

  methods: {
    save () {
      this.bSaving = true
      webApi.sendRequest({
        sModule: 'Contacts',
        sMethod: 'UpdateSettings',
        oParameters: {
          ContactsPerPage: this.iContactsPerPage,
        },
        fCallback: (bResult, oError) => {
          this.bSaving = false
          if (bResult) {
            contactsSettings.setContactsPerPage(this.iContactsPerPage)
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
