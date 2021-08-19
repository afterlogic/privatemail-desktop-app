
function CSettings () {
  this.enableInPersonalStorage = false
  this.enableParanoidEncryption = false
  this.AllowMultiChunkUpload = false
  this.chunkSize = 111149056
}

CSettings.prototype.parse = function (oData) {
  console.log(oData, 'oData')
  if (oData) {
    this.enableParanoidEncryption = oData.EnableModule
    this.enableInPersonalStorage = oData.EnableInPersonalStorage
  }
}

CSettings.prototype.setEncryptFilesPersonalStorage = function (enableInPersonalStorage) {
  this.enableInPersonalStorage = enableInPersonalStorage
}

CSettings.prototype.setEnableParanoidEncryption = function (enableParanoidEncryption) {
  this.enableParanoidEncryption = enableParanoidEncryption
}

export default new CSettings()
