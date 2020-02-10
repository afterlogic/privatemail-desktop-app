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

  getFullAddress: function (oAddressesFromServer) {
    let aCollection = oAddressesFromServer && _.isArray(oAddressesFromServer['@Collection']) ? oAddressesFromServer['@Collection'] : []

    let aAddresses = _.map(aCollection, function (oAddress) {
      return addressUtils.getFullEmail(oAddress.DisplayName, oAddress.Email)
    })

    return aAddresses.join(', ')
  },

  getFirstAddressEmail: function (oAddressesFromServer) {
    let aCollection = oAddressesFromServer && _.isArray(oAddressesFromServer['@Collection']) ? oAddressesFromServer['@Collection'] : []

    if (aCollection.length > 0) {
      return aCollection[0].Email
    }

    return ''
  },

  getFirstAddressName: function (oAddressesFromServer) {
    let aCollection = oAddressesFromServer && _.isArray(oAddressesFromServer['@Collection']) ? oAddressesFromServer['@Collection'] : []

    if (aCollection.length > 0) {
      return aCollection[0].DisplayName
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
  }
}
