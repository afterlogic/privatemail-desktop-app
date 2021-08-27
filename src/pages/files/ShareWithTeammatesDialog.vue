<template>
  <div>
    <q-dialog v-model="confirm" persistent>
      <q-card class="q-dialog-size" style="min-width: 300px">
        <div class="q-mx-sm q-mt-md q-pl-xs" style="font-size: 13pt"><b>Share with teammates</b></div>
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
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section class="non-selectable">
                    <q-item-label>
                      {{ scope.opt.label }}
                      <q-icon v-if="hasPgpKey(scope)" name="vpn_key" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section class="non-selectable">
                    <q-item-label>
                      {{ scope.opt.label }}
                      <q-icon v-if="hasPgpKey(scope)" name="vpn_key" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat class="q-px-sm" :ripple="false" color="primary"
                 label="Show history" @click="showHistory"/>
          <q-btn :disable="saving" flat class="q-px-sm" :ripple="false" color="primary"
                 :label="saving ? 'Saving...' : 'Save'" @click="updateShare"/>
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
import OpenPgp from '../../modules/openpgp/OpenPgp'
import CCrypto from '../../modules/crypto/CCrypto'
import notification from "../../utils/notification";

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
      file: null,
      saving: false,
      principalsEmails: []
    }
  },
  methods: {
    hasPgpKey (scope) {
      return OpenPgp.getPublicKeyByEmail(scope.opt.email)
    },
    showHistory () {
      const title = 'Shared file activity history'
      this.$refs.showHistoryDialog.openDialog(this.file, title)
    },
    openDialog (file) {
      this.saving = false
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
      this.getRecipientOptions(sSearch, update, abort, 'toAddrOptions')
    },
    getContactsSeeOptions (sSearch, update, abort) {
      this.getRecipientOptions(sSearch, update, abort, 'toAddrOptions')
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
          let options = []
          aOptions.map( contact => {
            options.push({
              email: contact.email,
              label: contact.email,
              value: contact.email,
            })
          })
          const currentAccount = this.$store.getters['mail/getCurrentAccount']
          const index = options.findIndex( contact => {
            return contact.email === currentAccount.sEmail
          })
         if (index !== -1) {
           options.splice(index, 1)
         }
          this[sOptionsName] = options
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
        value: oContact.UUID,
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
      this.principalsEmails = this.getPrincipalsEmails()
      if (this.file.ExtendedProps.ParanoidKey) {
        let keylessContacts = []
        this.principalsEmails.map( contact => {
          if (!OpenPgp.getPublicKeyByEmail(contact)) {
            keylessContacts.push(contact)
            notification.showError(`No public key found for ${contact} user.`)
          }
        })
        if (!keylessContacts.length) {
          this.saving = true
          const currentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']
          const privateKey = OpenPgp.getPrivateKeyByEmail(currentAccountEmail)
          let sPassphrase = privateKey.getPassphrase()
          if (sPassphrase) {
            this.updateExtendedProps(sPassphrase)
          } else {
            this.askOpenPgpKeyPassword(currentAccountEmail, this.updateExtendedProps)
          }
        }
      } else {
        this.saving = true
        this.nextUpdateShare()
      }
    },
    getPrincipalsEmails () {
      let principalsEmails = []
      this.whoCanSee.map( contact => {
        principalsEmails.push(contact.email)
      })
      this.whoCanEdit.map( contact => {
        principalsEmails.push(contact.email)
      })
      return principalsEmails
    },
    updateExtendedProps (passPassphrase) {
      const currentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']
      const privateKey = OpenPgp.getPrivateKeyByEmail(currentAccountEmail)
      const publicKey = OpenPgp.getPublicKeyByEmail(currentAccountEmail)
      CCrypto.getEncryptedKey(this.file, privateKey, publicKey, currentAccountEmail, passPassphrase, null, false, this.principalsEmails).then( encryptKey => {
        if (encryptKey?.sError) {
          notification.showError(encryptKey.sError)
          this.saving = false
        } else if (encryptKey) {
          const parameters = {
            type: this.$store.getters['files/getCurrentStorage'].Type,
            path: this.$store.getters['files/getCurrentPath'],
            name: this.file.Name,
            paranoidKey: {
              value: encryptKey.data,
              key: 'ParanoidKeyShared'
            },
            callback: this.nextUpdateShare
          }
          this.$store.dispatch('files/updateExtendedProps', parameters)
        } else {
          this.saving = false
        }
      })
    },
    nextUpdateShare () {
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
        this.saving = false
      })
    }
  }
}
</script>

<style scoped>

</style>
