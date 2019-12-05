<template>
  <div>
    <div class="text-h4 q-mb-md">Open PGP</div>
    <q-separator spaced />
    <q-list>
      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="enableOpenPgp" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Enable OpenPGP</q-item-label>
          <q-item-label caption>
            Be aware of "Allow autosave in Drafts" setting in Mail module. Turn it off if you don't want the server to store unencrypted drafts. You will still be able to save drafts manually (Ctrl-S).
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-btn color="primary" label="Save" />

      <q-separator spaced />
      <q-item-label header>Public keys</q-item-label>
      <q-item v-ripple v-for="oKey in openPgpPublicKeys" :key="oKey.sId">
        <q-item-section>
          <q-item-label>{{ oKey.sEmail }}</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="visibility" @click="viewKeys([oKey])" />
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="delete" @click="confirmDeleteKey(oKey)" />
        </q-item-section>
      </q-item>
      <q-item v-if="openPgpPublicKeys.length === 0">
        <q-item-section>
          <q-item-label>You don't have any public keys.</q-item-label>
        </q-item-section>
      </q-item>

      <q-item-label header>Private keys</q-item-label>
      <q-item v-ripple v-for="oKey in openPgpPrivateKeys" :key="oKey.sId">
        <q-item-section>
          <q-item-label>{{ oKey.sEmail }}</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="visibility" @click="enterPassword(oKey)" />
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="delete" @click="confirmDeleteKey(oKey)" />
        </q-item-section>
      </q-item>
      <q-item v-if="openPgpPrivateKeys.length === 0">
        <q-item-section>
          <q-item-label>You don't have any private keys.</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <q-btn color="primary" label="Export all public keys" @click="viewKeys(openPgpPublicKeys)" />
    <q-btn color="primary" label="Import key" @click="openImportKey" />
    <q-btn color="primary" v-if="isGenerating" label="Generating new key..." />
    <q-btn color="primary" v-if="!isGenerating" label="Generate new key" @click="openGenerateNewKey" :disable="!allowGenerateNewKey" />

    <q-dialog v-model="deleteConfirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label>Are you sure you want to delete OpenPGP key for {{ deleteKeyEmail }}?</q-item-label>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" @click="deleteKey" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="enterPasswordDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label header>Enter password</q-item-label>
            </q-item>
            <q-item>
              <q-item-label caption>Before the OpenPGP private key can be shown, we need to verify this key's password.</q-item-label>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>OpenPGP key password</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-input
                  v-model="keyPassword"
                  filled
                  type="password"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="View" color="primary" @click="checkPasswordAndViewKeys" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="viewKeysDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label header>View all OpenPGP public keys</q-item-label>
            </q-item>
            <q-item>
              <q-item-section>
                <q-input
                  v-model="viewKeysValue"
                  filled
                  type="textarea"
                  style="width: 500px; height: 300px;"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Send" color="primary" @click="sendKeys" v-close-popup />
          <q-btn flat label="Download" color="primary" @click="downloadKeys" v-close-popup />
          <q-btn flat label="Select" color="primary" @click="selectKeys" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="importKeyDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label header>Import key</q-item-label>
            </q-item>
            <q-item>
              <q-item-section>
                <q-input
                  v-model="keyToImport"
                  filled
                  type="textarea"
                  style="width: 500px; height: 300px;"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Check" color="primary" @click="checkKey" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="generateNewKeyDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label header>Generate new key</q-item-label>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Email</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-item-label>{{ newKeyEmail }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Password</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-input type="password" v-model="newKeyPassword" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Key length</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-item-label>{{ newKeyLength }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Generate" color="primary" @click="generateNewKey" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

</template>

<style></style>

<script>
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

export default {
  name: 'OpenPgpSettings',

  components: {
  },

  data () {
    return {
      enableOpenPgp: false,

      deleteConfirmDialog: false,
      deleteKeyId: '',
      deleteKeyEmail: '',

      enterPasswordDialog: false,
      keyToCheckAndView: null,
      keyPassword: '',

      viewKeysDialog: false,
      viewKeysValue: '',

      importKeyDialog: false,
      keyToImport: '',

      isGenerating: false,
      generateNewKeyDialog: false,
      newKeyPassword: '',
      newKeyLength: 2048,
    }
  },

  watch: {
    enterPasswordDialog () {
      this.keyPassword = ''
    },
    viewKeysDialog () {
      this.viewKeysValue = ''
    },
    importKeyDialog () {
      this.keyToImport = ''
    },
    generateNewKeyDialog () {
      this.newKeyPassword = ''
    },
  },

  computed: {
    newKeyEmail () {
      let oCurrentAccount = this.$store.getters['mail/getCurrentAccount']
      let sEmail = oCurrentAccount.Email
      let sFriendlyName = oCurrentAccount.FriendlyName
      if (sFriendlyName) {
        return sFriendlyName + '<' + sEmail + '>'
      }
      return sEmail
    },
    openPgpPublicKeys () {
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      return _.filter(aOpenPgpKeys, function (oKey) {
        return oKey.bPublic
      })
    },
    openPgpPrivateKeys () {
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      return _.filter(aOpenPgpKeys, function (oKey) {
        return !oKey.bPublic
      })
    },
    allowGenerateNewKey () {
      let bAllow = !this.isGenerating
      if (bAllow) {
        let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
        bAllow = !_.find (aOpenPgpKeys, (oKey) => {
          return oKey.sEmail === this.newKeyEmail
        })
      }
      return bAllow
    },
  },

  methods: {
    confirmDeleteKey (oKey) {
      this.deleteKeyId = oKey.sId
      this.deleteKeyEmail = oKey.sEmail
      this.deleteConfirmDialog = true
    },
    deleteKey () {
      this.$store.commit('main/deleteOpenPgpKey', this.deleteKeyId)
      this.deleteKeyId = ''
      this.deleteKeyEmail = ''
    },
    enterPassword (oKey) {
      this.keyToCheckAndView = oKey
      this.enterPasswordDialog = true
    },
    checkPasswordAndViewKeys () {
      if (OpenPgp.verifyKeyPassword(this.keyToCheckAndView, this.keyPassword)) {
        this.viewKeys([this.keyToCheckAndView])
      }
      this.keyToCheckAndView = null
    },
    viewKeys (aKeys) {
      console.log('viewKeys', aKeys)
      this.viewKeysDialog = true
    },
    sendKeys () {

    },
    downloadKeys () {

    },
    selectKeys () {

    },
    openImportKey () {
      this.importKeyDialog = true
    },
    checkKey () {
      console.log('keyToImport', this.keyToImport)
    },
    openGenerateNewKey () {
      if (this.allowGenerateNewKey) {
        this.generateNewKeyDialog = true
      }
    },
    generateNewKey () {
      if (this.allowGenerateNewKey) {
        this.isGenerating = true
        OpenPgp.generateKey(this.newKeyEmail, this.newKeyPassword, this.newKeyLength, (oKeyPair) => {
          let aKeys = []
          if (oKeyPair.privateKeyArmored) {
            aKeys.push({
              bPublic: false,
              sArmor: oKeyPair.privateKeyArmored,
              sId: 'key-' + Math.round(Math.random() * 1000000),
              sEmail: this.newKeyEmail,
            })
          }
          if (oKeyPair.publicKeyArmored) {
            aKeys.push({
              bPublic: true,
              sArmor: oKeyPair.publicKeyArmored,
              sId: 'key-' + Math.round(Math.random() * 1000000),
              sEmail: this.newKeyEmail,
            })
          }
          if (aKeys.length > 0) {
            this.$store.commit('main/addOpenPgpKeys', aKeys)
          }
          this.isGenerating = false
        }, (oError) => {
          notification.showError(errors.getText(oError, 'Error occurred while generating a new key'))
          this.isGenerating = false
        })
      }
    },
  },
}
</script>
