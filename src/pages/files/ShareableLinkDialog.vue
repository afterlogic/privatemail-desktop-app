<template>
  <q-dialog v-model="confirm" persistent>
    <q-card class="q-dialog-size" style="min-width: 300px">
      <div v-if="!publicLink">
        <q-item class="q-mt-md">
          <q-checkbox v-model="hasLinkPassword" :disable="isFolder" label="Protect link with password" />
        </q-item>
        <q-item class="q-mx-sm" v-if="hasLinkPassword">
          <q-item-section class="q-ml-sm">
            <q-item-label>Link lifetime</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select style="width: 150px" outlined dense v-model="lifetime" :options="lifetimeOptions"/>
          </q-item-section>
        </q-item>
      </div>
      <div v-if="publicLink">
        <q-item class="q-mt-md">
          <q-item-section class="q-mr-md">
            <q-item-label>Protected shareable link</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense v-model="publicLink"  style="width: 300px"/>
          </q-item-section>
        </q-item>
        <q-item class="q-mt-md" v-if="passwordForSharing">
          <q-item-section class="q-mr-md">
            <q-item-label>Password</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense v-model="passwordForSharing"  style="width: 300px"/>
          </q-item-section>
        </q-item>
        <q-item class="q-mt-md">
          <q-item-section>
            <q-item-label>Recipient</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              ref="whoCanSee"
              dense
              outlined
              style="width: 300px"
              v-model="recipient"
              :options="recipientOptions"
              stack-label
              @filter="getContactsOptions"
            />
          </q-item-section>
        </q-item>
      </div>
      <q-card-actions align="right">
        <q-btn :disable="creating" v-if="!publicLink" flat :ripple="false" color="primary" @click="createPublicLink"
               :label="creating ? 'Creating shareable link' : 'Create shareable link'" />
        <q-btn v-if="publicLink" flat :ripple="false" color="primary" @click="showHistory"
               label="Show history" />
        <q-btn v-if="publicLink" flat :disable="!recipient || removing" :ripple="false" color="primary"
               label="Send via email" @click="sendViaEmail"/>
        <q-btn :disable="removing" v-if="publicLink" flat :ripple="false" color="primary" @click="removeLink"
               :label="removing ? 'Removing link' : 'Remove link'" />
        <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancelDialog"
               label="Cancel" />
      </q-card-actions>
    </q-card>
    <show-history-dialog ref="showHistoryDialog"/>
  </q-dialog>
</template>

<script>
import OpenPgp from '../../modules/openpgp/OpenPgp'
import {ipcRenderer} from 'electron'
import _ from 'lodash'
import cContact from '../../modules/contacts/classes/CContact'
import addressUtils from '../../utils/address'
import ShowHistoryDialog from './ShowHistoryDialog'
export default {
  name: 'ShareableLinkDialog',
  data () {
    return {
      file: null,
      creating: false,
      removing: false,
      confirm: false,
      hasLinkPassword: false,
      recipient: null,
      recipientOptions: [],
      publicLink: '',
      passwordForSharing: '',
      lifetime: {
        value: 0,
        label: 'Eternal'
      },
      lifetimeOptions: [
        {
          value: 0,
          label: 'Eternal'
        },
        {
          value: 24,
          label: '24 hrs'
        },
        {
          value: 72,
          label: '72 hrs'
        },
        {
          value: 168,
          label: '7 days'
        },
      ]
    }
  },
  components: {
    ShowHistoryDialog
  },
  computed: {
    isFolder () {
      return this.file?.IsFolder
    }
  },
  methods: {
    showHistory () {
      const title = 'Shareable link activity history'
      this.$refs.showHistoryDialog.openDialog(this.file, title)
    },
    openDialog (file) {
      this.populate(file)
      this.confirm = true
    },
    populate (file) {
      this.removing = false
      this.creating = false
      this.recipient = null
      this.file = file
      this.hasLinkPassword = false
      const publicLink = file?.ExtendedProps?.PublicLink
      this.publicLink = publicLink ? this.$store.getters['main/getApiHost'] + '/' + publicLink : ''
      this.passwordForSharing = file?.ExtendedProps?.PasswordForSharing || ''
      this.lifetime = {
        value: 0,
        label: 'Eternal'
      }
    },
    sendViaEmail () {
      this.openCompose({
        aToContacts: [this.recipient],
        sText: 'Hello, You can download the file at: ' + '<a>' + this.publicLink + '</a>'
      })
    },
    removeLink () {
      this.removing = true
      this.$store.dispatch('files/removeLink', {
        type: this.file.Type,
        path: this.file.Path,
        name: this.file.Name
      }).then( result => {
        if (result) {
          this.confirm = false
          this.$store.dispatch('files/getFiles', {
            currentStorage: this.file.Type,
            path: this.file.Path })
        }
      })
    },
    getContactsOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'recipientOptions')
    },
    getRecipientOptions (sSearch, update, abort, sOptionsName) {
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
          const currentAccount = this.$store.getters['mail/getCurrentAccount']
          const index = aOptions.findIndex( contact => {
            return contact.value === currentAccount.sEmail
          })
          if (index !== -1) {
            aOptions.splice(index, 1)
          }
          this[sOptionsName] = aOptions
        })
      })
      ipcRenderer.send('contacts-get-frequently-used-contacts', { sSearch, storage: 'all' })
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
    createPublicLink () {
      this.creating = true
      const parameters = {
        type: this.file.Type,
        path: this.file.Path,
        name: this.file.Name,
        size: this.file.Size,
        isFolder: this.file.IsFolder,
        recipientEmail: '',
        pgpEncryptionMode: '',
        lifetimeHrs: this.lifetime.value
      }
      if (this.hasLinkPassword) {
        this.passwordForSharing = OpenPgp.generatePassword()
        parameters.password = this.passwordForSharing
      }
      this.$store.dispatch('files/createPublicLink', parameters).then( result => {
        if (result) {
          this.publicLink = this.$store.getters['main/getApiHost'] + '/' + result.link
          this.$store.dispatch('files/getFiles', {
            currentStorage: this.file.Type,
            path: this.file.Path })
        }
      })
    },
    cancelDialog () {
      this.confirm = false
    }
  }
}
</script>

<style scoped>

</style>
