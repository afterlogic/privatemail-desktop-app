import store from 'src/store'

import _ from 'lodash'

import addressUtils from 'src/utils/address.js'
import typesUtils from 'src/utils/types.js'

export default {
  /**
   * Joins "Re" and "Fwd" prefixes in the message subject.
   * @param {string} sSubject The message subject.
   * @param {string} sRePrefix "Re" prefix translated into the language of the application.
   * @param {string} sFwdPrefix "Fwd" prefix translated into the language of the application.
   */
  joinReplyPrefixesInSubject: function (sSubject, sRePrefix, sFwdPrefix) {
    let
      aRePrefixes = [sRePrefix.toUpperCase()],
      aFwdPrefixes = [sFwdPrefix.toUpperCase()],
      sPrefixes = _.union(aRePrefixes, aFwdPrefixes).join('|'),
      sReSubject = '',
      aParts = sSubject.split(':'),
      aResParts = [],
      sSubjectEnd = ''

    _.each(aParts, function (sPart) {
      if (sSubjectEnd.length === 0) {
        let
          sPartUpper = _.trim(sPart.toUpperCase()),
          bRe = _.indexOf(aRePrefixes, sPartUpper) !== -1,
          bFwd = _.indexOf(aFwdPrefixes, sPartUpper) !== -1,
          iCount = 1,
          oLastResPart = (aResParts.length > 0) ? aResParts[aResParts.length - 1] : null

        if (!bRe && !bFwd) {
          let oMatch = (new window.RegExp('^\\s?(' + sPrefixes + ')\\s?[\\[\\(]([\\d]+)[\\]\\)]$', 'gi')).exec(sPartUpper)
          if (oMatch && oMatch.length === 3) {
            bRe = _.indexOf(aRePrefixes, oMatch[1].toUpperCase()) !== -1
            bFwd = _.indexOf(aFwdPrefixes, oMatch[1].toUpperCase()) !== -1
            iCount = typesUtils.pInt(oMatch[2])
          }
        }

        if (bRe) {
          if (oLastResPart && oLastResPart.prefix === sRePrefix) {
            oLastResPart.count += iCount
          } else {
            aResParts.push({prefix: sRePrefix, count: iCount})
          }
        } else if (bFwd) {
          if (oLastResPart && oLastResPart.prefix === sFwdPrefix) {
            oLastResPart.count += iCount
          } else {
            aResParts.push({prefix: sFwdPrefix, count: iCount})
          }
        } else {
          sSubjectEnd = sPart
        }
      } else {
        sSubjectEnd += ':' + sPart
      }
    })

    _.each(aResParts, function (sResPart) {
      if (sResPart.count === 1) {
        sReSubject += sResPart.prefix + ': '
      } else {
        sReSubject += sResPart.prefix + '[' + sResPart.count + ']: '
      }
    })
    sReSubject += _.trim(sSubjectEnd)
    
    return sReSubject
  },

  getContactsToSend: function (sFullEmailsFromServer) {
    let aFullEmails = typesUtils.isNonEmptyString(sFullEmailsFromServer) ? sFullEmailsFromServer.split('\n') : []

    let aContacts = _.map(aFullEmails, function (sFullEmail) {
      let oContactData = addressUtils.getEmailParts(sFullEmail)
      oContactData.id = 'rand_' + Math.round(Math.random() * 10000)
      let oContacts = store.getters['contacts/getContactsByEmail']
      let oContact = oContacts[oContactData.email]
      if (oContact) {
        oContactData.hasPgpKey = !!oContact.PublicPgpKey
        oContactData.pgpEncrypt = oContact.PgpEncryptMessages
        oContactData.pgpSign = oContact.PgpSignMessages
      }
      return oContactData
    })

    return aContacts
  },

  getFullAddress: function (sFullEmailsFromServer) {
    return typesUtils.isNonEmptyString(sFullEmailsFromServer) ? sFullEmailsFromServer.split('\n') : []
  },

  getFirstAddressEmail: function (sFullEmailsFromServer) {
    let aFullEmails = typesUtils.isNonEmptyString(sFullEmailsFromServer) ? sFullEmailsFromServer.split('\n') : []

    if (aFullEmails.length > 0) {
      let oEmailParts = addressUtils.getEmailParts(aFullEmails[0])
      return oEmailParts.email
    }

    return ''
  },

  getFirstAddressName: function (sFullEmailsFromServer) {
    let aFullEmails = typesUtils.isNonEmptyString(sFullEmailsFromServer) ? sFullEmailsFromServer.split('\n') : []

    if (aFullEmails.length > 0) {
      let oEmailParts = addressUtils.getEmailParts(aFullEmails[0])
      return oEmailParts.name
    }

    return ''
  },

  prepareInlinePictures: function (sHtml, aAttachments, aFoundCids, sAppPath) {
    let
      fFindAttachmentByCid = function (sCid) {
        return _.find(aAttachments, function (oAttachment) {
          return oAttachment.sCid === sCid
        })
      },
      sResHtml = sHtml

    if (typeof sAppPath !== 'string') {
      sAppPath = ''
    }

    if (aFoundCids.length > 0) {
      _.each(aFoundCids, function (sFoundCid) {
        let oAttachment = fFindAttachmentByCid(sFoundCid)
        if (oAttachment && typesUtils.isNonEmptyString(oAttachment.sViewLink)) {
          sResHtml = sResHtml.replace(new RegExp('data-x-src-cid="' + sFoundCid + '"', 'g'), 'data-x-src-cid="' + sFoundCid + '" src="' + sAppPath + oAttachment.sViewLink + '"')
        }
      })
    }

    return sResHtml
  },

  getTextWithExternalPictures (sText) {
    sText = typesUtils.pString(sText)
    return sText.replace(/\s+data-x-src="/g, ' src="').replace(/\s+data-x-style-url="/g, ' style="')
  },
}
