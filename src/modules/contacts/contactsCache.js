import _ from 'lodash'

import webApi from 'src/utils/webApi.js'

import CContact from 'src/modules/contacts/classes/CContact.js'

/**
 * @constructor
 */
function CContactsCache() {
  this.oContacts = {}
  this.oResponseHandlers = {}
  this.aRequestedEmails = []

  // this.aVcardAttachments = []

  // this.oNewContactParams = null
}

/**
 * Clears contacts cache.
 */
CContactsCache.prototype.clearCache = function () {
  this.oContacts = {}
}

/**
 * Looks for contacts in the cache and returns them by the specified handler.
 * If some of contacts are not found in the cache, requests them from the server by specified emails.
 * 
 * @param {Array} aEmails List of emails.
 * @param {Function} fResponseHandler Function to call when the server response.
 */
CContactsCache.prototype.getContactsByEmails = function (aEmails, fResponseHandler) {
  let
    aContacts = [],
    aEmailsForRequest = [],
    sHandlerId = Math.random().toString()

  _.each(aEmails, (sEmail) => {
    let oContact = this.oContacts[sEmail]
    if (oContact !== undefined) {
      aContacts[sEmail] = oContact
    } else if (_.indexOf(this.aRequestedEmails, sEmail) === -1) {
      aEmailsForRequest.push(sEmail)
    }
  })

  if (_.isFunction(fResponseHandler)) {
    fResponseHandler(aContacts)
  }

  if (aEmailsForRequest.length > 0) {
    this.oResponseHandlers[sHandlerId] = fResponseHandler

    this.aRequestedEmails = _.union(this.aRequestedEmails, aEmailsForRequest)

    let oParameters = {
      'Storage': 'all',
      'Emails': aEmailsForRequest,
      'HandlerId': sHandlerId
    }
    webApi.sendRequest({
      sModule: 'Contacts',
      sMethod: 'GetContactsByEmails',
      oParameters,
      fCallback: (aResult, oError) => {
        this.onGetContactsByEmailsResponse(oParameters, aResult, oError)
      },
    })
  }
}

/**
 * Receives data from the server, parses them and passes on.
 * 
 * @param {Object} oResponse Data obtained from the server.
 * @param {Object} oRequest Data has been transferred to the server.
 */
CContactsCache.prototype.onGetContactsByEmailsResponse = function (oParameters, aResult, oError) {
  let
    fResponseHandler = this.oResponseHandlers[oParameters.HandlerId],
    aEmails = oParameters.Emails,
    aContacts = {}

  if (aResult) {
    _.each(aResult, _.bind(function (oContactData) {
      let oContact = new CContact(oContactData)
      if (oContact) {
        this.oContacts[oContact.ViewEmail] = oContact
      }
    }, this))
  }

  this.aRequestedEmails = _.difference(this.aRequestedEmails, aEmails)

  _.each(aEmails, _.bind(function (sEmail) {
    if (!this.oContacts[sEmail]) {
      this.oContacts[sEmail] = null
    }
    aContacts[sEmail] = this.oContacts[sEmail]
  }, this))

  if (_.isFunction(fResponseHandler)) {
    fResponseHandler(aContacts)
  }

  delete this.oResponseHandlers[oParameters.HandlerId]
}

// /**
//  * @param {Object} oVcard
//  */
// CContactsCache.prototype.addVcard = function (oVcard) {
//   this.aVcardAttachments.push(oVcard)
// }

// /**
//  * @param {string} sFile
//  */
// CContactsCache.prototype.getVcard = function (sFile) {
//   return _.find(this.aVcardAttachments, function (oVcard) {
//     return oVcard.file() === sFile
//   })
// }

// /**
//  * @param {string} sFile
//  */
// CContactsCache.prototype.markVcardsExistentByFile = function (sFile) {
//   _.each(this.aVcardAttachments, function (oVcard) {
//     if (oVcard.file() === sFile) {
//       oVcard.exists(true)
//     }
//   })
// }

// /**
//  * @param {Array} aUids
//  */
// CContactsCache.prototype.markVcardsNonexistentByUid = function (aUids) {
//   _.each(this.aVcardAttachments, function (oVcard) {
//     if (-1 !== _.indexOf(aUids, oVcard.uid())) {
//       oVcard.exists(false)
//     }
//   })
// }

// /**
//  * @param {Object} oNewContactParams
//  */
// CContactsCache.prototype.saveNewContactParams = function (oNewContactParams) {
//   this.oNewContactParams = oNewContactParams
// }

// /**
//  * @returns {Object}
//  */
// CContactsCache.prototype.getNewContactParams = function () {
//   let oNewContactParams = this.oNewContactParams
//   this.oNewContactParams = null
//   return oNewContactParams
// }

export default new CContactsCache()
