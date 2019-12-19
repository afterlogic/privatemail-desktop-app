import store from 'src/store'
import _ from 'lodash'

import webApi from 'src/utils/webApi.js'

import CContact from 'src/modules/contacts/classes/CContact.js'

/**
 * @constructor
 */
function CContactsCache() {
  this.oContacts = {}
  this.aRequestedEmails = []
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
 */
CContactsCache.prototype.getContactsByEmails = function (aEmails) {
  let aEmailsForRequest = []

  _.each(aEmails, (sEmail) => {
    let oContact = store.state.contacts.contactsByEmail[sEmail]
    if (oContact === undefined && _.indexOf(this.aRequestedEmails, sEmail) === -1) {
      aEmailsForRequest.push(sEmail)
    }
  })

  if (aEmailsForRequest.length > 0) {
    this.aRequestedEmails = _.union(this.aRequestedEmails, aEmailsForRequest)
    let oParameters = {
      'Storage': 'all',
      'Emails': aEmailsForRequest,
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
  let aEmails = oParameters.Emails

  if (aResult) {
    _.each(aResult, _.bind(function (oContactData) {
      let oContact = new CContact(oContactData)
      if (oContact) {
        store.commit('contacts/addContactByEmail', { sEmail: oContact.ViewEmail, mContact: oContact })
      }
    }, this))
  }

  _.each(aEmails, _.bind(function (sEmail) {
    if (!store.state.contacts.contactsByEmail[sEmail]) {
      store.commit('contacts/addContactByEmail', { sEmail, mContact: false })
    }
  }, this))

  this.aRequestedEmails = _.difference(this.aRequestedEmails, aEmails)
}

export default new CContactsCache()
