import { machineIdSync } from 'node-machine-id'

import typesUtils from '../../../src/utils/types.js'

const crypto = require('crypto')
const sAlgorithm = 'aes-256-cbc'
const sMachineId = machineIdSync()
let sMachineIdAtLeast48 = sMachineId
while (sMachineIdAtLeast48.length < 48) {
  sMachineIdAtLeast48 += sMachineId
}
const oPcId = Buffer.from(sMachineIdAtLeast48)
const oKey = oPcId.slice(0, 32)
const oIv = oPcId.slice(32, 48)

export default {
  encrypt: function (sText) {
    if (typesUtils.isNonEmptyString(sText)) {
      let oCipher = crypto.createCipheriv(sAlgorithm, Buffer.from(oKey), oIv)
      let oEncrypted = oCipher.update(sText)
      oEncrypted = Buffer.concat([oEncrypted, oCipher.final()])
      return oEncrypted.toString('hex')
    }
    return ''
  },

  decrypt: function (sText) {
    if (typesUtils.isNonEmptyString(sText)) {
      let oEncrypted = Buffer.from(sText, 'hex')
      let oDecipher = crypto.createDecipheriv(sAlgorithm, Buffer.from(oKey), oIv)
      try {
        let oDecrypted = oDecipher.update(oEncrypted)
        oDecrypted = Buffer.concat([oDecrypted, oDecipher.final()])
        return oDecrypted.toString()
      } catch (oErr) {
        return ''
      }
    }
    return ''
  },
}
