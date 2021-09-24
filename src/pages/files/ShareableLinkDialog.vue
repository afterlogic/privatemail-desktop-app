<template>
  <q-dialog v-model="confirm" @escape-key="cancelDialog">
    <q-card class="q-dialog-size" style="min-width: 350px">
      <div v-if="(file && !file.isEncrypted() || publicLink) && !showEncryptedLink">
        <div v-if="!publicLink">
          <div class="q-mx-md q-mt-md q-pl-sm" style="font-size: 13pt"><b>Create shareable link</b></div>
          <q-item>
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
          <div style="margin: 0 26px" v-if="isFolder">
            <q-item-label caption >Shareable links for folders don't support password protection</q-item-label>
          </div>
        </div>
        <div v-if="publicLink">
          <q-item class="q-mt-md">
            <q-item-section class="q-mr-md">
              <q-item-label>Protected shareable link</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input outlined dense v-model="publicLink"  style="width: 400px"/>
            </q-item-section>
          </q-item>
          <q-item class="q-mt-md" v-if="passwordForSharing">
            <q-item-section class="q-mr-md">
              <q-item-label>Password</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input outlined dense v-model="passwordForSharing"  style="width: 400px"/>
            </q-item-section>
          </q-item>
          <q-item class="q-mt-md">
            <q-item-section>
              <q-item-label>Recipient</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                dense outlined class="recipients-select"
                use-input use-chips input-debounce="0"
                ref="whoCanSee"
                v-model="recipient" :options="recipientOptions"
                @filter="getContactsOptions"
                style="width: 400px"
              >
                <template v-if="recipient" v-slot:selected>
                      <span>
                        <q-chip flat removable @remove="removeSelectedToAddr()">
                          <div>
                            {{ recipient.short }}
                          </div>
                          <div>
                            <q-icon v-if="hasPgpKey" color="green" name="vpn_key"/>
                          </div>
                        </q-chip>
                      </span>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section class="non-selectable">
                      <q-item-label>
                        {{ scope.opt.label }}
                        <q-icon v-if="hasPgpKeyy(scope)" name="vpn_key" />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-item-section>
          </q-item>
          <div v-if="!file.isEncrypted() && passwordForSharing">
            <q-item dense class="q-my-sm">
              <q-item-section>
                <q-item-label caption>{{ recipientLabel }}</q-item-label>
              </q-item-section>
            </q-item>
            <div style="margin-left: 16px" class="q-mt-sm">
              <q-checkbox :disable="!hasPgpKey || !hasPrivateKey" dense v-model="digitalSignature" label="Add digital signature" />
            </div>
            <q-item dense class="q-my-sm">
              <q-item-section>
                <q-item-label caption>{{ signatureLabel }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </div>
      <div v-else class="q-mr-sm">
        <div class="q-mx-md q-mt-md q-pl-sm" style="font-size: 13pt"><b>Create shareable link</b></div>
        <q-item class="q-mt-md q-ml-sm">
          <q-item-section>
            <q-item-label style="width: 104px">Recipient</q-item-label>
          </q-item-section>
            <q-select
              dense outlined class="recipients-select"
              use-input use-chips input-debounce="0"
              ref="whoCanSee"
              v-model="recipient" :options="recipientOptions"
              @filter="getContactsOptions"
              style="width: 368px"
            >
              <template v-if="recipient" v-slot:selected>
                      <span>
                        <q-chip flat removable @remove="removeSelectedToAddr()">
                          <div>
                            {{ recipient.short }}
                          </div>
                          <div>
                            <q-icon v-if="hasPgpKey" color="green" name="vpn_key"/>
                          </div>
                        </q-chip>
                      </span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section class="non-selectable">
                    <q-item-label>
                      {{ scope.opt.label }}
                      <q-icon v-if="hasPgpKeyy(scope)" name="vpn_key" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
        </q-item>
        <div v-if="showEncryptedLink">
          <q-item dense class="q-ml-sm">
            <q-item-label caption>Encrypted file shareable link</q-item-label>
          </q-item>
          <q-item class="q-ml-sm">
            <q-item-label>{{ publicLink }}</q-item-label>
          </q-item>
          <q-item dense class="q-ml-sm" v-if="!passwordForSharing">
            <q-item-label caption>The file is encrypted using vadim's PGP public key. You can send the link via encrypted email.</q-item-label>
          </q-item>
          <div v-if="passwordForSharing">
            <q-item dense class="q-ml-sm">
              <q-item-label caption>Encrypted file password</q-item-label>
            </q-item>
            <q-item class="q-ml-sm">
              <q-item-label>{{ passwordForSharing }}</q-item-label>
            </q-item>
            <q-item dense class="q-ml-sm">
              <q-item-label caption>If you don't send email now, store the password somewhere. You will not be able to recover it otherwise</q-item-label>
            </q-item>
          </div>
        </div>
        <div v-else>
          <q-item class="q-ml-sm">
            <q-item-label caption>{{ recipientLabel }}</q-item-label>
          </q-item>
          <q-item class="q-ml-sm">
            <q-item-section>Encryption type</q-item-section>
            <div class="q-gutter-sm">
              <q-radio :disable="!hasPgpKey" v-model="encryptionType" val="key" label="Key-based"/>
              <q-radio v-model="encryptionType" val="password" label="Password-based"/>
            </div>
          </q-item>
          <q-item dense class="q-ml-sm">
            <q-item-label caption>{{ labelEncryptionType }}</q-item-label>
          </q-item>
          <div style="margin-left: 24px">
            <q-checkbox :disable="!hasPgpKey || encryptionType === 'password'" dense v-model="digitalSignature" label="Add digital signature" />
          </div>
          <q-item dense class="q-ml-sm q-mt-sm">
            <q-item-section>
              <q-item-label caption>{{ availabilityLabel }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
      <q-card-actions align="right">
        <div v-if="file && file.isEncrypted() && !publicLink && !showEncryptedLink">
          <q-btn :disable="removing || !recipient" flat :ripple="false" color="primary" @click="askOpenPgpKeyPasswordForEncrypt"
                 :label="removing ? 'Removing link' : 'Encrypt'" />
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancelDialog"
                 label="Close" />
        </div>
        <div v-else-if="showEncryptedLink">
          <q-btn v-if="hasPgpKey" :disable="!recipient || removing" flat :ripple="false" color="primary" @click="sendViaEncryptedEmail"
                 label="Send via encrypted email" />
          <q-btn v-else flat :disable="!recipient || removing" :ripple="false" color="primary"
                 label="Send via email" @click="sendViaEmail"/>
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancelDialog"
                 label="Close" />
        </div>
        <div v-else>
          <q-btn :disable="creating" v-if="!publicLink" flat :ripple="false" color="primary" @click="createPublicLink"
                 :label="creating ? 'Creating shareable link' : 'Create shareable link'" />
          <q-btn v-if="publicLink" flat :ripple="false" color="primary" @click="showHistory"
                 label="Show history" />
          <q-btn v-if="publicLink && (!hasPgpKey || !passwordForSharing)" flat :disable="!recipient || removing" :ripple="false" color="primary"
                 label="Send via email" @click="sendViaEmail"/>
          <q-btn v-if="hasPgpKey && passwordForSharing && publicLink" :disable="!recipient || removing" flat :ripple="false" color="primary" @click="sendViaEncryptedEmail"
                 label="Send via encrypted email" />
          <q-btn :disable="removing" v-if="publicLink" flat :ripple="false" color="primary" @click="removeLink"
                 :label="removing ? 'Removing link' : 'Remove link'" />
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" @click="cancelDialog"
                 label="Close" />
        </div>
      </q-card-actions>
    </q-card>
    <show-history-dialog ref="showHistoryDialog"/>
  </q-dialog>
</template>

<script>
import OpenPgp from '../../modules/openpgp/OpenPgp'
import { ipcRenderer } from 'electron'
import _ from 'lodash'
import cContact from '../../modules/contacts/classes/CContact'
import addressUtils from '../../utils/address'
import ShowHistoryDialog from './ShowHistoryDialog'
import CCrypto from '../../modules/crypto/CCrypto'
import notification from "../../utils/notification";


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
      showLinkData: false,
      showEncryptedLink: false,
      passphrase: null,
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
      ],
      encryptionType: 'password',
      digitalSignature: false
    }
  },
  components: {
    ShowHistoryDialog
  },
  computed: {
    isFolder () {
      return this.file?.IsFolder
    },
    isEncrypted () {
      if (this.file) {
        if (this.file.ExtendedProps?.InitializationVector && this.file.ExtendedProps?.ParanoidKey) {
          return true
        }
      }
      return false
    },
    hasPgpKey () {
      if (this.recipient) {
        return OpenPgp.getPublicKeyByEmail(this.recipient?.email)
      }
      return false
    },
    hasPrivateKey () {
      let email = this.$store.getters['mail/getCurrentAccountEmail']
      return OpenPgp.getPrivateKeyByEmail(email)
    },
    recipientLabel () {
      if (this.file?.isEncrypted()) {
        if (this.recipient) {
          if (OpenPgp.getPublicKeyByEmail(this.recipient.email)) {
            return 'Selected recipient has PGP public key. The file can be encrypted using this key.'
          } else {
            return 'Selected recipient has no PGP public key. The Key-based encryption is not allowed.'
          }
        } else {
          return 'Without selected recipient, only Password-based encryption is allowed.'
        }
      } else {
        if (this.recipient) {
          if (OpenPgp.getPublicKeyByEmail(this.recipient.email)) {
            if (this.digitalSignature) {
              return 'You can send the link and the password via digitally signed encrypted email.'
            } else {
              return 'You can send the link and the password via encrypted email.'
            }
          } else {
            return 'You can send the link via email. The password must be sent using a different channel.' +
              'You will be able to retrieve the password when need.'
          }
        } else {
          return ''
        }
      }
    },
    labelEncryptionType () {
      if (this.encryptionType === 'password') {
        return 'The Password-based encryption will be used.'
      }
      if (this.encryptionType === 'key') {
        return 'The Key-based encryption will be used.'
      }
      return 'The Password-based encryption will be used.'
    },
    signatureLabel () {
      if (this.digitalSignature) {
        return 'The email will be signed using your private key.'
      } else {
        if (!this.hasPrivateKey) {
          return 'The email will not be signed. Requires your PGP private key in Settings.'
        }
        return 'The email will not be signed.'
      }
    },
    availabilityLabel () {
      if (this.encryptionType === 'password') {
        return 'Will not sign the data. Requires key-based encryption.'
      }
      if (this.encryptionType === 'key') {
        return this.digitalSignature ? 'Will sign the data with your private key.' : 'Will not sign the data.'
      }
      return ''
    }
  },
  watch: {
    encryptionType(val) {
      if (val === 'password') {
        this.digitalSignature = false
      }
      if (val === 'key') {
        this.digitalSignature = true
      }
    },
    recipient (val) {
      console.log(val)
      if (!this.file.isEncrypted()) {
        if (val) {
          if (this.hasPrivateKey) {
            const publicKey = OpenPgp.getPublicKeyByEmail(val.email)
            this.digitalSignature = !!publicKey
          }
        } else {
          this.digitalSignature = false
        }
      }
    }
  },
  methods: {
    hasPublicKey (scope) {
      return OpenPgp.getPublicKeyByEmail(scope.opt.email)
    },
    hasPgpKeyy (scope) {
      return OpenPgp.getPublicKeyByEmail(scope.opt.email)
    },
    removeSelectedToAddr () {
      this.recipient = null
    },
    openComposeWithPassphrase (passphrase) {
      if ((this.encryptionType === 'key' || this.passwordForSharing) && this.digitalSignature) {
          const linkText = 'Hi, you can get the encrypted file here: ' + '<a class="text-primary">' + this.publicLink + '</a>'
          let passText = ''
          if (this.passwordForSharing) {
            passText = '<br>File encrypted with password: ' + this.passwordForSharing
          }
          this.openCompose({
            aToContacts: [this.recipient],
            sText: linkText + passText,
            sSubject: `The encrypted file was shared with you: '${this.file.Name}'`,
            needToSignEncrypt: true,
            sPassphrase: passphrase
          })
      }
    },
    async sendViaEncryptedEmail () {
      const linkText = 'Hi, you can get the encrypted file here: ' + '<a class="text-primary">' + this.publicLink + '</a>'
      let passText = ''
      if (this.passwordForSharing) {
         passText = '<br>File encrypted with password: ' + this.passwordForSharing
      }
      let subject = ''
      if (this.file.isEncrypted()) {
        subject = `The encrypted file was shared with you: '${this.file.Name}'`
      } else {
        subject = `The file was shared with you: '${this.file.Name}'`
      }
      if ((this.encryptionType === 'key' || this.passwordForSharing) && this.digitalSignature) {
        let email = this.$store.getters['mail/getCurrentAccountEmail']
        let pgpKey = await OpenPgp.getPrivateOwnKeyAndPassphrase(email, this.askOpenPgpKeyPassword)
        if (pgpKey.oPrivateKey) {
          this.openCompose({
            aToContacts: [this.recipient],
            sText: linkText + passText,
            sSubject: subject,
            needToSignEncrypt: true,
            sPassphrase: pgpKey.sPassphrase
          })
        }
      } else {
        this.openCompose({
          aToContacts: [this.recipient],
          sText: linkText + passText,
          sSubject: subject,
          needToEncrypt: true,
        })
      }
    },
    askOpenPgpKeyPasswordForEncrypt () {
      const currentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']
      const privateKey = OpenPgp.getPrivateKeyByEmail(currentAccountEmail)
      if (privateKey) {
        let sPassphrase = privateKey.getPassphrase()
        if (sPassphrase) {
          this.encryptLink(sPassphrase)
        } else {
          this.askOpenPgpKeyPassword(currentAccountEmail, this.encryptLink)
        }
      } else {
        notification.showError('No private key found for message decryption.')
      }

    },
    encryptLink (passPassphrase) {
      this.passphrase = passPassphrase
      const currentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']
      const privateKey = OpenPgp.getPrivateKeyByEmail(currentAccountEmail)
      const publicKey = OpenPgp.getPublicKeyByEmail(currentAccountEmail)
      const passwordBasedEncryption = this.encryptionType === 'password'
      CCrypto.getEncryptedKey(this.file, privateKey, publicKey, currentAccountEmail, passPassphrase, null, passwordBasedEncryption).then(encryptKey => {
        if (encryptKey?.sError) {
          notification.showError(encryptKey.sError)
        } else if (encryptKey) {
          this.passwordForSharing = encryptKey.password
          const parameters = {
            type: this.$store.getters['files/getCurrentStorage'].Type,
            path: this.$store.getters['files/getCurrentPath'],
            name: this.file.Name,
            paranoidKey: {
              value: encryptKey.data,
              key: 'ParanoidKeyPublic'
            },
            callback: this.createEncryptPublicLink
          }
          this.$store.dispatch('files/updateExtendedProps', parameters)
        }
      })
    },
    createEncryptPublicLink (type, path, name) {
      const parameters = {
        type,
        path,
        name,
        size: this.file.Size,
        isFolder: this.file.IsFolder,
        recipientEmail: this.recipient.email,
        pgpEncryptionMode: this.encryptionType,
        lifetimeHrs: 0
      }
      this.$store.dispatch('files/createPublicLink', parameters).then( res => {
        if (res) {
         const apiHost = this.$store.getters['main/getApiHost']
          this.showEncryptedLink = true
          this.publicLink = apiHost + res.link
        }
      })
    },
    async showHistory () {
      const title = 'Shareable link activity history'
      this.$refs.showHistoryDialog.openDialog(this.file, title)
    },
    openDialog (file) {
      this.populate(file)
      this.confirm = true
    },
    populate (file) {
      this.encryptionType = 'password'
      this.digitalSignature = false
      this.showEncryptedLink = false
      this.removing = false
      this.creating = false
      this.recipient = null
      this.file = file
      this.hasLinkPassword = false
      const publicLink = file.hasLink()
      this.publicLink = publicLink ? this.$store.getters['main/getApiHost'] + '/' + publicLink : ''
      this.passwordForSharing = file.File?.ExtendedProps?.PasswordForSharing || ''
      this.lifetime = {
        value: 0,
        label: 'Eternal'
      }
    },
    sendViaEmail () {
      this.openCompose({
        aToContacts: [this.recipient],
        sText: 'Hello, <br> You can download the file at: ' + '<a class="text-primary">' + this.publicLink + '</a>',
        sSubject: `The ${this.file.IsFolder ? 'folder' : 'file'} was shared with you: '${this.file.Name}'`
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
          let option = this.getOptionFromContact(oContact)
          aOptions.push(option)
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
            return contact.email === currentAccount.sEmail
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
        value: oContact.UUID,
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
