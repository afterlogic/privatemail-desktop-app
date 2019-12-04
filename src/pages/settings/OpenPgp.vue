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
      <q-item v-ripple>
        <q-item-section>
          <q-item-label>test2@afterlogic.com</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="visibility" @click="viewKeys" />
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="delete" @click="confirmDeleteKey" />
        </q-item-section>
      </q-item>

      <q-item-label header>Private keys</q-item-label>
      <q-item v-ripple>
        <q-item-section>
          <q-item-label>test2@afterlogic.com</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="visibility" @click="enterPassword" />
        </q-item-section>
        <q-item-section side >
          <q-btn flat icon="delete" @click="confirmDeleteKey" />
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <q-btn color="primary" label="Export all public keys" @click="viewKeys" />
    <q-btn color="primary" label="Import key" @click="openImportKey" />
    <q-btn color="primary" label="Generate new key" @click="openGenerateNewKey" />

    <q-dialog v-model="deleteConfirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center q-pa-md">
          <q-list>
            <q-item>
              <q-item-label>Are you sure you want to delete OpenPGP key for nadine@afterlogic.com?</q-item-label>
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
import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

export default {
  name: 'OpenPgpSettings',

  components: {
  },

  data () {
    return {
      enableOpenPgp: false,

      deleteConfirmDialog: false,

      enterPasswordDialog: false,
      keyPassword: '',

      viewKeysDialog: false,
      viewKeysValue: '',

      importKeyDialog: false,
      keyToImport: '',

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
      return this.$store.getters['mail/getCurrentAccountEmail']
    },
    openPgpKeys () {
      return this.$store.getters['mail/getOpenPgpKeys']
    },
  },

  methods: {
    confirmDeleteKey () {
      this.deleteConfirmDialog = true
    },
    deleteKey () {

    },
    enterPassword () {
      this.enterPasswordDialog = true
    },
    checkPasswordAndViewKeys () {
      console.log('keyPassword', this.keyPassword)
      this.viewKeys()
    },
    viewKeys () {
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
      this.generateNewKeyDialog = true
    },
    generateNewKey () {
      console.log('newKeyPassword', this.newKeyPassword)
      OpenPgp.generateKey(this.newKeyEmail, this.newKeyPassword, this.newKeyLength, function () {
        console.log('fOkHandler', arguments)
      }, function () {
        console.log('fErrorHandler', arguments)
      })
    },
  },
}
</script>
