import _ from 'lodash'
import dateUtils from 'src/utils/date.js'
import typesUtils from 'src/utils/types.js'
import textUtils from 'src/utils/text.js'
import addressUtils from 'src/utils/address.js'
import messageUtils from 'src/modules/mail/utils/message.js'
import mailEnums from 'src/modules/mail/enums.js'
import webApi from 'src/utils/webApi.js'
import notification from 'src/utils/notification.js'

let Settings = {
  JoinReplyPrefixes: true,
}

/**
 * Prepares and returns cc address for reply message.
 * @param {Object} oMessage
 * @param {Object} oCurrentAccount
 * @param {Object} oFetcherOrIdentity
 * @return {string}
 */
function _getReplyAllCcAddr(oMessage, oCurrentAccount, oFetcherOrIdentity) {
  let
    aToCollection = oMessage.To && _.isArray(oMessage.To['@Collection']) ? oMessage.To['@Collection'] : [],
    aCcCollection = oMessage.Cc && _.isArray(oMessage.Cc['@Collection']) ? oMessage.Cc['@Collection'] : [],
    aBccCollection = oMessage.Bcc && _.isArray(oMessage.Bcc['@Collection']) ? oMessage.Bcc['@Collection'] : [],
    aAddrCollection = _.filter(_.union(aToCollection, aCcCollection, aBccCollection), function (oAddress) {
      return oCurrentAccount.Email !== oAddress.Email && (!oFetcherOrIdentity || oFetcherOrIdentity.Email !== oAddress.Email)
    })

  return messageUtils.getFullAddress(aAddrCollection)
}

export default {
  sendMessage: function ({oCurrentAccount, oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, aDraftInfo, sInReplyTo, sReferences, aAttachments}, fCallback) {
    if (this.verifyDataForSending(sToAddr, sCcAddr, sBccAddr)) {
      let
        oParameters = this.getSendSaveParameters({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText: false, aDraftInfo, sInReplyTo, sReferences, aAttachments}),
        sSentFolder = oCurrentFolderList.Sent ? oCurrentFolderList.Sent.FullName : '',
        sDraftFolder = oCurrentFolderList.Drafts ? oCurrentFolderList.Drafts.FullName : '',
        sCurrEmail = oCurrentAccount.Email,
        bSelfRecipient = (oParameters.To.indexOf(sCurrEmail) > -1 || oParameters.Cc.indexOf(sCurrEmail) > -1 ||
          oParameters.Bcc.indexOf(sCurrEmail) > -1),
        sLoadingMessage = 'Sending...' // textUtils.i18n('COREWEBCLIENT/INFO_SENDING')

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

  saveMessage: function ({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, aDraftInfo, sInReplyTo, sReferences, aAttachments}, fCallback) {
    let
      oParameters = this.getSendSaveParameters({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText: false, aDraftInfo, sInReplyTo, sReferences, aAttachments}),
      sDraftFolder = oCurrentFolderList.Drafts ? oCurrentFolderList.Drafts.FullName : '',
      sLoadingMessage = 'Saving...' // textUtils.i18n('%MODULENAME%/INFO_SAVING')

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
      // sWarning = textUtils.i18n('%MODULENAME%/ERROR_INPUT_CORRECT_EMAILS') + ' ' + aEncodedIncorrect.join(', ')
      sWarning = 'Please specify correct emails. Incorrect emails: ' + aEncodedIncorrect.join(', ')

    if (aIncorrect.length > 0) {
      notification.showError(sWarning)
      return false
    }

    return true
  },

  getSendSaveParameters: function ({oCurrentFolderList, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText, aDraftInfo, sInReplyTo, sReferences, aAttachments}) {
    let
      oAttachments = {}, //SendingUtils.convertAttachmentsForSending(this.Attachments),
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
      'DraftInfo': typesUtils.pArray(aDraftInfo),
      'DraftUid': typesUtils.pString(sDraftUid),
      'To': typesUtils.pString(sToAddr),
      'Cc': typesUtils.pString(sCcAddr),
      'Bcc': typesUtils.pString(sBccAddr),
      'Subject': typesUtils.pString(sSubject),
      'Text': typesUtils.pString(sText),
      'IsHtml': !typesUtils.pBool(bPlainText),
      // 'Importance': this.selectedImportance(),
      // 'SendReadingConfirmation': this.sendReadingConfirmation(),
      'Attachments': oAttachments,
      'InReplyTo': typesUtils.pString(sInReplyTo),
      'References': typesUtils.pString(sReferences),
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
      sRePrefix = 'Re', // textUtils.i18n('%MODULENAME%/TEXT_REPLY_PREFIX'),
      sFwdPrefix = 'Fwd', // textUtils.i18n('%MODULENAME%/TEXT_FORWARD_PREFIX'),
      sPrefix = bReply ? sRePrefix : sFwdPrefix,
      sReSubject = sPrefix + ': ' + sSubject
    
    if (Settings.JoinReplyPrefixes) {
      sReSubject = messageUtils.joinReplyPrefixesInSubject(sReSubject, sRePrefix, sFwdPrefix)
    }
    
    return sReSubject
  },

  /**
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @param {boolean} bPasteSignatureAnchor
   * @return {string}
   */
  getSignatureText: function (oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor)
  {
    return ''
    // let sSignature = this.getClearSignature(oCurrentAccount, oFetcherOrIdentity)

    // if (bPasteSignatureAnchor) {
    //   return '<div data-anchor="signature">' + sSignature + '</div>'
    // }

    // return '<div>' + sSignature + '</div>'
  },

  /**
   * @param {Object} oMessage
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @param {boolean} bPasteSignatureAnchor
   * @return {string}
   */
  getReplyMessageBody: function (oMessage, oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor)
  {
    let
      // sReplyTitle = textUtils.i18n('%MODULENAME%/TEXT_REPLY_MESSAGE', {
      //   'DATE': dateUtils.getDate(oMessage.TimeStampInUTC),
      //   'TIME': dateUtils.getTime(oMessage.TimeStampInUTC),
      //   'SENDER': textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.From))
      // }),
      sReplyTitle = ('On %DATE% at %TIME%, %SENDER% wrote:')
        .replace('%DATE%', dateUtils.getDate(oMessage.TimeStampInUTC))
        .replace('%TIME%', dateUtils.getTime(oMessage.TimeStampInUTC))
        .replace('%SENDER%', textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.From))),
      sReplyBody = '<br /><br />' + this.getSignatureText(oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor) + '<br /><br />' +
        '<div data-anchor="reply-title">' + sReplyTitle + '</div><blockquote>' + messageUtils.getConvertedHtml(oMessage) + '</blockquote>'

    return sReplyBody
  },

  /**
   * @param {Object} oMessage
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @return {string}
   */
  getForwardMessageBody: function (oMessage, oCurrentAccount, oFetcherOrIdentity) {
    let
      sCcAddr = textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.Cc)),
      // sCcPart = (sCcAddr !== '') ? textUtils.i18n('%MODULENAME%/TEXT_FORWARD_MESSAGE_CCPART', {'CCADDR': sCcAddr}) : '',
      sCcPart = (sCcAddr !== '') ? ('CC: %CCADDR%<br />').replace('%CCADDR%', sCcAddr) : '',
      // sForwardTitle = textUtils.i18n('%MODULENAME%/TEXT_FORWARD_MESSAGE', {
      //   'FROMADDR': textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.From)),
      //   'TOADDR': textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.To)),
      //   'CCPART': sCcPart,
      //   'FULLDATE': dateUtils.getFullDate(oMessage.TimeStampInUTC),
      //   'SUBJECT': textUtils.encodeHtml(oMessage.Subject)
      // }),
      sForwardTitle = ('---- Original Message ----<br />From: %FROMADDR%<br />To: %TOADDR%<br />%CCPART%Sent: %FULLDATE%<br />Subject: %SUBJECT%<br />')
        .replace('%FROMADDR%', textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.From)))
        .replace('%TOADDR%', textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.To)))
        .replace('%CCPART%', sCcPart)
        .replace('%FULLDATE%', dateUtils.getFullDate(oMessage.TimeStampInUTC))
        .replace('%SUBJECT%', textUtils.encodeHtml(oMessage.Subject)),
      sForwardBody = '<br /><br />' + this.getSignatureText(oCurrentAccount, oFetcherOrIdentity, true) + '<br /><br />' + 
        '<div data-anchor="reply-title">' + sForwardTitle + '</div><br /><br />' + messageUtils.getConvertedHtml(oMessage)

    return sForwardBody
  },

  /**
   * @param {Object} oMessage
   * @param {string} sReplyType
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @param {boolean} bPasteSignatureAnchor
   * @param {string} sText
   * @param {string} sDraftUid
   * @return {Object}
   */
  getReplyDataFromMessage: function (oMessage, sReplyType, oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor, sText, sDraftUid) {
    let
      oReplyData = {
        aDraftInfo: [],
        sDraftUid: '',
        sToAddr: '',
        sCcAddr: '',
        sBccAddr: '',
        sSubject: '',
        sText: '',
        aAttachments: [],
        sInReplyTo: oMessage.MessageId,
        sReferences: this.getReplyReferences(oMessage),
      },
      aAttachments = [],
      sToAddr = messageUtils.getFullAddress(oMessage.ReplyTo),
      sTo = messageUtils.getFullAddress(oMessage.To)

    if (sToAddr === '' || messageUtils.getFirstAddressEmail(oMessage.From) === messageUtils.getFirstAddressEmail(oMessage.ReplyTo) && messageUtils.getFirstAddressName(oMessage.ReplyTo) === '') {
      sToAddr = messageUtils.getFullAddress(oMessage.From)
    }

    // if (!sText || sText === '') {
    //   sText = this.sReplyText
    //   this.sReplyText = ''
    // }

    if (sReplyType === mailEnums.ReplyType.Forward) {
      oReplyData.sText = sText + this.getForwardMessageBody(oMessage, oCurrentAccount, oFetcherOrIdentity)
    } else if (sReplyType === mailEnums.ReplyType.Resend) {
      oReplyData.sText = messageUtils.getConvertedHtml(oMessage)
      oReplyData.sCcAddr = oMessage.Cc
      oReplyData.sBccAddr = oMessage.Bcc
    } else {
      oReplyData.sText = sText + this.getReplyMessageBody(oMessage, oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor)
    }

    if (sDraftUid) {
      oReplyData.sDraftUid = sDraftUid
    // } else {
    //   oReplyData.sDraftUid = this.sReplyDraftUid
    //   this.sReplyDraftUid = ''
    }

    switch (sReplyType) {
      case mailEnums.ReplyType.Reply:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.Reply, oMessage.Uid, oMessage.Folder]
        oReplyData.sToAddr = sToAddr
        oReplyData.sSubject = this.getReplySubject(oMessage.Subject, true)
        aAttachments = _.filter(oMessage.Attachments, function (oAttach) {
          return oAttach.IsLinked
        })
        break
      case mailEnums.ReplyType.ReplyAll:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.ReplyAll, oMessage.Uid, oMessage.Folder]
        oReplyData.sToAddr = sToAddr
        oReplyData.sCcAddr = _getReplyAllCcAddr(oMessage, oCurrentAccount, oFetcherOrIdentity)
        oReplyData.sSubject = this.getReplySubject(oMessage.Subject, true)
        aAttachments = _.filter(oMessage.Attachments, function (oAttach) {
          return oAttach.IsLinked
        })
        break
      case mailEnums.ReplyType.Resend:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.Resend, oMessage.Uid, oMessage.Folder, oMessage.Cc, oMessage.Bcc]
        oReplyData.sToAddr = sTo
        oReplyData.sSubject = oMessage.Subject
        aAttachments = oMessage.Attachments
        break
      case mailEnums.ReplyType.ForwardAsAttach:
      case mailEnums.ReplyType.Forward:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.Forward, oMessage.Uid, oMessage.Folder]
        oReplyData.sSubject = this.getReplySubject(oMessage.Subject, false)
        aAttachments = oMessage.Attachments
        break
    }

    _.each(aAttachments, function (oAttachment) {
      if (oAttachment && oAttachment.getCopy) {
        oReplyData.aAttachments.push(oAttachment.getCopy())
      }
    })

    return oReplyData
  },

  /**
   * Prepares and returns references for reply message.
   * @param {Object} oMessage
   * @return {string}
   */
  getReplyReferences: function (oMessage) {
    let
      sRef = oMessage.References,
      sInR = oMessage.MessageId,
      iPos = sRef.indexOf(sInR)

    if (iPos === -1) {
      sRef += ' ' + sInR
    }

    return sRef
  },
}
