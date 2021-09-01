import types from '../../utils/types'

function CSettings () {
  this.enableInPersonalStorage = false
  this.enableParanoidEncryption = false
  this.AllowMultiChunkUpload = false
  this.chunkSize = 111149056
}

CSettings.prototype.parse = function (oData) {
  if (oData) {
    this.enableParanoidEncryption = types.pBool(oData.EnableModule, false)
    this.enableInPersonalStorage = types.pBool(oData.EnableInPersonalStorage, false)
  }
}

CSettings.prototype.setEncryptFilesPersonalStorage = function (enableInPersonalStorage) {
  this.enableInPersonalStorage = enableInPersonalStorage
}

CSettings.prototype.setEnableParanoidEncryption = function (enableParanoidEncryption) {
  this.enableParanoidEncryption = enableParanoidEncryption
}

export default new CSettings()
