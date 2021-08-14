import typesUtils from "../../utils/types";

function CSettings () {
  this.encryptFilesPersonalStorage = false
  this.enableParanoidEncryption = false
}

CSettings.prototype.parse = function (oData, oWebclientData) {
  console.log(oData, 'oData')
  console.log(oWebclientData, 'oWebclientData')
  if (oData) {
    this.enableParanoidEncryption = oData.EnableModule
  }
}

CSettings.prototype.setEncryptFilesPersonalStorage = function (encryptFilesPersonalStorage) {
  this.encryptFilesPersonalStorage = encryptFilesPersonalStorage
}

CSettings.prototype.setEnableParanoidEncryption = function (enableParanoidEncryption) {
  this.enableParanoidEncryption = enableParanoidEncryption
}

export default new CSettings()
