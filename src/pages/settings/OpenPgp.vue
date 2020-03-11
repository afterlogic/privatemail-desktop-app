<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Open PGP settings</div>
    <q-separator spaced />
    <q-list class="non-selectable" separator>
      <q-item>
        <q-item-section>
          <q-item-label caption>Be aware of "Allow autosave in Drafts" setting in Mail module. Turn it off if you don't want the server to store unencrypted drafts. You will still be able to save drafts manually.</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator spaced />
      <q-item-label header class="text-h6">Public keys</q-item-label>
      <q-item clickable v-for="oKey in openPgpPublicKeys" :key="oKey.sId" @click="viewKeys([oKey])">
        <q-item-section>
          <q-item-label>{{ oKey.sEmail }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="visibility" @click="viewKeys([oKey])" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="delete" @click.stop="confirmDeleteKey(oKey)" />
        </q-item-section>
      </q-item>
      <q-item v-if="openPgpPublicKeys.length === 0">
        <q-item-section>
          <q-item-label>You don't have any public keys.</q-item-label>
        </q-item-section>
      </q-item>

      <q-item-label header class="text-h6">Private keys</q-item-label>
      <q-item clickable v-for="oKey in openPgpPrivateKeys" :key="oKey.sId" @click="enterPassword(oKey)">
        <q-item-section>
          <q-item-label>{{ oKey.sEmail }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="visibility" @click="enterPassword(oKey)" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="delete" @click.stop="confirmDeleteKey(oKey)" />
        </q-item-section>
      </q-item>
      <q-item v-if="openPgpPrivateKeys.length === 0">
        <q-item-section>
          <q-item-label>You don't have any private keys.</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <div class="q-pa-md q-gutter-sm">
      <q-btn unelevated color="primary" label="Export all public keys" @click="viewKeys(openPgpPublicKeys)" :disable="openPgpPublicKeys.length === 0" />
      <q-btn unelevated color="primary" label="Import key" @click="openImportKey" />
      <q-btn unelevated color="primary" v-if="isGenerating" label="Generating new key..." />
      <q-btn unelevated color="primary" v-if="!isGenerating" label="Generate new key" @click="openGenerateNewKey" :disable="!allowGenerateNewKey" />
    </div>

    <q-dialog v-model="deleteConfirmDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section v-if="deleteKeyPublic">
          Are you sure you want to delete public OpenPGP key for <b>{{ deleteKeyEmail }}</b>?
        </q-card-section>
        <q-card-section v-if="!deleteKeyPublic">
          Are you sure you want to delete private OpenPGP key for <b>{{ deleteKeyEmail }}</b>?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Ok" color="primary" @click="deleteKey" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="enterPasswordDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">Enter password</div>
        </q-card-section>

        <q-item>
          <q-item-label caption>Before the OpenPGP private key can be shown, we need to verify this key's password.</q-item-label>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>OpenPGP key password</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense type="password" v-model="keyPassword" />
          </q-item-section>
        </q-item>

        <q-card-actions align="right">
          <q-btn flat label="View" color="primary" @click="checkPasswordAndViewKeys" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="viewKeysDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">{{ viewKeysHeader }}</div>
        </q-card-section>
        <q-card-section>
          <q-input outlined type="textarea" v-model="viewKeysValue" ref="viewKeysInput" rows="100" style="width: 500px; height: 300px;" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Send" color="primary" @click="sendKeys" v-close-popup />
          <q-btn flat label="Download" color="primary" @click="downloadKeys" v-close-popup />
          <q-btn flat label="Select" color="primary" @click="selectKeysArmor" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="importKeyDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section>
          <div class="text-h6">Import key</div>
        </q-card-section>
        <q-item-label header v-if="keysToImport.length > 0">Text includes OpenPGP keys</q-item-label>
        <q-card-section v-if="keysToImport.length > 0">
          <q-list separator>
            <q-item tag="label" v-for="oKey in keysToImport" :key="oKey.sId" :disable="oKey.bDisabled">
              <q-item-section side top>
                <q-checkbox v-model="oKey.bChecked" :disable="oKey.bDisabled" />
              </q-item-section>
              <q-item-section>
                <q-item-label lines="1">{{ oKey.sEmail }}</q-item-label>
                <q-item-label lines="1" class="text-caption">{{ oKey.sAddInfo }}</q-item-label>
              </q-item-section>
              <q-item-section side>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-item v-if="keysToImport.length > 0 && importHasExistingKeys">
            <q-item-label caption >Keys which are already in the system are greyed out.</q-item-label>
        </q-item>
        
        <q-card-section v-if="keysToImport.length === 0">
          <q-input type="textarea" v-model="keysArmorToImport" outlined rows="100" style="width: 500px; height: 300px;" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Import selected keys" color="primary" @click="importSelectedKeys" v-if="keysToImport.length > 0" v-close-popup />
          <q-btn flat label="Check" color="primary" @click="checkKey" v-if="keysToImport.length === 0" />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="generateNewKeyDialog" persistent>
      <q-card class="q-px-sm non-selectable generate-new-key-dialog">
        <q-card-section>
          <div class="text-h6">Generate new key</div>
        </q-card-section>
        <q-item>
          <q-item-section>
            <q-item-label>Email</q-item-label>
          </q-item-section>
          <q-item-section side >
            <q-item-label v-if="newKeyEmailOptions.length === 1" class="input-size">{{ newKeyEmailOptions[0].value }}</q-item-label>
            <q-select outlined dense class="input-size" v-if="newKeyEmailOptions.length > 1" v-model="sNewKeyEmail" :options="newKeyEmailOptions">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section class="non-selectable">
                    <q-item-label v-html="scope.opt.label" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Password</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input outlined dense type="password" class="input-size" v-model="newKeyPassword" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Key length</q-item-label>
          </q-item-section>
          <q-item-section side >
            <q-select outlined dense v-model="newKeyLength" :options="newKeyLengthList" class="input-size">
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
        <q-card-actions align="right">
          <q-btn flat label="Generate" color="primary" @click="generateNewKey" v-close-popup />
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
  .generate-new-key-dialog .input-size {
    width: 300px;
  }
</style>

<script>
import { saveAs } from 'file-saver'

import addressUtils from 'src/utils/address.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'

export default {
  name: 'OpenPgpSettings',

  components: {
  },

  data () {
    return {
      deleteConfirmDialog: false,
      deleteKeyId: '',
      deleteKeyEmail: '',
      deleteKeyPublic: false,

      enterPasswordDialog: false,
      keyToCheckAndView: null,
      keyPassword: '',

      viewKeysDialog: false,
      viewKeysHeader: '',
      viewKeysValue: '',
      viewKeysFileName: '',

      importKeyDialog: false,
      keysArmorToImport: '',
      keysToImport: [],
      importHasExistingKeys: false,
      importHasKeyWithoutEmail: false,

      isGenerating: false,
      generateNewKeyDialog: false,
      sNewKeyEmail: '',
      newKeyPassword: '',
      newKeyLength: 2048,
      newKeyLengthList: [2048, 4096],
    }
  },

  watch: {
    enterPasswordDialog () {
      this.keyPassword = ''
    },
    viewKeysDialog () {
      if (!this.viewKeysDialog) {
        this.viewKeysValue = ''
      }
    },
    importKeyDialog () {
      this.keysArmorToImport = ''
      this.keysToImport = []
    },
    generateNewKeyDialog () {
      this.newKeyPassword = ''
    },
  },

  computed: {
    newKeyEmail () {
      let oCurrentAccount = this.$store.getters['mail/getCurrentAccount']
      let sEmail = oCurrentAccount ? oCurrentAccount.sEmail : ''
      let sFriendlyName = oCurrentAccount ? oCurrentAccount.sFriendlyName : ''
      if (sFriendlyName) {
        return sFriendlyName + '<' + sEmail + '>'
      }
      return sEmail
    },
    newKeyEmailOptions () {
      let aNewKeyEmailOptions = []
      let aIdentities = this.$store.getters['mail/getIdentities']
      let aAccounts = this.$store.getters['mail/getAccounts']
      _.each(aAccounts, function (oAccount) {
        let aAccountIdentities = aIdentities[oAccount.iAccountId] || []
        aNewKeyEmailOptions = aNewKeyEmailOptions.concat(_.map(aAccountIdentities, function (oIdentity) {
          return {
            label: textUtils.encodeHtml(oIdentity.getFull()),
            value: oIdentity.getFull(),
          }
        }))
        aNewKeyEmailOptions = aNewKeyEmailOptions.concat(_.map(oAccount.aAliases, function (oAlias) {
          return {
            label: textUtils.encodeHtml(oAlias.getFull()),
            value: oAlias.getFull(),
          }
        }))
      })
      let aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']
      return _.filter(aNewKeyEmailOptions, function (oOption) {
        let oOptionEmailParts = addressUtils.getEmailParts(oOption.value)
        return !_.find (aOpenPgpKeys, (oKey) => {
          let oKeyEmailParts = addressUtils.getEmailParts(oKey.sEmail)
          return oKeyEmailParts.email === oOptionEmailParts.email
        })
      })
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
      return !this.isGenerating && this.newKeyEmailOptions.length > 0
    },
  },

  methods: {
    confirmDeleteKey (oKey) {
      this.deleteKeyId = oKey.sId
      this.deleteKeyEmail = oKey.sEmail
      this.deleteKeyPublic = oKey.bPublic
      this.deleteConfirmDialog = true
    },
    deleteKey () {
      this.$store.commit('main/deleteOpenPgpKey', this.deleteKeyId)
      this.deleteKeyId = ''
      this.deleteKeyEmail = ''
      this.deleteKeyPublic = false
    },
    enterPassword (oKey) {
      this.keyToCheckAndView = oKey
      this.enterPasswordDialog = true
    },
    async checkPasswordAndViewKeys () {
      let { bVerified, sError } = await OpenPgp.verifyKeyPassword(this.keyToCheckAndView, this.keyPassword)
      if (bVerified) {
        this.viewKeys([this.keyToCheckAndView])
      } else {
        notification.showError(sError)
      }
      this.keyToCheckAndView = null
    },
    viewKeys (aKeys) {
      if (aKeys.length === 1) {
        if (aKeys[0].bPublic) {
          this.viewKeysHeader = 'View OpenPGP public key for ' + aKeys[0].sEmail
          this.viewKeysFileName = aKeys[0].sEmail + ' OpenPGP public key.asc'
        } else {
          this.viewKeysHeader = 'View OpenPGP private key for ' + aKeys[0].sEmail
          this.viewKeysFileName = aKeys[0].sEmail + ' OpenPGP private key.asc'
        }
      } else {
        this.viewKeysHeader = 'View all OpenPGP public keys'
        this.viewKeysFileName = 'OpenPGP public keys.asc'
      }
      let aArmors = _.map(aKeys, function (oKey) {
        return oKey.sArmor
      })
      this.viewKeysValue = aArmors.join('\r\n\r\n')
      this.viewKeysDialog = true
    },
    sendKeys () {
      this.openCompose({
        aAttachments: [
          {
            FileName: this.viewKeysFileName,
            Content: this.viewKeysValue,
          }
        ],
      })
    },
    downloadKeys () {
      let oBlob = new Blob([this.viewKeysValue], {type: 'text/plain'})
      saveAs(oBlob, this.viewKeysFileName)
    },
    selectKeysArmor () {
      this.$refs.viewKeysInput.select()
      if (document.queryCommandSupported('copy')) {
        document.execCommand('copy')
        notification.showReport('The key has been copied to the clipboard.')
      }
    },
    openImportKey () {
      this.importKeyDialog = true
    },
    async checkKey () {
      let
        aRes = null,
        aKeys = [],
        bHasExistingKeys = false,
        bHasKeyWithoutEmail = false,
        aOpenPgpKeys = this.$store.getters['main/getOpenPgpKeys']

      if (this.keysArmorToImport === '') {
        notification.showReport('Please enter key armor into the field.')
      } else {
        aRes = await OpenPgp.getArmorInfo(this.keysArmorToImport)

        if (typesUtils.isNonEmptyArray(aRes)) {
          _.each(aRes, function (oKey) {
            if (oKey) {
              let
                aKeyUsersIds = oKey.getUserIds(),
                sKeyEmail = aKeyUsersIds.length > 0 ? aKeyUsersIds[0] : '0',
                oKeyEmailParts = addressUtils.getEmailParts(sKeyEmail),
                bHasSameKey = !!_.find(aOpenPgpKeys, function (oStoredKey) {
                  let oStoredKeyEmailParts = addressUtils.getEmailParts(oStoredKey.sEmail)
                  return oStoredKeyEmailParts.email === oKeyEmailParts.email && oStoredKey.bPublic === oKey.isPublic()
                }),
                sAddInfoLangKey = oKey.isPublic() ? '(%LENGTH%-bit, public)' : '(%LENGTH%-bit, private)',
                bNoEmail = false // !addressUtils.isCorrectEmail(sKeyEmail)

              bHasExistingKeys = bHasExistingKeys || bHasSameKey
              bHasKeyWithoutEmail = bHasKeyWithoutEmail || bNoEmail
              let iBitSize = oKey.primaryKey.params[0].byteLength() * 8;
              aKeys.push({
                sArmor: oKey.armor(),
                bPublic: oKey.isPublic(),
                sEmail: sKeyEmail,
                sAddInfo: sAddInfoLangKey.replace('%LENGTH%', iBitSize),
                bDisabled: bHasSameKey || bNoEmail,
                bChecked: false,
                sId: 'key-' + Math.round(Math.random() * 1000000),
                // 'id: oKey.getId(),
                // 'needToImport': !bHasSameKey && !bNoEmail,
                // 'noEmail': bNoEmail,
              })
            }
          })
        }

        this.keysToImport = aKeys
        this.importHasExistingKeys = bHasExistingKeys
        this.importHasKeyWithoutEmail = bHasKeyWithoutEmail

        if (aKeys.length === 0) {
          notification.showError('No OpenPGP keys found for import.')
        }
      }
    },
    importSelectedKeys () {
      let aKeys = []
      _.each(this.keysToImport, function (oKey) {
        if (oKey.bChecked) {
          aKeys.push({
            bPublic: oKey.bPublic,
            sArmor: oKey.sArmor,
            sId: 'key-' + Math.round(Math.random() * 1000000),
            sEmail: oKey.sEmail,
          })
        }
      })
      if (aKeys.length > 0) {
        this.$store.commit('main/addOpenPgpKeys', aKeys)
      }
    },
    openGenerateNewKey () {
      if (this.allowGenerateNewKey) {
        this.generateNewKeyDialog = true
        this.sNewKeyEmail = this.newKeyEmailOptions[0]
      }
    },
    generateNewKey () {
      if (this.allowGenerateNewKey) {
        this.isGenerating = true
        OpenPgp.generateKey(this.sNewKeyEmail.value, this.newKeyPassword, this.newKeyLength, (oKeyPair) => {
          let aKeys = []
          if (oKeyPair.privateKeyArmored) {
            aKeys.push({
              bPublic: false,
              sArmor: oKeyPair.privateKeyArmored,
              sId: 'key-' + Math.round(Math.random() * 1000000),
              sEmail: this.sNewKeyEmail.value,
            })
          }
          if (oKeyPair.publicKeyArmored) {
            aKeys.push({
              bPublic: true,
              sArmor: oKeyPair.publicKeyArmored,
              sId: 'key-' + Math.round(Math.random() * 1000000),
              sEmail: this.sNewKeyEmail.value,
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
