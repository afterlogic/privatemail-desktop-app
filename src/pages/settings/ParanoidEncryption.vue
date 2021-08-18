<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Paranoid Encryption</div>
    <q-separator spaced />
    <!-- <div class="theme-text theme-bg" style="widht: 100px; height: 100px;">
      Some text
    </div> -->
    <q-list class="non-selectable">
      <!--<q-item>
        <q-item-section side center style="min-width: 100px;">
          Language
        </q-item-section>
        <q-item-section>
          <q-select outlined v-model="languageValue" :options="languagesList" dense style="width: 100%;"/>
        </q-item-section>
      </q-item> -->

      <q-item tag="label" v-ripple dense>
        <q-item-section side top>
          <q-checkbox v-model="enableParanoidEncryption" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Enable Paranoid Encryption</q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="q-ml-sm">
        <q-item-label caption>
          Enables browser-level on-the-fly encryption in Files. Files are encrypted/decrypted right on this device, even the server itself cannot get access <br>
          to non-encrypted content of paranoid-encrypted files. Encryption method is AES256.
        </q-item-label>
      </q-item>
      <q-item class="q-ml-sm">
        <q-item-label caption>
          Only files in Encrypted folder will be encrypted.
        </q-item-label>
      </q-item>
      <q-item tag="label" v-ripple dense>
        <q-item-section side top>
          <q-checkbox v-model="enableInPersonalStorage" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Allow encrypt files in Personal Storage.</q-item-label>
        </q-item-section>
      </q-item>
      <q-item class="q-ml-sm">
        <q-item-label caption>
          Every time while upload you will be asked if the file should be encrypted.
        </q-item-label>
      </q-item>
    </q-list>
    <q-separator spaced />
    <div class="q-pa-md">
      <q-btn unelevated v-if="!saving" color="primary" label="Save" align="right" @click="save" />
      <q-btn unelevated v-if="saving" color="primary" label="Saving..." align="right" />
    </div>
  </div>
</template>

<script>
import encryptionSettings from 'src/modules/core-Paranoid-encryption/settings.js'
import webApi from '../../utils/webApi'
export default {
  name: 'ParanoidEncryption',
  data () {
    return {
      saving: false,
      enableParanoidEncryption: false,
      enableInPersonalStorage: false,
    }
  },
  mounted() {
    this.enableParanoidEncryption = encryptionSettings.enableParanoidEncryption
    this.enableInPersonalStorage = encryptionSettings.enableInPersonalStorage
  },
  methods: {
    save () {
      this.saving = true
      webApi.sendRequest({
        sModule: 'CoreParanoidEncryptionWebclientPlugin',
        sMethod: 'UpdateSettings',
        oParameters: {
          EnableModule: this.enableParanoidEncryption,
          EnableInPersonalStorage: this.enableInPersonalStorage
        },
        fCallback: (result, error) => {
          if (result) {
            encryptionSettings.setEnableParanoidEncryption(this.enableParanoidEncryption)
            encryptionSettings.setEncryptFilesPersonalStorage((this.enableInPersonalStorage))
            this.$store.dispatch('files/asyncGetStorages')
          }
          this.saving = false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
