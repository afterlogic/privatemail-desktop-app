<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Open PGP settings</div>
    <q-separator spaced />
    <q-list class="non-selectable" dense>
      <q-item>
        <q-item-section>
          <q-item-label caption>Be aware of "Allow autosave in Drafts" setting in Mail module. Turn it off if you don't want the server to store unencrypted drafts. You will still be able to save drafts manually.</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />
    <q-list class="non-selectable" dense>
      <q-item tag="label">
        <q-item-section side top>
          <q-checkbox v-model="bRememberPassphrase" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Remember OpenPGP key password until you log out or close this app.</q-item-label>
          <q-item-label caption>If not checked, the system will ask for your OpenPGP key password every time it's needed.</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <div class="q-pt-md q-pr-md q-pb-xs q-pl-md q-gutter-sm">
      <q-btn unelevated color="primary" label="Save" @click="save" />
    </div>
    <q-separator spaced />
    <q-list class="non-selectable" separator dense>
      <q-item class="q-pt-lg">
        <q-item-label header class="text-h6">External public keys</q-item-label>
      </q-item>
      <q-item clickable v-for="oKey in openPgpExternalKeys" :key="oKey.sId" @click="viewKeys([oKey])">
        <q-item-section>
          <q-item-label>{{ oKey.sFullEmail }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="visibility" @click="viewKeys([oKey])" />
        </q-item-section>
        <q-item-section side>
          <q-btn flat icon="delete" @click.stop="confirmDeleteKey(oKey)" />
        </q-item-section>
      </q-item>
      <q-item v-if="openPgpExternalKeys.length === 0">
        <q-item-section>
          <q-item-label>You don't have any external public keys.</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="q-pt-lg">
        <q-item-label header class="text-h6">Public keys</q-item-label>
      </q-item>
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

      <q-item class="q-pt-lg">
        <q-item-label header class="text-h6">Private keys</q-item-label>
      </q-item>
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
      <q-btn unelevated color="primary" label="Export all public keys" @click="viewKeys(openPgpPublicKeys.concat(openPgpExternalKeys))" :disable="openPgpPublicKeys.length === 0 && openPgpExternalKeys.length === 0" />
      <q-btn unelevated color="primary" label="Import key" @click="openImportKey" />
      <q-btn unelevated color="primary" v-if="isGenerating" label="Generating new key..." />
      <q-btn unelevated color="primary" v-if="!isGenerating" label="Generate new key" @click="openGenerateNewKey" :disable="!allowGenerateNewKey" />
    </div>

    <q-dialog v-model="deleteConfirmDialog" persistent>
      <q-card class="q-px-sm non-selectable">
        <q-card-section v-if="deleteKeyExternal">
          Are you sure you want to delete external public OpenPGP key for <b>{{ deleteKeyEmail }}</b>?
        </q-card-section>
        <q-card-section v-if="!deleteKeyExternal && deleteKeyPublic">
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
      <q-card class="q-px-sm non-selectable" style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Import key</div>
        </q-card-section>
        <q-card-section v-if="keysToImport.length > 0">
          <q-item-label header v-if="keysToImport.length > 0">The text contains the following keys that are available for import</q-item-label>
          <q-list separator>
            <q-item dense tag="label" v-for="oKey in keysToImport" :key="oKey.sId">
              <q-item-section side top>
                <q-checkbox v-model="oKey.bChecked" />
              </q-item-section>
              <q-item-section>
                <q-item-label lines="1">
                  {{ oKey.sEmail }}
                  <span class="text-caption">{{ oKey.sAddInfo }}</span>
                  <span class="text-caption" v-if="oKey.bExternal"> (external)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-if="keysAlreadyThere.length > 0">
          <q-item-label header v-if="keysAlreadyThere.length > 0">Keys that are already in the system will not be imported</q-item-label>
          <q-list separator>
            <q-item dense tag="label" v-for="oKey in keysAlreadyThere" :key="oKey.sId" disable>
              <q-item-section>
                <q-item-label lines="1">
                  {{ oKey.sEmail }}
                  <span class="text-caption">{{ oKey.sAddInfo }}</span>
                  <span class="text-caption" v-if="oKey.bExternal"> (external)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-if="keysPrivateExternal.length > 0">
          <q-item-label header v-if="keysPrivateExternal.length > 0">External private keys are not supported and will not be imported</q-item-label>
          <q-list separator>
            <q-item dense tag="label" v-for="oKey in keysPrivateExternal" :key="oKey.sId" disable>
              <q-item-section>
                <q-item-label lines="1">
                  {{ oKey.sEmail }}
                  <span class="text-caption">{{ oKey.sAddInfo }}</span>
                  <span class="text-caption" v-if="oKey.bExternal"> (external)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-if="keysBroken.length > 0">
          <q-item-label header v-if="keysBroken.length > 0">Keys with no email address in their names</q-item-label>
          <q-list separator>
            <q-item dense tag="label" v-for="oKey in keysBroken" :key="oKey.sId" disable>
              <q-item-section>
                <q-item-label lines="1" style="color: red;">
                  {{ oKey.sEmail }}
                  <span class="text-caption">{{ oKey.sAddInfo }}</span>
                  <span class="text-caption" v-if="oKey.bExternal"> (external)</span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section v-if="!keysChecked">
          <q-input type="textarea" v-model="keysArmorToImport" outlined rows="100" style="width: 100%; height: 300px;" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Import selected keys" color="primary" @click="importSelectedKeys" v-if="keysToImport.length > 0" v-close-popup />
          <q-btn flat label="Check" color="primary" @click="checkKey" v-if="!keysChecked" />
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
    <UnsavedChangesDialog ref="unsavedChangesDialog" />
  </div>
</template>

<style>
  .generate-new-key-dialog .input-size {
    width: 300px;
  }
</style>

<script>
import { ipcRenderer } from 'electron'
import { saveAs } from 'file-saver'

import addressUtils from 'src/utils/address.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'

import OpenPgp from 'src/modules/openpgp/OpenPgp.js'
import openpgpSettings from 'src/modules/openpgp/settings.js'
import cOpenPgpKey from 'src/modules/openpgp/classes/cOpenPgpKey.js'
import UnsavedChangesDialog from "../UnsavedChangesDialog";

export default {
  name: 'OpenPgpSettings',

  components: {
    UnsavedChangesDialog
  },

  data () {
    return {
      bRememberPassphrase: false,

      deleteConfirmDialog: false,
      deleteKeyId: '',
      deleteKeyEmail: '',
      deleteKeyPublic: false,
      deleteKeyExternal: false,

      enterPasswordDialog: false,
      keyToCheckAndView: null,
      keyPassword: '',

      viewKeysDialog: false,
      viewKeysHeader: '',
      viewKeysValue: '',
      viewKeysFileName: '',

      importKeyDialog: false,
      keysChecked: false,
      keysArmorToImport: '',
      keysBroken: [],
      keysAlreadyThere: [],
      keysPrivateExternal: [],
      keysToImport: [],

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
      this.keysChecked = false
      this.keysArmorToImport = ''
      this.keysToImport = []
      this.keysBroken = []
      this.keysAlreadyThere = []
      this.keysPrivateExternal = []
    },
    generateNewKeyDialog () {
      this.newKeyPassword = ''
    },
  },

  computed: {
    openPgpExternalKeys () {
      return this.$store.getters['contacts/getOpenPgpExternalKeys']
    },
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
      let aOwnEmails = this.$store.getters['mail/getAllAccountsFullEmails']
      let aNewKeyEmailOptions = _.map(aOwnEmails, (sFullEmail) => {
        return {
          label: textUtils.encodeHtml(sFullEmail),
          value: sFullEmail,
        }
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

  mounted () {
    this.bRememberPassphrase = openpgpSettings.bRememberPassphrase
    ipcRenderer.on('openpgp-save-settings', this.onOpenpgpSaveSettings)
    ipcRenderer.on('contacts-remove-external-key', this.onContactsRemoveExternalKey)
    ipcRenderer.on('contacts-add-external-keys', this.onContactsAddExternalKey)
    this.$store.dispatch('contacts/asyncGetContactsOpenPgpExternalKeys')
  },

  beforeDestroy () {
    ipcRenderer.removeListener('openpgp-save-settings', this.onOpenpgpSaveSettings)
    ipcRenderer.removeListener('contacts-remove-external-key', this.onContactsRemoveExternalKey)
    ipcRenderer.removeListener('contacts-add-external-keys', this.onContactsAddExternalKey)
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
      return this.bRememberPassphrase !== openpgpSettings.bRememberPassphrase
    },
    save () {
      ipcRenderer.send('openpgp-save-settings', {
        sApiHost: this.$store.getters['main/getApiHost'],
        sAuthToken: this.$store.getters['user/getAuthToken'],
        bEnableModule: openpgpSettings.bEnableModule,
        bRememberPassphrase: this.bRememberPassphrase,
      })
    },
    onOpenpgpSaveSettings (event, { bResult, oError }) {
      if (bResult) {
        openpgpSettings.setRememberPassphrase(this.bRememberPassphrase)
        notification.showReport('Settings have been updated successfully.')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while saving settings.'))
      }
    },
    onContactsRemoveExternalKey (event, { bResult, oError }) {
      if (bResult) {
        notification.showReport('External key was successfully removed.')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while removing external key'))
      }
      this.$store.dispatch('contacts/asyncGetContactsOpenPgpExternalKeys')
    },
    onContactsAddExternalKey (event, { aResult, oError }) {
      if (_.isArray(aResult)) {
        notification.showReport('External keys were successfully added.')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while adding external keys'))
      }
      this.$store.dispatch('contacts/asyncGetContactsOpenPgpExternalKeys')
    },
    confirmDeleteKey (oKey) {
      this.deleteKeyId = oKey.sId
      this.deleteKeyEmail = oKey.sEmail
      this.deleteKeyPublic = oKey.bPublic
      this.deleteKeyExternal = !!oKey.bExternal
      this.deleteConfirmDialog = true
    },
    deleteKey () {
      if (this.deleteKeyExternal) {
        ipcRenderer.send('contacts-remove-external-key', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          sEmail: this.deleteKeyEmail,
        })
      } else {
        this.$store.commit('main/deleteOpenPgpKey', this.deleteKeyId)
      }
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
      if (this.keysArmorToImport === '') {
        notification.showReport('Please enter key armor into the field.')
      } else {
        let
          aKeysFromArmor = await OpenPgp.getArmorInfo(this.keysArmorToImport),
          aKeysBroken = [],
          aKeysAlreadyThere = [],
          aKeysPrivateExternal = [],
          aKeysToImport = []

        if (typesUtils.isNonEmptyArray(aKeysFromArmor)) {
          _.each(aKeysFromArmor, (oKey) => {
            if (oKey) {
              let
                aKeyUsersIds = oKey.getUserIds(),
                sKeyEmail = aKeyUsersIds.length > 0 ? aKeyUsersIds[0] : '0',
                oKeyEmailParts = addressUtils.getEmailParts(sKeyEmail),
                aSameUserKeys = OpenPgp.getOwnKeysByEmails([oKeyEmailParts.email], oKey.isPublic()),
                bHasSameExternalKey = !!_.find(this.openPgpExternalKeys, (oExternalKey) => {
                  return oKey.isPublic() && oExternalKey.sEmail === oKeyEmailParts.email
                }),
                bHasSameKey = aSameUserKeys.length > 0 || bHasSameExternalKey,
                bNoEmail = !addressUtils.isCorrectEmail(oKeyEmailParts.email),
                iBitSize = oKey.primaryKey.params[0].byteLength() * 8,
                oKeyData = new cOpenPgpKey({
                  sArmor: oKey.armor(),
                  sEmail: sKeyEmail,
                  bPublic: oKey.isPublic(),
                  bExternal: !OpenPgp.isOwnEmail(oKeyEmailParts.email)
                })

              oKeyData.sAddInfo = oKey.isPublic() ? '(' + iBitSize + '-bit, public)' : '(' + iBitSize + '-bit, private)'
              oKeyData.bChecked = !bHasSameKey && !bNoEmail

              if (bNoEmail) {
                aKeysBroken.push(oKeyData);
              } else if (bHasSameKey) {
                aKeysAlreadyThere.push(oKeyData);
              } else if (!oKey.isPublic() && !OpenPgp.isOwnEmail(oKeyEmailParts.email)) {
                aKeysPrivateExternal.push(oKeyData);
              } else {
                aKeysToImport.push(oKeyData);
              }
            }
          })
        }

        this.keysBroken = aKeysBroken
        this.keysAlreadyThere = aKeysAlreadyThere
        this.keysPrivateExternal = aKeysPrivateExternal
        this.keysToImport = aKeysToImport
        if (aKeysBroken.length === 0 && aKeysAlreadyThere.length === 0 && aKeysPrivateExternal.length === 0 && aKeysToImport.length === 0) {
          notification.showError('No OpenPGP keys found for import.')
        } else {
          this.keysChecked = true
        }
      }
    },

    importSelectedKeys () {
      let aKeys = []
      let aExternalKeysParams = []
      _.each(this.keysToImport, function (oKey) {
        if (oKey.bChecked) {
          if (oKey.bExternal) {
            let oKeyEmailParts = addressUtils.getEmailParts(oKey.sEmail)
            // Parameters to send via Web API
            aExternalKeysParams.push({
              Email: oKeyEmailParts.email,
              Key: oKey.sArmor,
              Name: oKeyEmailParts.name
            })
          } else {
            aKeys.push(oKey)
          }
        }
      })
      if (aKeys.length > 0) {
        this.$store.commit('main/addOpenPgpKeys', aKeys)
      }
      if (aExternalKeysParams.length > 0) {
        ipcRenderer.send('contacts-add-external-keys', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          aExternalKeysParams,
        })
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
            aKeys.push(new cOpenPgpKey({
              sArmor: oKeyPair.privateKeyArmored,
              sEmail: this.sNewKeyEmail.value,
              bPublic: false,
            }))
          }
          if (oKeyPair.publicKeyArmored) {
            aKeys.push(new cOpenPgpKey({
              sArmor: oKeyPair.publicKeyArmored,
              sEmail: this.sNewKeyEmail.value,
              bPublic: true,
            }))
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
