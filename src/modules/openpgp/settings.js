import typesUtils from 'src/utils/types.js'

function CSettings () {
  this.sSelfDestructMessageHash = 'self-destruct'

  this.bEnableModule = false
  this.bRememberPassphrase = false
}

CSettings.prototype.parse = function (oData) {
  if (oData) {
    this.bEnableModule = typesUtils.pBool(oData.EnableModule, this.bEnableModule)
    this.bRememberPassphrase = typesUtils.pBool(oData.RememberPassphrase, this.bRememberPassphrase)
  }
}

CSettings.prototype.setRememberPassphrase = function (bRememberPassphrase) {
  this.bRememberPassphrase = typesUtils.pBool(bRememberPassphrase, this.bRememberPassphrase)
}

export default new CSettings()
