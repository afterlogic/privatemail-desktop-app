import typesUtils from 'src/utils/types.js'

function cIdentity (oData) {
  this.bDefault = false
  this.sEmail = ''
  this.iEntityId = 0
  this.sFriendlyName = ''
  this.iIdAccount = 0
  this.iIdUser = 0
  this.sSignature = ''
  this.sUUID = ''
  this.bUseSignature = false

  if (typesUtils.isNonEmptyObject(oData)) {
    this.parse(oData)
  }
}

cIdentity.prototype.parse = function (oData) {
  this.bDefault = typesUtils.pBool(oData.Default)
  this.sEmail = typesUtils.pString(oData.Email)
  this.iEntityId = typesUtils.pInt(oData.EntityId)
  this.sFriendlyName = typesUtils.pString(oData.FriendlyName)
  this.iIdAccount = typesUtils.pInt(oData.IdAccount)
  this.iIdUser = typesUtils.pInt(oData.IdUser)
  this.sSignature = typesUtils.pString(oData.Signature)
  this.sUUID = typesUtils.pString(oData.UUID)
  this.bUseSignature = typesUtils.pBool(oData.UseSignature)
}

export default cIdentity
