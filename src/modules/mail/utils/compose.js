import _ from 'lodash'
import typesUtils from 'src/utils/types.js'
import textUtils from 'src/utils/text.js'
import addressUtils from 'src/utils/address.js'
import messageUtils from 'src/modules/mail/utils/message.js'
import webApi from 'src/utils/webApi.js'
import notification from 'src/utils/notification.js'

// /**
//  * @param {Object} oMessage
//  * @param {number} iAccountId
//  * @param {Object} oFetcherOrIdentity
//  * @param {boolean} bPasteSignatureAnchor
//  * @return {string}
//  */
// function GetReplyMessageBody(oMessage, iAccountId, oFetcherOrIdentity, bPasteSignatureAnchor)
// {
//   let
//     sReplyTitle = textUtils.i18n('%MODULENAME%/TEXT_REPLY_MESSAGE', {
//       'DATE': oMessage.oDateModel.getDate(),
//       'TIME': oMessage.oDateModel.getTime(),
//       'SENDER': textUtils.encodeHtml(oMessage.oFrom.getFull())
//     }),
//     sReplyBody = '<br /><br />' + this.getSignatureText(iAccountId, oFetcherOrIdentity, bPasteSignatureAnchor) + '<br /><br />' +
//       '<div data-anchor="reply-title">' + sReplyTitle + '</div><blockquote>' + oMessage.getConvertedHtml() + '</blockquote>'

//   return sReplyBody
// }

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
      webApi.sendRequest({
        sModule: 'Mail',
        sMethod: 'SendMessage',
        oParameters,
        fCallback: (oResult, oError) => {
          notification.hideLoading()
          if (_.isFunction(fCallback)) {
            fCallback(oResult, oError)
          }
        },
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
    webApi.sendRequest({
      sModule: 'Mail',
      sMethod: 'SaveMessage',
      oParameters,
      fCallback: (oResult, oError) => {
        notification.hideLoading()
        if (_.isFunction(fCallback)) {
          fCallback(oResult, oError, oParameters)
        }
      },
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

  /**
   * Obtains a subject of the message, which is the answer (reply or forward):
   * - adds the prefix "Re" of "Fwd" if the language is English, otherwise - their translation
   * - joins "Re" and "Fwd" prefixes if it is allowed for application in settings
   * @param {string} sSubject Subject of the message, the answer to which is composed
   * @param {boolean} bReply If **true** the prefix will be "Re", otherwise - "Fwd"
   * @return {string}
   */
  getReplySubject: function (sSubject, bReply) {
    let
      sRePrefix = 'Re',//TextUtils.i18n('%MODULENAME%/TEXT_REPLY_PREFIX'),
      sFwdPrefix = 'Fwd',//TextUtils.i18n('%MODULENAME%/TEXT_FORWARD_PREFIX'),
      sPrefix = bReply ? sRePrefix : sFwdPrefix,
      sReSubject = sPrefix + ': ' + sSubject
    
    // if (Settings.JoinReplyPrefixes) {
      sReSubject = messageUtils.joinReplyPrefixesInSubject(sReSubject, sRePrefix, sFwdPrefix)
    // }
    
    return sReSubject
  },
    
  // /**
  //  * @param {Object} oMessage
  //  * @param {string} sReplyType
  //  * @param {number} iAccountId
  //  * @param {Object} oFetcherOrIdentity
  //  * @param {boolean} bPasteSignatureAnchor
  //  * @param {string} sText
  //  * @param {string} sDraftUid
  //  * @return {Object}
  //  */
  // getReplyDataFromMessage: function (oMessage, sReplyType, iAccountId,
  //                           oFetcherOrIdentity, bPasteSignatureAnchor, sText, sDraftUid) {
  //   let
  //     oReplyData = {
  //       DraftInfo: [],
  //       DraftUid: '',
  //       To: '',
  //       Cc: '',
  //       Bcc: '',
  //       Subject: '',
  //       Attachments: [],
  //       InReplyTo: oMessage.messageId(),
  //       References: this.getReplyReferences(oMessage),
  //     },
  //     aAttachmentsLink = [],
  //     sToAddr = oMessage.oReplyTo.getFull(),
  //     sTo = oMessage.oTo.getFull()
    
  //   if (sToAddr === '' || oMessage.oFrom.getFirstEmail() === oMessage.oReplyTo.getFirstEmail() && oMessage.oReplyTo.getFirstName() === '') {
  //     sToAddr = oMessage.oFrom.getFull()
  //   }
    
  //   if (!sText || sText === '') {
  //     sText = this.sReplyText
  //     this.sReplyText = ''
  //   }
    
  //   if (sReplyType === 'forward') {
  //     oReplyData.Text = sText + this.getForwardMessageBody(oMessage, iAccountId, oFetcherOrIdentity)
  //   } else if (sReplyType === 'resend') {
  //     oReplyData.Text = oMessage.getConvertedHtml()
  //     oReplyData.Cc = oMessage.cc()
  //     oReplyData.Bcc = oMessage.bcc()
  //   } else {
  //     oReplyData.Text = sText + GetReplyMessageBody.call(this, oMessage, iAccountId, oFetcherOrIdentity, bPasteSignatureAnchor)
  //   }
    
  //   if (sDraftUid) {
  //     oReplyData.DraftUid = sDraftUid
  //   } else {
  //     oReplyData.DraftUid = this.sReplyDraftUid
  //     this.sReplyDraftUid = ''
  //   }

  //   switch (sReplyType) {
  //     case Enums.ReplyType.Reply:
  //       oReplyData.DraftInfo = [Enums.ReplyType.Reply, oMessage.uid(), oMessage.folder()]
  //       oReplyData.To = sToAddr
  //       oReplyData.Subject = this.getReplySubject(oMessage.subject(), true)
  //       aAttachmentsLink = _.filter(oMessage.attachments(), function (oAttach) {
  //         return oAttach.linked()
  //       })
  //       break
  //     case Enums.ReplyType.ReplyAll:
  //       oReplyData.DraftInfo = [Enums.ReplyType.ReplyAll, oMessage.uid(), oMessage.folder()]
  //       oReplyData.To = sToAddr
  //       oReplyData.Cc = GetReplyAllCcAddr(oMessage, iAccountId, oFetcherOrIdentity)
  //       oReplyData.Subject = this.getReplySubject(oMessage.subject(), true)
  //       aAttachmentsLink = _.filter(oMessage.attachments(), function (oAttach) {
  //         return oAttach.linked()
  //       })
  //       break
  //     case Enums.ReplyType.Resend:
  //       oReplyData.DraftInfo = [Enums.ReplyType.Resend, oMessage.uid(), oMessage.folder(), oMessage.cc(), oMessage.bcc()]
  //       oReplyData.To = sTo
  //       oReplyData.Subject = oMessage.subject()
  //       aAttachmentsLink = oMessage.attachments()
  //       break
  //     case Enums.ReplyType.ForwardAsAttach:
  //     case Enums.ReplyType.Forward:
  //       oReplyData.DraftInfo = [Enums.ReplyType.Forward, oMessage.uid(), oMessage.folder()]
  //       oReplyData.Subject = this.getReplySubject(oMessage.subject(), false)
  //       aAttachmentsLink = oMessage.attachments()
  //       break
  //   }
    
  //   _.each(aAttachmentsLink, function (oAttachLink) {
  //     if (oAttachLink.getCopy) {
  //       let oCopy = oAttachLink.getCopy()
  //       oReplyData.Attachments.push(oCopy)
  //     }
  //   })

  //   return oReplyData
  // },

  // /**
  //  * Prepares and returns references for reply message.
  //  * @param {Object} oMessage
  //  * @return {string}
  //  */
  // getReplyReferences: function (oMessage) {
  //   let
  //     sRef = oMessage.references(),
  //     sInR = oMessage.messageId(),
  //     sPos = sRef.indexOf(sInR)

  //   if (sPos === -1) {
  //     sRef += ' ' + sInR
  //   }

  //   return sRef
  // },
}
