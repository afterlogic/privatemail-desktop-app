import _ from 'lodash'

import store from 'src/store'

import addressUtils from 'src/utils/address.js'
import dateUtils from 'src/utils/date.js'
import notification from 'src/utils/notification.js'
import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'
import webApi from 'src/utils/webApi.js'

import mailEnums from 'src/modules/mail/enums.js'
import messageUtils from 'src/modules/mail/utils/message.js'

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
function _getReplyAllCcContacts(oMessage, oCurrentAccount, oFetcherOrIdentity) {
  let
    aToContacts = messageUtils.getContactsToSend(oMessage.To),
    aCcContacts = messageUtils.getContactsToSend(oMessage.Cc),
    aBccContacts = messageUtils.getContactsToSend(oMessage.Bcc),
    aAllContacts = _.filter(_.union(aToContacts, aCcContacts, aBccContacts), function (oAddress) {
      return oCurrentAccount.sEmail !== oAddress.email && (!oFetcherOrIdentity || oFetcherOrIdentity.Email !== oAddress.email)
    })
  return aAllContacts
}

export default {
  sendMessage: function ({oCurrentAccount, oCurrentFolderList, iIdentityId, iAliasId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, bPlainText, sDraftUid, aDraftInfo, sInReplyTo, sReferences, aAttachments, iImportance, bReadingConfirmation, sConfirmFolder, iConfirmUid}, fCallback) {
    if (this.verifyDataForSending(sToAddr, sCcAddr, sBccAddr)) {
      let
        oParameters = this.getSendSaveParameters({oCurrentFolderList, iIdentityId, iAliasId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, bPlainText, sDraftUid, aDraftInfo, sInReplyTo, sReferences, aAttachments, iImportance, bReadingConfirmation, sConfirmFolder, iConfirmUid}),
        sSentFolder = oCurrentFolderList.Sent ? oCurrentFolderList.Sent.FullName : '',
        sDraftFolder = oCurrentFolderList.Drafts ? oCurrentFolderList.Drafts.FullName : '',
        sCurrEmail = oCurrentAccount.sEmail,
        bSelfRecipient = (oParameters.To.indexOf(sCurrEmail) > -1 || oParameters.Cc.indexOf(sCurrEmail) > -1 ||
          oParameters.Bcc.indexOf(sCurrEmail) > -1),
        sLoadingMessage = 'Sending...' // textUtils.i18n('COREWEBCLIENT/INFO_SENDING')

      if (oCurrentAccount.bSaveRepliesToCurrFolder && !bSelfRecipient && typesUtils.isNonEmptyArray(oParameters.DraftInfo, 3)) {
        sSentFolder = oParameters.DraftInfo[2]
      }

      if (!typesUtils.isNonEmptyString(sConfirmFolder) || !_.isFinite(iConfirmUid)) {
        oParameters.SentFolder = sSentFolder
      }
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

      oParameters.Text = oParameters.Text.split('<div data-anchor="signature">').join('<div>')
      oParameters.Text = oParameters.Text.split('<!--signature end--></div>').join('</div>')

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

  saveMessage: function ({oCurrentFolderList, iIdentityId, iAliasId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, bPlainText, sDraftUid, aDraftInfo, sInReplyTo, sReferences, aAttachments, iImportance, bReadingConfirmation, sConfirmFolder, iConfirmUid}, fCallback) {
    let
      oParameters = this.getSendSaveParameters({oCurrentFolderList, iIdentityId, iAliasId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, bPlainText, sDraftUid, aDraftInfo, sInReplyTo, sReferences, aAttachments, iImportance, bReadingConfirmation, sConfirmFolder, iConfirmUid}),
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
      aToIncorrect = typesUtils.isNonEmptyString(sCcAddr) ? addressUtils.getIncorrectEmailsFromAddressString(sToAddr) : [],
      aCcIncorrect = typesUtils.isNonEmptyString(sCcAddr) ? addressUtils.getIncorrectEmailsFromAddressString(sCcAddr) : [],
      aBccIncorrect = typesUtils.isNonEmptyString(sCcAddr) ? addressUtils.getIncorrectEmailsFromAddressString(sBccAddr) : [],
      aIncorrect = _.union(aToIncorrect, aCcIncorrect, aBccIncorrect),
      aEncodedIncorrect = _.map(aIncorrect, function (sIncorrect) {
        return textUtils.encodeHtml(sIncorrect)
      }),
      sWarning = 'Please specify correct emails. Incorrect emails: ' + aEncodedIncorrect.join(', ')

    if (aIncorrect.length > 0) {
      notification.showError(sWarning)
      return false
    }

    return true
  },

  convertAttachmentsForSending: function (aAttachments)
  {
    let oAttachments = {}

    _.each(aAttachments, function (oAttach) {
      oAttachments[oAttach.sTempName] = [
        oAttach.sFileName,
        oAttach.bLinked ? oAttach.sCid : '',
        oAttach.bInline ? '1' : '0',
        oAttach.bLinked ? '1' : '0',
        oAttach.sContentLocation
      ]
    })
    
    return oAttachments
  },

  getSendSaveParameters: function ({oCurrentFolderList, iIdentityId, iAliasId, sToAddr, sCcAddr, sBccAddr, sSubject, sText, sDraftUid, bPlainText, aDraftInfo, sInReplyTo, sReferences, aAttachments, iImportance, bReadingConfirmation, sConfirmFolder, iConfirmUid}) {
    let
      oAttachments = this.convertAttachmentsForSending(aAttachments),
      oParameters = null

    // _.each(this.oHtmlEditor.getUploadedImagesData(), function (oAttach) {
    //   oAttachments[oAttach.TempName] = [oAttach.Name, oAttach.CID, '1', '1']
    // })

    oParameters = {
      'AccountID': oCurrentFolderList.AccountId,
      'FetcherID': '',
      'IdentityID': iIdentityId,
      'AliasID': iAliasId,
      'DraftInfo': typesUtils.pArray(aDraftInfo),
      'DraftUid': typesUtils.pString(sDraftUid),
      'To': typesUtils.pString(sToAddr),
      'Cc': typesUtils.pString(sCcAddr),
      'Bcc': typesUtils.pString(sBccAddr),
      'Subject': typesUtils.pString(sSubject),
      'Text': typesUtils.pString(sText),
      'IsHtml': !typesUtils.pBool(bPlainText),
      'Importance': typesUtils.pInt(iImportance, 3),
      'SendReadingConfirmation': typesUtils.pBool(bReadingConfirmation, false),
      'Attachments': oAttachments,
      'InReplyTo': typesUtils.pString(sInReplyTo),
      'References': typesUtils.pString(sReferences),
    }

    if (typesUtils.isNonEmptyString(sConfirmFolder) && _.isFinite(iConfirmUid)) {
      oParameters.ConfirmFolder = sConfirmFolder
      oParameters.ConfirmUid = iConfirmUid
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

  getSignatureRegexp () {
    return /<div data-anchor=\"signature\">.*?<!--signature end--><\/div>/
  },

  getTagWrappedSignature (sSignature) {
    return '<div data-anchor="signature">' + sSignature + '<!--signature end--></div>'
  },

  /**
   * @param {string} sOrigText
   * @param {Object} oMessage
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @param {boolean} bPasteSignatureAnchor
   * @return {string}
   */
  getReplyMessageBody: function (sOrigText, oMessage, oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor)
  {
    let
      sReplyTitle = ('On %DATE% at %TIME%, %SENDER% wrote:')
        .replace('%DATE%', dateUtils.getDate(oMessage.TimeStampInUTC))
        .replace('%TIME%', dateUtils.getTime(oMessage.TimeStampInUTC))
        .replace('%SENDER%', textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.From))),
      sReplyBody = '<br /><br /><div data-anchor="reply-title">' + sReplyTitle + '</div><blockquote>' + sOrigText + '</blockquote>'

    return sReplyBody
  },

  /**
   * @param {string} sOrigText
   * @param {Object} oMessage
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @return {string}
   */
  getForwardMessageBody: function (sOrigText, oMessage, oCurrentAccount, oFetcherOrIdentity) {
    let
      sCcAddr = textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.Cc)),
      sCcPart = (sCcAddr !== '') ? ('CC: %CCADDR%<br />').replace('%CCADDR%', sCcAddr) : '',
      sForwardTitle = ('---- Original Message ----<br />From: %FROMADDR%<br />To: %TOADDR%<br />%CCPART%Sent: %FULLDATE%<br />Subject: %SUBJECT%<br />')
        .replace('%FROMADDR%', textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.From)))
        .replace('%TOADDR%', textUtils.encodeHtml(messageUtils.getFullAddress(oMessage.To)))
        .replace('%CCPART%', sCcPart)
        .replace('%FULLDATE%', dateUtils.getFullDate(oMessage.TimeStampInUTC))
        .replace('%SUBJECT%', textUtils.encodeHtml(oMessage.Subject)),
      sForwardBody = '<br /><br /><div data-anchor="reply-title">' + sForwardTitle + '</div><br /><br />' + sOrigText

    return sForwardBody
  },

  getIdentityForCompose: function (sFullEmailsFromServer) {
    let aFullEmails = typesUtils.isNonEmptyString(sFullEmailsFromServer) ? sFullEmailsFromServer.split('\n') : []
    let oCurrentAccount = store.getters['mail/getCurrentAccount']
    let aAliases = oCurrentAccount ? oCurrentAccount.aAliases : []
    let aIdentities = store.getters['mail/getCurrentIdentities']
    let aAllIdentities = aIdentities.concat(aAliases)

    let oCompleteMatch = null
    let oWithMatchingEmail = null
    _.each(aAllIdentities, function (oIdentity) {
      if (oCompleteMatch === null) {
        let oFoundAddress = _.find(aFullEmails, function (sFullEmail) {
          let oEmailParts = addressUtils.getEmailParts(sFullEmail)
          return oEmailParts.email.toLowerCase() === oIdentity.sEmail.toLowerCase() && oEmailParts.name.toLowerCase() === oIdentity.sFriendlyName.toLowerCase()
        })
        if (oFoundAddress) {
          oCompleteMatch = oIdentity
        }
      }
      if (oWithMatchingEmail === null) {
        let oFoundAddress = _.find(aFullEmails, function (sFullEmail) {
          let oEmailParts = addressUtils.getEmailParts(sFullEmail)
          return oEmailParts.email.toLowerCase() === oIdentity.sEmail.toLowerCase()
        })
        if (oFoundAddress) {
          oWithMatchingEmail = oIdentity
        }
      }
    })

    return  oCompleteMatch || oWithMatchingEmail
  },

  /**
   * @param {string} sOrigText
   * @param {Object} oMessage
   * @param {string} sReplyType
   * @param {Object} oCurrentAccount
   * @param {Object} oFetcherOrIdentity
   * @param {boolean} bPasteSignatureAnchor
   * @param {string} sReplyText
   * @param {string} sDraftUid
   * @return {Object}
   */
  getReplyDataFromMessage: function (sOrigText, oMessage, sReplyType, oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor, sReplyText, sDraftUid) {
    let
      oReplyData = {
        aDraftInfo: [],
        sDraftUid: '',
        aToContacts: [],
        aCcContacts: [],
        aBccContacts: [],
        sSubject: '',
        sText: '',
        aAttachments: [],
        sInReplyTo: oMessage.MessageId,
        sReferences: this.getReplyReferences(oMessage),
      },
      oReplyTo = oMessage.From

    if (typesUtils.isNonEmptyString(oMessage.ReplyTo)) {
      oReplyTo = oMessage.ReplyTo
    }

    // if (!sReplyText || sReplyText === '') {
    //   sReplyText = this.sReplyText
    //   this.sReplyText = ''
    // }

    if (sReplyType === mailEnums.ReplyType.Forward) {
      oReplyData.sText = sReplyText + this.getForwardMessageBody(sOrigText, oMessage, oCurrentAccount, oFetcherOrIdentity)
    } else if (sReplyType === mailEnums.ReplyType.Resend) {
      oReplyData.oIdentity = this.getIdentityForCompose(oMessage.From)
      oReplyData.sText = sOrigText
      oReplyData.aCcContacts = messageUtils.getContactsToSend(oMessage.Cc)
      oReplyData.aBccContacts = messageUtils.getContactsToSend(oMessage.Bcc)
    } else {
      let sAddresses = oMessage.To
      if (typesUtils.isNonEmptyString(sAddresses)) {
        if (typesUtils.isNonEmptyString(oMessage.Cc)) {
          sAddresses += '\n' + oMessage.Cc
        }
      } else {
        sAddresses = oMessage.Cc
      }
      oReplyData.oIdentity = this.getIdentityForCompose(sAddresses)

      oReplyData.sText = sReplyText + this.getReplyMessageBody(sOrigText, oMessage, oCurrentAccount, oFetcherOrIdentity, bPasteSignatureAnchor)
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
        oReplyData.aToContacts = messageUtils.getContactsToSend(oReplyTo)
        oReplyData.sSubject = this.getReplySubject(oMessage.Subject, true)
        if (oMessage.Attachments && _.isArray(oMessage.Attachments['@Collection'])) {
          oReplyData.aAttachments = _.filter(oMessage.Attachments['@Collection'], function (oAttachData) {
            return oAttachData.IsLinked
          })
        }
        break
      case mailEnums.ReplyType.ReplyAll:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.ReplyAll, oMessage.Uid, oMessage.Folder]
        oReplyData.aToContacts = messageUtils.getContactsToSend(oReplyTo)
        oReplyData.aCcContacts = _getReplyAllCcContacts(oMessage, oCurrentAccount, oFetcherOrIdentity)
        oReplyData.sSubject = this.getReplySubject(oMessage.Subject, true)
        if (oMessage.Attachments && _.isArray(oMessage.Attachments['@Collection'])) {
          oReplyData.aAttachments = _.filter(oMessage.Attachments['@Collection'], function (oAttachData) {
            return oAttachData.IsLinked
          })
        }
        break
      case mailEnums.ReplyType.Resend:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.Resend, oMessage.Uid, oMessage.Folder, oMessage.Cc, oMessage.Bcc]
        oReplyData.aToContacts = messageUtils.getContactsToSend(oMessage.To)
        oReplyData.sSubject = oMessage.Subject
        if (oMessage.Attachments && _.isArray(oMessage.Attachments['@Collection'])) {
          oReplyData.aAttachments = oMessage.Attachments['@Collection']
        }
        break
      case mailEnums.ReplyType.ForwardAsAttach:
      case mailEnums.ReplyType.Forward:
        oReplyData.aDraftInfo = [mailEnums.ReplyType.Forward, oMessage.Uid, oMessage.Folder]
        oReplyData.sSubject = this.getReplySubject(oMessage.Subject, false)
        if (oMessage.Attachments && _.isArray(oMessage.Attachments['@Collection'])) {
          oReplyData.aAttachments = oMessage.Attachments['@Collection']
        }
        break
    }

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
