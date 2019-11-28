import typesUtils from 'src/utils/types.js'

function CSettings () {
  this.bAllowAddAccounts = false
  this.bAllowAlwaysRefreshFolders = false
  this.bAllowAutosaveInDrafts = false
  this.bAllowChangeMailQuotaOnMailServer = false
  this.bAllowDefaultAccountForUser = false
  this.bAllowIdentities = false
  this.bAllowInsertImage = false
  this.bAllowTemplateFolders = false
  this.iAutoSaveIntervalSeconds = 0
  this.bAutocreateMailAccountOnNewUserFirstLogin = false
  this.bIgnoreImapSubscription = false
  this.iImageUploadSizeLimit = 0
  this.oMessagesSortBy = null
  this.bOnlyUserEmailsInIdentities = false
  this.oSmtpAuthType = null
}

CSettings.prototype.parse = function (oData) {
  this.bAllowAddAccounts = typesUtils.pBool(oData.AllowAddAccounts, this.bAllowAddAccounts)
  this.bAllowAlwaysRefreshFolders = typesUtils.pBool(oData.AllowAlwaysRefreshFolders, this.bAllowAlwaysRefreshFolders)
  this.bAllowAutosaveInDrafts = typesUtils.pBool(oData.AllowAutosaveInDrafts, this.bAllowAutosaveInDrafts)
  this.bAllowChangeMailQuotaOnMailServer = typesUtils.pBool(oData.AllowChangeMailQuotaOnMailServer, this.bAllowChangeMailQuotaOnMailServer)
  this.bAllowDefaultAccountForUser = typesUtils.pBool(oData.AllowDefaultAccountForUser, this.bAllowDefaultAccountForUser)
  this.bAllowIdentities = typesUtils.pBool(oData.AllowIdentities, this.bAllowIdentities)
  this.bAllowInsertImage = typesUtils.pBool(oData.AllowInsertImage, this.bAllowInsertImage)
  this.bAllowTemplateFolders = typesUtils.pBool(oData.AllowTemplateFolders, this.bAllowTemplateFolders)
  this.iAutoSaveIntervalSeconds = typesUtils.pInt(oData.AutoSaveIntervalSeconds, this.iAutoSaveIntervalSeconds)
  this.bAutocreateMailAccountOnNewUserFirstLogin = typesUtils.pBool(oData.AutocreateMailAccountOnNewUserFirstLogin, this.bAutocreateMailAccountOnNewUserFirstLogin)
  this.bIgnoreImapSubscription = typesUtils.pBool(oData.IgnoreImapSubscription, this.bIgnoreImapSubscription)
  this.iImageUploadSizeLimit = typesUtils.pInt(oData.ImageUploadSizeLimit, this.iImageUploadSizeLimit)
  this.oMessagesSortBy = typesUtils.pObject(oData.MessagesSortBy, this.oMessagesSortBy)
  this.bOnlyUserEmailsInIdentities = typesUtils.pBool(oData.OnlyUserEmailsInIdentities, this.bOnlyUserEmailsInIdentities)
  this.oSmtpAuthType = typesUtils.pObject(oData.SmtpAuthType, this.oSmtpAuthType)
}

export default new CSettings()
