<template>
  <div>
    <q-dialog v-model="confirm" persistent>
      <q-card class="q-dialog-size" style="min-width: 300px">
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>Who can see</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              ref="whoCanSee"
              dense
              outlined
              style="width: 350px"
              v-model="whoCanSee"
              multiple
              :options="toAddrOptions"
              use-chips
              stack-label
              @filter="getContactsSeeOptions"
            />
          </q-item-section>
        </q-item>
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>Who can edit</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              ref="whoCanEdit"
              dense
              outlined
              style="width: 350px"
              v-model="whoCanEdit"
              multiple
              :options="toAddrOptions"
              use-chips
              stack-label
              @filter="getContactsEditOptions"
            />
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat class="q-px-sm" :ripple="false" color="primary"
                 label="Show history" @click="showHistory"/>
          <q-btn flat class="q-px-sm" :ripple="false" color="primary"
                 label="Save" @click="updateShare"/>
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancel"
                 label="Cancel"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <show-history-dialog ref="showHistoryDialog"/>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import cContact from '../../modules/contacts/classes/CContact'
import addressUtils from '../../utils/address'
import _ from 'lodash'
import ShowHistoryDialog from './ShowHistoryDialog'

export default {
  name: 'ShareWithTeammatesDialog',
  components: {
    ShowHistoryDialog
  },
  data () {
    return {
      confirm: false,
      whoCanSee: [],
      whoCanEdit: [],
      toAddrOptions: [],
      file: null
    }
  },
  methods: {
    showHistory () {
      this.$refs.showHistoryDialog.openDialog(this.file)
    },
    openDialog (file) {
      this.file = file
      const shares = this.file?.ExtendedProps?.Shares
      if (shares) {
        shares.map( contact => {
          if (contact.Access === 2) {
            this.whoCanSee.push({
              email: contact.PublicId,
              label: contact.PublicId,
              value: contact.PublicId,
            })
          }
        })
        shares.map( contact => {
          if (contact.Access === 1) {
            this.whoCanEdit.push({
              email: contact.PublicId,
              label: contact.PublicId,
              value: contact.PublicId,
            })
          }
        })
      }
      this.confirm = true
    },
    getContactsEditOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'toAddrOptions', 'whoCanEdit')
    },
    getContactsSeeOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'toAddrOptions', 'whoCanSee')
    },
    getRecipientOptions (sSearch, update, abort, sOptionsName, sSelectName) {
      ipcRenderer.once('contacts-get-frequently-used-contacts', (oEvent, { aContacts }) => {
        let iExactlySearchIndex = -1
        let aOptions = []
        _.each(aContacts, (oContactData, iIndex) => {
          let oContact = new cContact(oContactData)
          if (sSearch === oContact.getFull()) {
            iExactlySearchIndex = iIndex
          }
          aOptions.push(this.getOptionFromContact(oContact))
        })
        let bAddFirstOption = sSearch !== '' && iExactlySearchIndex === -1
        if (bAddFirstOption) {
          let oEmailParts = addressUtils.getEmailParts(sSearch)
          aOptions.unshift({
            label: sSearch,
            value: 'rand_' + Math.round(Math.random() * 10000),
            full: sSearch,
            short: oEmailParts.name || oEmailParts.email,
            email: oEmailParts.email,
            hasPgpKey: false,
            pgpEncrypt: false,
            pgpSign: false,
          })
        }
        update(async () => {
          this[sOptionsName] = aOptions
          if (bAddFirstOption) {
            await this.$nextTick()
            this.$refs[sSelectName].setOptionIndex(0)
          } else if (iExactlySearchIndex >= 0) {
            await this.$nextTick()
            this.$refs[sSelectName].setOptionIndex(iExactlySearchIndex)
          }
        })
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', { sSearch, storage: 'team' })
    },
    getOptionFromContact (oContact) {
      let
        sName = _.trim(oContact.FullName),
        sEmail = _.trim(oContact.ViewEmail)

      return {
        full: oContact.getFull(),
        label: oContact.getFull(),
        value: 'id_' + oContact.EntityId,
        short: sName || sEmail,
        email: sEmail,
        hasPgpKey: !!oContact.PublicPgpKey,
        pgpEncrypt: !!oContact.PgpEncryptMessages,
        pgpSign: !!oContact.PgpSignMessages,
      }
    },
    cancel () {
      this.whoCanSee = []
      this.whoCanEdit = []
      this.confirm = false
    },
    updateShare () {
      const shares = []
      this.whoCanSee.map( contact => {
        shares.push({
          PublicId: contact.email,
          Access: 2
        })
      })
      this.whoCanEdit.map( contact => {
        shares.push({
          PublicId: contact.email,
          Access: 1
        })
      })
      this.$store.dispatch('files/updateShare', {
        storage: this.file.Type,
        path: this.file.Path,
        id: this.file.Name,
        isDir: this.file.IsFolder,
        shares
      }).then( result => {
        if (result) {
          this.whoCanSee = []
          this.whoCanEdit = []
          this.confirm = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
