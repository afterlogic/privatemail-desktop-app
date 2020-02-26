import typesUtils from 'src/utils/types.js'

function cAlias (oData) {
  this.bDefault = false
  this.sEmail = ''
  this.iEntityId = 0
  this.sFriendlyName = ''
  this.sForwardTo = ''
  this.iIdAccount = 0
  this.iIdUser = 0
  this.sSignature = ''
  this.sUUID = ''
  this.bUseSignature = false

  if (typesUtils.isNonEmptyObject(oData)) {
    this.parse(oData)
  }
}

cAlias.prototype.parse = function (oData) {
  this.bDefault = typesUtils.pBool(oData.Default)
  this.sEmail = typesUtils.pString(oData.Email)
  this.iEntityId = typesUtils.pInt(oData.EntityId)
  this.sFriendlyName = typesUtils.pString(oData.FriendlyName)
  this.sForwardTo = typesUtils.pString(oData.ForwardTo)
  this.iIdAccount = typesUtils.pInt(oData.IdAccount)
  this.iIdUser = typesUtils.pInt(oData.IdUser)
  this.sSignature = typesUtils.pString(oData.Signature)
  this.sUUID = typesUtils.pString(oData.UUID)
  this.bUseSignature = typesUtils.pBool(oData.UseSignature)
}

cAlias.prototype.getFull = function (oData) {
  let sFull = ''
  let sEmail = _.trim(this.sEmail)
  let sFriendlyName = _.trim(this.sFriendlyName)
  if (typesUtils.isNonEmptyString(sEmail)) {
    if (typesUtils.isNonEmptyString(sFriendlyName)) {
      sFull = '"' + sFriendlyName + '" <' + sEmail + '>'
    } else {
      sFull = sEmail
    }
  } else {
    sFull = sFriendlyName
  }
  return sFull
}

export default cAlias
