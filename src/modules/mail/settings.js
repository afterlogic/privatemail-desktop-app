import typesUtils from 'src/utils/types.js'
import store from 'src/store'

function CSettings () {
  // this.bAllowAddAccounts = false
  // this.bAllowAlwaysRefreshFolders = false
  this.bAllowAutosaveInDrafts = false
  // this.bAllowChangeMailQuotaOnMailServer = false
  // this.bAllowDefaultAccountForUser = false
  this.bAllowIdentities = false
  this.bAllowInsertImage = false
  // this.bAllowTemplateFolders = false
  this.iAutoSaveIntervalSeconds = 0
  // this.bAutocreateMailAccountOnNewUserFirstLogin = false
  // this.bIgnoreImapSubscription = false
  // this.iImageUploadSizeLimit = 0
  // this.oMessagesSortBy = null
  // this.bOnlyUserEmailsInIdentities = false
  // this.oSmtpAuthType = null

  // this.bAllowAppRegisterMailto = false
  // this.bAllowChangeInputDirection = false
  // this.bFoldersExpandedByDefault = false
  // this.bAllowSpamFolder = false
  // this.bAllowAddNewFolderOnMainScreen = false
  // this.aComposeToolbarOrder = []
  // this.sDefaultFontName = 'Tahoma'
  // this.iDefaultFontSize = 3
  // this.bAlwaysTryUseImageWhilePasting = false
  // this.bJoinReplyPrefixes = true
  this.iMailsPerPage = 20
  // this.iMaxMessagesBodiesSizeToPrefetch = 0
  // this.iMessageBodyTruncationThreshold = 0
  // this.bShowEmailAsTabName = true
  // this.bAllowShowMessagesCountInFolderList = false
  // this.bAllowSearchMessagesBySubject = false
  // this.aPrefixesToRemoveBeforeSearchMessagesBySubject = ['Re', 'Fwd']
  // this.bAllowHorizontalLayout = false
  // this.bHorizontalLayoutByDefault = false
  // this.bShowMessagesCountInFolderList = false
}

CSettings.prototype.parse = function (oData, oWebclientData) {
  if (oData) {
    // this.bAllowAddAccounts = typesUtils.pBool(oData.AllowAddAccounts, this.bAllowAddAccounts)
    // this.bAllowAlwaysRefreshFolders = typesUtils.pBool(oData.AllowAlwaysRefreshFolders, this.bAllowAlwaysRefreshFolders)
    this.setAllowAutosaveInDrafts(oData.AllowAutosaveInDrafts)
    // this.bAllowChangeMailQuotaOnMailServer = typesUtils.pBool(oData.AllowChangeMailQuotaOnMailServer, this.bAllowChangeMailQuotaOnMailServer)
    // this.bAllowDefaultAccountForUser = typesUtils.pBool(oData.AllowDefaultAccountForUser, this.bAllowDefaultAccountForUser)
    this.bAllowIdentities = typesUtils.pBool(oData.AllowIdentities, this.bAllowIdentities)
    this.bAllowInsertImage = typesUtils.pBool(oData.AllowInsertImage, this.bAllowInsertImage)
    // this.bAllowTemplateFolders = typesUtils.pBool(oData.AllowTemplateFolders, this.bAllowTemplateFolders)
    this.iAutoSaveIntervalSeconds = typesUtils.pInt(oData.AutoSaveIntervalSeconds, this.iAutoSaveIntervalSeconds)
    // this.bAutocreateMailAccountOnNewUserFirstLogin = typesUtils.pBool(oData.AutocreateMailAccountOnNewUserFirstLogin, this.bAutocreateMailAccountOnNewUserFirstLogin)
    // this.bIgnoreImapSubscription = typesUtils.pBool(oData.IgnoreImapSubscription, this.bIgnoreImapSubscription)
    // this.iImageUploadSizeLimit = typesUtils.pInt(oData.ImageUploadSizeLimit, this.iImageUploadSizeLimit)
    // this.oMessagesSortBy = typesUtils.pObject(oData.MessagesSortBy, this.oMessagesSortBy)
    // this.bOnlyUserEmailsInIdentities = typesUtils.pBool(oData.OnlyUserEmailsInIdentities, this.bOnlyUserEmailsInIdentities)
    // this.oSmtpAuthType = typesUtils.pObject(oData.SmtpAuthType, this.oSmtpAuthType)
  }

  if (oWebclientData) {
    // this.bAllowAppRegisterMailto = typesUtils.pBool(oWebclientData.AllowAppRegisterMailto, this.bAllowAppRegisterMailto)
    // this.bAllowChangeInputDirection = typesUtils.pBool(oWebclientData.AllowChangeInputDirection, this.bAllowChangeInputDirection)
    // this.bFoldersExpandedByDefault = typesUtils.pBool(oWebclientData.FoldersExpandedByDefault, this.bFoldersExpandedByDefault)
    // this.bAllowSpamFolder = typesUtils.pBool(oWebclientData.AllowSpamFolder, this.bAllowSpamFolder)
    // this.bAllowAddNewFolderOnMainScreen = typesUtils.pBool(oWebclientData.AllowAddNewFolderOnMainScreen, this.bAllowAddNewFolderOnMainScreen)
    // this.aComposeToolbarOrder = typesUtils.pArray(oWebclientData.ComposeToolbarOrder, this.aComposeToolbarOrder)
    // this.sDefaultFontName = typesUtils.pString(oWebclientData.DefaultFontName, this.sDefaultFontName)
    // this.iDefaultFontSize = typesUtils.pInt(oWebclientData.DefaultFontSize, this.iDefaultFontSize)
    // this.bAlwaysTryUseImageWhilePasting = typesUtils.pBool(oWebclientData.AlwaysTryUseImageWhilePasting, this.bAlwaysTryUseImageWhilePasting)
    // this.bJoinReplyPrefixes = typesUtils.pBool(oWebclientData.JoinReplyPrefixes, this.bJoinReplyPrefixes)
    this.setMailsPerPage(oWebclientData.MailsPerPage)
    // this.iMaxMessagesBodiesSizeToPrefetch = typesUtils.pInt(oWebclientData.MaxMessagesBodiesSizeToPrefetch, this.iMaxMessagesBodiesSizeToPrefetch)
    // this.iMessageBodyTruncationThreshold = typesUtils.pInt(oWebclientData.MessageBodyTruncationThreshold, this.iMessageBodyTruncationThreshold)
    // this.bShowEmailAsTabName = typesUtils.pBool(oWebclientData.ShowEmailAsTabName, this.bShowEmailAsTabName)
    // this.bAllowShowMessagesCountInFolderList = typesUtils.pBool(oWebclientData.AllowShowMessagesCountInFolderList, this.bAllowShowMessagesCountInFolderList)
    // this.bAllowSearchMessagesBySubject = typesUtils.pBool(oWebclientData.AllowSearchMessagesBySubject, this.bAllowSearchMessagesBySubject)
    // this.aPrefixesToRemoveBeforeSearchMessagesBySubject = typesUtils.pArray(oWebclientData.PrefixesToRemoveBeforeSearchMessagesBySubject, this.aPrefixesToRemoveBeforeSearchMessagesBySubject)
    // this.bAllowHorizontalLayout = typesUtils.pBool(oWebclientData.AllowHorizontalLayout, this.bAllowHorizontalLayout)
    // this.bHorizontalLayoutByDefault = typesUtils.pBool(oWebclientData.HorizontalLayoutByDefault, this.bHorizontalLayoutByDefault)
    // this.bShowMessagesCountInFolderList = typesUtils.pBool(oWebclientData.ShowMessagesCountInFolderList, this.bShowMessagesCountInFolderList)
  }
}

CSettings.prototype.setMailsPerPage = function (iMailsPerPage) {
  iMailsPerPage = typesUtils.pInt(iMailsPerPage, this.iMailsPerPage)
  if (iMailsPerPage !== this.iMailsPerPage) {
    this.iMailsPerPage = iMailsPerPage
    store.commit('mail/setMailsPerPage', this.iMailsPerPage)
    store.dispatch('mail/asyncGetMessages', {})
  }
}

CSettings.prototype.setAllowAutosaveInDrafts = function (bAllowAutosaveInDrafts) {
  this.bAllowAutosaveInDrafts = typesUtils.pBool(bAllowAutosaveInDrafts, this.bAllowAutosaveInDrafts)
}

export default new CSettings()
