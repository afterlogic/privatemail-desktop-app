import store from 'src/store'

import openpgpSettings from 'src/modules/openpgp/settings.js'

function cOpenPgpKey({ sArmor, sEmail, bPublic, bExternal = false }) {
  this.sArmor = sArmor
  this.sEmail = sEmail
  this.bPublic = bPublic
  this.bExternal = bExternal
  this.sId = 'key-' + Math.round(Math.random() * 1000000)
  this.sPassphrase = null
}

cOpenPgpKey.prototype.getDataToSave = function () {
  return {
    sArmor: this.sArmor,
    sEmail: this.sEmail,
    bPublic: this.bPublic,
  }
}

cOpenPgpKey.prototype.getPassphrase = function () {
  if (!openpgpSettings.bRememberPassphrase) {
    store.commit('main/setPassphrase', { sId: this.sId, sPassphrase: null })
    return null
  }
  return this.sPassphrase
}

cOpenPgpKey.prototype.setPassphrase = function (sPassphrase) {
  if (openpgpSettings.bRememberPassphrase) {
    store.commit('main/setPassphrase', { sId: this.sId, sPassphrase })
  }
}

export default cOpenPgpKey
