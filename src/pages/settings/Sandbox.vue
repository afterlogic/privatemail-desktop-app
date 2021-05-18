<template>
  <div>
    <div class="text-h4 q-mb-md non-selectable">Sandbox</div>
    <q-separator spaced />
    <div class="row" style="height:400px;">
      <textarea class="col full-height" v-model="key" placeholder="Key"></textarea>
      <textarea class="col full-height" v-model="signature" placeholder="Signature"></textarea>
    </div>
    <q-separator spaced />
    <div class="q-pa-md">
        <q-btn unelevated color="primary" label="Verify" align="right" @click="verify" />
    </div>
  </div>
</template>

<style lang="scss">
</style>

<script>
import { ipcRenderer } from 'electron'
// import openpgp from 'src/utils/openpgp.min.js'
// const openpgp = require('src/utils/openpgp.min.js')
const openpgp = require('openpgp')

export default {
  data () {
    return {
        key: '',
        signature: '',
    }
  },
  methods: {
    async verify () {
      let sKey = this.key
      const input = await openpgp.armor.decode(this.signature);
      // console.log(input)
      // console.log(openpgp.enums.armor)


      // const reader = input.data.getReader();
      // console.log(reader);


      // const packetlist = new openpgp.packet.List();
      // await packetlist.read(input.data);
      // verifyHeaders(input.headers, packetlist);
      // console.log(packetlist);


      // reader.read().then(({ done, value }) => {
      //     // When no more data needs to be consumed, close the stream
      //     if (done) {
      //         return;
      //     }
      //     // Enqueue the next data chunk into our target stream

      //     console.log('value', value)
      //   });


      if (sKey) {
        // let sPlain = this.signature.replace('SHA256', 'SHA512').replace('Version: BCPG v1.62', 'Version: OpenPGP.js v4.5.2\r\nComment: https://openpgpjs.org')
        // let sText = this.signature.replace('SHA256', 'SHA512').replace('Version: BCPG v1.62', 'Version: OpenPGP.js v4.5.2\r\nComment: https://openpgpjs.org')
        let sText = this.signature

        let oOptions = {
          message: await openpgp.cleartext.readArmored(sText),
          publicKeys: (await openpgp.key.readArmored(sKey)).keys
        }

        try {
            let oPgpResult = await openpgp.verify(oOptions)

            if (typesUtils.isNonEmptyArray(oPgpResult.signatures) && oPgpResult.signatures[0].valid) {
              return { sVerifiedData: oPgpResult.data }
            } else {
              return { sError: 'Message was not verified.', oPgpResult }
            }
          } catch (oError) {
            return { sError: 'Message was not verified (' + oError.message + ').' }
          }






      } else {
        // notification.showError('No public key found for ' + this.currentAccount.sEmail + ' user.')
      }
    },
    async sign () {
      var options, cleartext, validity;

      var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
      var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----'; //encrypted private key
      var passphrase = 'secret passphrase'; //what the privKey is encrypted with

      var privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0];
      await privKeyObj.decrypt(passphrase);

      options = {
          message: openpgp.cleartext.fromText('Hello, World!'), // CleartextMessage or Message object
          privateKeys: [privKeyObj]                             // for signing
      };

      openpgp.sign(options).then(function(signed) {
          cleartext = signed.data; // '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'
      });
    },
  }
}
</script>
