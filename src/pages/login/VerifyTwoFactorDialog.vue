<template>
  <q-dialog v-model="showVerifyDialog" persistent>
    <q-card class="non-selectable">
      <q-card-section>
        <span class="text-h6">Two Factor Verification</span>
        <q-item>
          <q-item-section side>
            <q-item-label>This extra step is intended to confirm it’s really you trying to sign in</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label><span class="text-h6">{{ twoFactorData.Login }}</span></q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-card-section v-if="securityKeyVisible">
        <q-item v-if="securityKeyInProgress">
          <q-item-section side>
            <q-item-label>Please follow the instructions in the popup window</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="securityKeyInProgress" class="justify-center">
          <q-item-section side>
            <q-item-label><q-spinner size="lg" /></q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="securityKeyError">
          <q-item-section>
            <q-item-label><span class="text-h6">There was a problem</span></q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="securityKeyError">
          <q-item-section side>
            <q-item-label>Try using your security key again or try another way to verify it's you</q-item-label>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right" v-if="securityKeyVisible && securityKeyError">
        <q-btn label="Try again" color="primary" @click="verifySecurityKey" />
        <q-btn flat label="Cancel" color="grey-6" v-close-popup />
      </q-card-actions>
      <q-card-actions align="right" v-if="securityKeyVisible && securityKeyError && hasSeveralOptions">
        <q-btn flat label="Other options" color="primary" @click="useOtherOption" />
      </q-card-actions>

      <q-card-section v-if="allOptionsVisible">
        <q-item>
          <q-item-section side>
            <q-item-label>Security options available</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="hasSecurityKey">
          <q-item-section>
            <q-btn label="Use your Security key" color="primary" @click="useSecurityKey" />
          </q-item-section>
        </q-item>
        <q-item v-if="hasAuthenticatorApp">
          <q-item-section>
            <q-btn label="Use Authenticator app" color="primary" @click="useAuthenticatorApp" />
          </q-item-section>
        </q-item>
        <q-item v-if="hasBackupCodes">
          <q-item-section>
            <q-btn label="Use backup code" color="primary" @click="useBackupCodes" />
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right" v-if="allOptionsVisible">
        <q-btn flat label="Cancel" color="grey-6" v-close-popup />
      </q-card-actions>

      <q-card-section v-if="authenticatorAppVisible">
        <q-item>
          <q-item-section side>
            <q-item-label>Specify verification code from Authenticator app</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input v-model="authenticatorCode" label="Code" v-on:keyup.enter="verifyAuthenticatorCode" class="verify-pin-input" ref="authenticatorCodeInput" />
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right" v-if="authenticatorAppVisible">
        <q-btn color="primary" v-if="authenticatorCodeInProgress" label="Verifying..." />
        <q-btn color="primary" v-else label="Verify" @click="verifyAuthenticatorCode" />
        <q-btn flat color="grey-6" label="Cancel" v-close-popup />
      </q-card-actions>
      <q-card-actions align="right" v-if="authenticatorAppVisible && hasSeveralOptions">
        <q-btn flat label="Other options" color="primary" @click="useOtherOption" />
      </q-card-actions>

      <q-card-section v-if="backupCodesVisible">
        <q-item>
          <q-item-section side>
            <q-item-label>Enter one of your 8-character backup codes</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input v-model="backupCode" label="Code" v-on:keyup.enter="verifyBackupCode" class="verify-pin-input" ref="backupCodeInput" />
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right" v-if="backupCodesVisible">
        <q-btn color="primary" v-if="backupCodeInProgress" label="Verifying..." />
        <q-btn color="primary" v-else label="Verify" @click="verifyBackupCode" />
        <q-btn flat color="grey-6" label="Cancel" v-close-popup />
      </q-card-actions>
      <q-card-actions align="right" v-if="backupCodesVisible && hasSeveralOptions">
        <q-btn flat label="Other options" color="primary" @click="useOtherOption" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.verify-pin-input {
  width: 100%;
  margin-left: 10px;
}
</style>

<script>

import { ipcRenderer } from 'electron'

import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi.js'

export default {
  name: 'VerifyTwoFactorDialog',

  data () {
    return {
      showVerifyDialog: false,

      twoFactorData: {
        Login: '',
        Password: '',
      },
      apiHost: '',
      passTokenHandler: null,

      allOptionsVisible: false,
      securityKeyVisible: false,
      authenticatorAppVisible: false,
      backupCodesVisible: false,

      hasSecurityKey: false,
      securityKeyInProgress: false,
      securityKeyError: false,

      hasAuthenticatorApp: false,
      authenticatorCode: '',
      authenticatorCodeInProgress: false,

      hasBackupCodes: false,
      backupCode: false,
      backupCodeInProgress: false,
    }
  },

  computed: {
    hasSeveralOptions () {
      let iOptionsCount = 0
      if (this.hasSecurityKey) {
        iOptionsCount++
      }
      if (this.hasAuthenticatorApp) {
        iOptionsCount++
      }
      if (this.hasBackupCodes) {
        iOptionsCount++
      }
      return iOptionsCount > 1
    },
  },

  mounted () {
  },

  methods: {
    open (oTwoFactorAuthData, oParameters, sApiHost, fPassToken) {
      this.twoFactorData = oParameters || {
        Login: '',
        Password: '',
      }
      this.apiHost = sApiHost
      this.passTokenHandler = fPassToken

      this.hasSecurityKey = oTwoFactorAuthData.HasSecurityKey
      this.hasAuthenticatorApp = oTwoFactorAuthData.HasAuthenticatorApp
      this.hasBackupCodes = oTwoFactorAuthData.HasBackupCodes

      this.allOptionsVisible = false
      this.securityKeyVisible = false
      this.authenticatorAppVisible = false
      this.backupCodesVisible = false
      if (this.hasSecurityKey) {
        this.useSecurityKey()
      } else if (this.hasAuthenticatorApp) {
        this.useAuthenticatorApp()
      }

      this.showVerifyDialog = true
    },

    useOtherOption () {
      this.allOptionsVisible = true
      this.securityKeyVisible = false
      this.authenticatorAppVisible = false
      this.backupCodesVisible = false
    },

    useSecurityKey () {
      if (this.hasSecurityKey) {
        this.allOptionsVisible = false
        this.securityKeyVisible = true
        this.authenticatorAppVisible = false
        this.backupCodesVisible = false
        this.verifySecurityKey()
      }
    },

    async useAuthenticatorApp () {
      if (this.hasAuthenticatorApp) {
        this.allOptionsVisible = false
        this.securityKeyVisible = false
        this.authenticatorAppVisible = true
        this.backupCodesVisible = false

        this.authenticatorCode = ''
        this.authenticatorCodeInProgress = false
        await this.$nextTick()
        if (this.$refs.authenticatorCodeInput) {
          this.$refs.authenticatorCodeInput.focus()
        }
      }
    },

    async useBackupCodes () {
      if (this.hasBackupCodes) {
        this.allOptionsVisible = false
        this.securityKeyVisible = false
        this.authenticatorAppVisible = false
        this.backupCodesVisible = true

        this.backupCode = ''
        this.backupCodeInProgress = false
        await this.$nextTick()
        if (this.$refs.backupCodeInput) {
          this.$refs.backupCodeInput.focus()
        }
      }
    },

    afterVerify (sAuthToken) {
      if (_.isFunction(this.passTokenHandler)) {
        this.passTokenHandler(sAuthToken)
      }
      this.showVerifyDialog = false
    },

    verifySecurityKey () {
      window.passCreds = function (oCreds) {
        console.log('oCreds', oCreds);
      }
      this.securityKeyInProgress = true
      this.securityKeyError = false
      ipcRenderer.once('core-verify-security-key', (oEvent, { oAttestation }) => {
        console.log('oAttestation', oAttestation)
        if (oAttestation && !oAttestation.error) {
          var oParameters = _.assign({
            'Attestation': oAttestation
          }, this.twoFactorData)
          webApi.sendRequest({
            sApiHost: this.apiHost,
            sModule: 'TwoFactorAuth',
            sMethod: 'VerifySecurityKeyFinish',
            oParameters,
            fCallback: this.onVerifySecurityKeyFinish,
          })
        } else {
          if (oAttestation && oAttestation.error) {
            // oAttestation.error.message
            // oAttestation.error.cancel
            // oAttestation.error.https
            // oAttestation.error.support
            console.log('oAttestation.error', oAttestation.error)
          }
          this.securityKeyInProgress = false
          this.securityKeyError = true
        }
      })
      ipcRenderer.send('core-verify-security-key', {
        sApiHost: this.apiHost,
        sLogin: this.twoFactorData.Login,
        sPassword: this.twoFactorData.Password
      })
    },

    onVerifySecurityKeyFinish (oResult, oError) {
      this.securityKeyInProgress = false
      if (oResult && oResult.AuthToken) {
        this.afterVerify(oResult.AuthToken)
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while trying to verificate security key.'))
      }
    },

    verifyAuthenticatorCode () {
      this.authenticatorCodeInProgress = true
      webApi.sendRequest({
        sApiHost: this.apiHost,
        sModule: 'TwoFactorAuth',
        sMethod: 'VerifyAuthenticatorAppCode',
        oParameters: _.assign({ 'Code': this.authenticatorCode }, this.twoFactorData),
        fCallback: (oResult, oError) => {
          this.authenticatorCodeInProgress = false
          if (oResult && oResult.AuthToken) {
            this.afterVerify(oResult.AuthToken)
          } else {
            notification.showError(errors.getText(oError, 'Wrong code. Try again'))
          }
        },
      })
    },

    verifyBackupCode () {
      this.backupCodeInProgress = true
      webApi.sendRequest({
        sApiHost: this.apiHost,
        sModule: 'TwoFactorAuth',
        sMethod: 'VerifyBackupCode',
        oParameters: _.assign({ 'BackupCode': this.backupCode }, this.twoFactorData),
        fCallback: (oResult, oError) => {
          this.backupCodeInProgress = false
          if (oResult && oResult.AuthToken) {
            this.afterVerify(oResult.AuthToken)
          } else {
            notification.showError(errors.getText(oError, 'Wrong backup code. Try again'))
          }
        },
      })
    },
  },
}
</script>
