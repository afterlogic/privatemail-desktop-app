import _ from 'lodash'
import typesUtils from 'src/utils/types.js'
import textUtils from 'src/utils/text.js'
import addressUtils from 'src/utils/address.js'
import webApi from 'src/utils/webApi.js'
import notification from 'src/utils/notification.js'

export default {
  sendMessage: function ({oCurrentAccount, oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid}, fCallback) {
    if (this.verifyDataForSending(sToAddr, sCcAddr, sBccAddr)) {
      let
        oParameters = this.getSendSaveParameters({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText: false}),
        sSentFolder = oCurrentFolderList.Sent ? oCurrentFolderList.Sent.FullName : '',
        sDraftFolder = oCurrentFolderList.Drafts ? oCurrentFolderList.Drafts.FullName : '',
        sCurrEmail = oCurrentAccount.Email,
        bSelfRecipient = (oParameters.To.indexOf(sCurrEmail) > -1 || oParameters.Cc.indexOf(sCurrEmail) > -1 ||
          oParameters.Bcc.indexOf(sCurrEmail) > -1),
        sLoadingMessage = textUtils.i18n('COREWEBCLIENT/INFO_SENDING')

      if (oCurrentAccount.SaveRepliesToCurrFolder && !bSelfRecipient && typesUtils.isNonEmptyArray(oParameters.DraftInfo, 3)) {
        sSentFolder = oParameters.DraftInfo[2]
      }

      oParameters.SentFolder = sSentFolder
      if (oParameters.DraftUid !== '') {
        oParameters.DraftFolder = sDraftFolder
        // if (MainTab) {
        //   MainTab.removeOneMessageFromCacheForFolder(oParameters.AccountID, oParameters.DraftFolder, oParameters.DraftUid)
        //   MainTab.replaceHashWithoutMessageUid(oParameters.DraftUid)
        // } else {
        //   MailCache.removeOneMessageFromCacheForFolder(oParameters.AccountID, oParameters.DraftFolder, oParameters.DraftUid)
        //   Routing.replaceHashWithoutMessageUid(oParameters.DraftUid)
        // }
      }
      notification.showLoading(sLoadingMessage)
      webApi.sendRequest('Mail', 'SendMessage', oParameters, (oResult, oError) => {
        notification.hideLoading()
        if (_.isFunction(fCallback)) {
          fCallback(oResult, oError)
        }
      })
    }
  },

  saveMessage: function ({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid}, fCallback) {
    let
      oParameters = this.getSendSaveParameters({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText: false}),
      sDraftFolder = oCurrentFolderList.Drafts ? oCurrentFolderList.Drafts.FullName : '',
      sLoadingMessage = textUtils.i18n('%MODULENAME%/INFO_SAVING')

    if (typeof oParameters.DraftFolder === 'undefined') {
      oParameters.DraftFolder = sDraftFolder
    }

    // // Message with this uid will not be selected from message list
    // MailCache.savingDraftUid(oParameters.DraftUid)
    // if (MainTab) {
    //   MainTab.startMessagesLoadingWhenDraftSaving(oParameters.AccountID, oParameters.DraftFolder)
    //   MainTab.replaceHashWithoutMessageUid(oParameters.DraftUid)
    // } else {
    //   MailCache.startMessagesLoadingWhenDraftSaving(oParameters.AccountID, oParameters.DraftFolder)
    //   Routing.replaceHashWithoutMessageUid(oParameters.DraftUid)
    // }

    notification.showLoading(sLoadingMessage)
    webApi.sendRequest('Mail', 'SaveMessage', oParameters, (oResult, oError) => {
      notification.hideLoading()
      if (_.isFunction(fCallback)) {
        fCallback(oResult, oError, oParameters)
      }
    })
},

  verifyDataForSending: function (sToAddr, sCcAddr, sBccAddr) {
    let
      aToIncorrect = addressUtils.getIncorrectEmailsFromAddressString(sToAddr),
      aCcIncorrect = addressUtils.getIncorrectEmailsFromAddressString(sCcAddr),
      aBccIncorrect = addressUtils.getIncorrectEmailsFromAddressString(sBccAddr),
      aIncorrect = _.union(aToIncorrect, aCcIncorrect, aBccIncorrect),
      aEncodedIncorrect = _.map(aIncorrect, function (sIncorrect) {
        return textUtils.encodeHtml(sIncorrect)
      }),
      sWarning = textUtils.i18n('%MODULENAME%/ERROR_INPUT_CORRECT_EMAILS') + ' ' + aEncodedIncorrect.join(', ')

    if (aIncorrect.length > 0) {
      notification.showError(sWarning)
      return false
    }

    return true
  },

  getSendSaveParameters: function ({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText}) {
    let
      oAttachments = {}, //SendingUtils.convertAttachmentsForSending(this.attachments()),
      oParameters = null

    // _.each(this.oHtmlEditor.getUploadedImagesData(), function (oAttach) {
    //   oAttachments[oAttach.TempName] = [oAttach.Name, oAttach.CID, '1', '1']
    // })

    oParameters = {
      'AccountID': oCurrentFolderList.AccountId,
      'FetcherID': '',
      'IdentityID': '',
      // 'FetcherID': this.selectedFetcherOrIdentity() && this.selectedFetcherOrIdentity().FETCHER ? this.selectedFetcherOrIdentity().id() : '',
      // 'IdentityID': this.selectedFetcherOrIdentity() && !this.selectedFetcherOrIdentity().FETCHER ? this.selectedFetcherOrIdentity().id() : '',
      // 'DraftInfo': this.draftInfo(),
      'DraftUid': sDraftUid,
      'To': sToAddr,
      'Cc': sCcAddr,
      'Bcc': sBccAddr,
      'Subject': sSubject,
      'Text': sText,
      'IsHtml': bPlainText,
      // 'Importance': this.selectedImportance(),
      // 'SendReadingConfirmation': this.sendReadingConfirmation(),
      'Attachments': oAttachments,
      // 'InReplyTo': this.inReplyTo(),
      // 'References': this.references(),
    }

    // _.each(this.toolbarControllers(), function (oController) {
    //   if (_.isFunction(oController.doAfterPreparingSendMessageParameters)) {
    //     oController.doAfterPreparingSendMessageParameters(oParameters)
    //   }
    // })

    // if (this.templateFolderName() !== '' && bSaveTemplate) {
    //   oParameters.DraftFolder = this.templateFolderName()
    //   oParameters.DraftUid = this.templateUid()
    // }

    return oParameters
  },
}
