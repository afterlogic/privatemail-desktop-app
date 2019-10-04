import _ from 'lodash'
import textUtils from 'src/utils/text.js'
import addressUtils from 'src/utils/address.js'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

export default {
  sendMessage: function (iAccountId, sToAddr, sCcAddr, sBccAddr, sSubject, sText) {
    if (this.verifyDataForSending(sToAddr, sCcAddr, sBccAddr)) {
      let oParameters = this.getSendSaveParameters(iAccountId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, false)
      console.log('sendMessage', oParameters)
    }
  },

  saveMessage: function (iAccountId, sToAddr, sCcAddr, sBccAddr, sSubject, sText) {
    let oParameters = this.getSendSaveParameters(iAccountId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, false)
    console.log('saveMessage', oParameters)
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

  getSendSaveParameters: function (iAccountId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, bPlainText) {
    let
      oAttachments = {}, //SendingUtils.convertAttachmentsForSending(this.attachments()),
      oParameters = null

    // _.each(this.oHtmlEditor.getUploadedImagesData(), function (oAttach) {
    //   oAttachments[oAttach.TempName] = [oAttach.Name, oAttach.CID, '1', '1']
    // })

    oParameters = {
      'AccountID': iAccountId,
      'FetcherID': '',
      'IdentityID': '',
      // 'FetcherID': this.selectedFetcherOrIdentity() && this.selectedFetcherOrIdentity().FETCHER ? this.selectedFetcherOrIdentity().id() : '',
      // 'IdentityID': this.selectedFetcherOrIdentity() && !this.selectedFetcherOrIdentity().FETCHER ? this.selectedFetcherOrIdentity().id() : '',
      // 'DraftInfo': this.draftInfo(),
      // 'DraftUid': this.draftUid(),
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
