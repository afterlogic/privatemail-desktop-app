<template>
  <div>
    <q-dialog v-model="confirm" @escape-key="cancel">
      <q-card class="q-dialog-size q-px-sm" style="width: 600px">
        <div class="q-px-md q-py-md text-h6" style="width: 552px; word-wrap: break-word;"><b>{{ fileName }}</b></div>
        <q-item class="q-pb-xs">
          <q-item-section>
            <q-item-label caption>This file is encrypted.</q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="q-pt-xs">
          <q-item-section>
            <q-item-label>Initialization Vector (IV)</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ initializationVector }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>You'll need IV and AES key if you want to download this file in encrypted form and
              <br>
              decrypt it by other means, such as with OpenSSL tool.
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn :disable="saving" flat class="q-px-sm" :ripple="false" color="primary"
                 label="Download encrypted" @click="downloadEncrypted"/>
          <q-btn :disable="saving" flat class="q-px-sm" :ripple="false" color="primary"
                 label="Get AES key" @click="getAesKey"/>
          <q-btn flat class="q-px-sm" :ripple="false" color="grey-6" @click="cancel"
                 label="Close"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showAes">
      <q-card class="q-dialog-size q-px-sm" style="width: 600px">
        <div class="q-ml-md q-mt-md" style="font-size: 13pt"><b>AES key</b></div>
        <q-item class="q-pt-xs">
          <q-item-section>
            <q-item-label>{{ aesKey }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-card-actions align="right">
          <q-btn flat class="q-px-sm" :ripple="false" color="primary" v-close-popup
                 label="Ok"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <ask-open-pgp-key-password ref="askOpenPgpKeyPassword"/>
  </div>
</template>

<script>
import AskOpenPgpKeyPassword from '../AskOpenPgpKeyPassword'
import OpenPgp from '../../modules/openpgp/OpenPgp'
import notification from '../../utils/notification'

export default {
  name: 'EncryptedFileInformationDialog',
  components: {AskOpenPgpKeyPassword},
  comments: {
    AskOpenPgpKeyPassword
  },
  data () {
    return {
      confirm: false,
      saving: false,
      showAes: false,
      file: null,
      aesKey: ''
    }
  },
  computed: {
    fileName () {
      return this.file ? this.file.Name : ''
    },
    initializationVector () {
      if (this.file) {
        return this.file.InitializationVector
      }
      return ''
    }
  },
  methods: {
    openDialog (file) {
      this.file = file
      this.confirm = true
    },
    cancel () {
      this.confirm = false
    },
    downloadEncrypted () {
      this.$emit('downloadEncrypted', this.file)
    },
    async getAesKey () {
      const currentAccountEmail = this.$store.getters['mail/getCurrentAccountEmail']
      const privateKey = OpenPgp.getPrivateKeyByEmail(currentAccountEmail)
      let oPublicFromKey = OpenPgp.getPublicKeyByEmail(currentAccountEmail)
      let aPublicKeys = oPublicFromKey ? [oPublicFromKey] : []
      if (privateKey) {
       let paranoidKey = ''
        if (this.$store.getters['files/getCurrentStorage'].Type === 'shared') {
          paranoidKey = this.file.File?.ExtendedProps?.ParanoidKeyShared
        } else {
          paranoidKey = this.file.ParanoidKey
        }
       const decryptData = await OpenPgp.decryptAndVerifyText(paranoidKey, privateKey, aPublicKeys, this.askOpenPgpKeyPassword)
        if (decryptData?.sDecryptedData) {
          this.aesKey = decryptData.sDecryptedData
          this.showAes = true
        }
        if (decryptData?.sError) {
          notification.showError(decryptData.sError)
        }
      } else {
        notification.showError('No private key found for file decryption.')
      }
    }
  }
}
</script>

<style scoped>

</style>
