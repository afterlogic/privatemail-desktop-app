<template>
  <q-dialog v-model="importKeyDialog" persistent>
    <q-card class="q-px-sm non-selectable q-dialog-size" style="width: 700px; max-width: 80vw;">
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
        <q-input type="textarea" v-model="keysArmorToImport" outlined rows="100" input-style="resize: none; height: 300px;" style="width: 100%; height: 300px;" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Import selected keys" color="primary" @click="importSelectedKeys" v-if="keysToImport.length > 0" v-close-popup />
        <q-btn flat label="Check" color="primary" @click="checkKey" v-if="!keysChecked" />
        <q-btn flat label="Cancel" color="grey-6" @click="cancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import notification from '../../../utils/notification'
import OpenPgp from '../../../modules/openpgp/OpenPgp'
import typesUtils from '../../../utils/types'
import addressUtils from '../../../utils/address'
import cOpenPgpKey from '../../../modules/openpgp/classes/cOpenPgpKey'
import { ipcRenderer } from 'electron'
import openpgpSettings from '../../../modules/openpgp/settings'
import errors from '../../../utils/errors'

export default {
  name: 'ImportKeysDialog',
  props: {

  },
  data () {
    return {
      importKeyDialog: false,
      keysArmorToImport: '',
      keysToImport: [],
      keysAlreadyThere: [],
      keysPrivateExternal: [],
      keysBroken: [],
      keysChecked: false,
    }
  },
  importKeyDialog (val) {
    if (!val) {
      this.removeListeners()
    }
  },
  beforeDestroy () {
   this.removeListeners()
  },
  computed: {
    openPgpExternalKeys () {
      return this.$store.getters['contacts/getOpenPgpExternalKeys']
    },
  },
  methods: {
    removeListeners () {
      ipcRenderer.removeListener('openpgp-save-settings', this.onOpenpgpSaveSettings)
      ipcRenderer.removeListener('contacts-remove-external-key', this.onContactsRemoveExternalKey)
      ipcRenderer.removeListener('contacts-add-external-keys', this.onContactsAddExternalKey)
    },
    addListeners () {
      ipcRenderer.once('openpgp-save-settings', this.onOpenpgpSaveSettings)
      ipcRenderer.once('contacts-remove-external-key', this.onContactsRemoveExternalKey)
      ipcRenderer.once('contacts-add-external-keys', this.onContactsAddExternalKey)
    },
    cancel () {
      this.removeListeners()
      this.importKeyDialog = false
    },
    openDialog (keys) {
      this.addListeners()
      this.keysChecked = false
      this.keysArmorToImport = keys
      this.importKeyDialog = true
      this.checkKey()
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
        notification.showReport('OpenPGP key was successfully imported.')
      }
      if (aExternalKeysParams.length > 0) {
        ipcRenderer.send('contacts-add-external-keys', {
          sApiHost: this.$store.getters['main/getApiHost'],
          sAuthToken: this.$store.getters['user/getAuthToken'],
          aExternalKeysParams,
        })
      }
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
  }
}
</script>

<style scoped>

</style>
