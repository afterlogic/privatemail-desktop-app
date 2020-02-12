import addressUtils from 'src/utils/address.js'
import typesUtils from 'src/utils/types'

import contactsEnums from 'src/modules/contacts/enums.js'

function CContact(data) {
  this.EntityId = null
  this.UUID = ''
  this.Storage = ''
  this.FullName = ''
  this.PrimaryEmail = contactsEnums.PrimaryEmail.Personal
  this.PrimaryPhone = contactsEnums.PrimaryPhone.Personal
  this.PrimaryAddress = contactsEnums.PrimaryAddress.Personal
  this.ViewEmail = ''
  this.Title = ''
  this.FirstName = ''
  this.LastName = ''
  this.NickName = ''
  this.Skype = ''
  this.Facebook = ''
  this.PersonalEmail = ''
  this.PersonalAddress = ''
  this.PersonalCity = ''
  this.PersonalState = ''
  this.PersonalZip = ''
  this.PersonalCountry = ''
  this.PersonalWeb = ''
  this.PersonalFax = ''
  this.PersonalPhone = ''
  this.PersonalMobile = ''
  this.BusinessEmail = ''
  this.BusinessCompany = ''
  this.BusinessAddress = ''
  this.BusinessCity = ''
  this.BusinessState = ''
  this.BusinessZip = ''
  this.BusinessCountry = ''
  this.BusinessJobTitle = ''
  this.BusinessDepartment = ''
  this.BusinessOffice = ''
  this.BusinessPhone = ''
  this.BusinessFax = ''
  this.BusinessWeb = ''
  this.OtherEmail = ''
  this.Notes = ''
  this.BirthDay = null
  this.BirthMonth = null
  this.BirthYear = null
  this.ETag = ''
  this.Auto = false
  this.Frequency = null
  this.DateModified = ''
  this['DavContacts::UID'] = ''
  this['DavContacts::VCardUID'] = ''
  this.GroupUUIDs = []

  this.parse(data)
}

CContact.prototype.parse = function (data) {
  this.BusinessFax = typesUtils.pString(data.BusinessFax)
  this.EntityId = typesUtils.pInt(data.EntityId)
  this.UUID = typesUtils.pString(data.UUID)
  this.Storage = typesUtils.pString(data.Storage)
  this.FullName = typesUtils.pString(data.FullName)
  this.PrimaryEmail = typesUtils.pInt(data.PrimaryEmail)
  this.PrimaryPhone = typesUtils.pInt(data.PrimaryPhone)
  this.PrimaryAddress = typesUtils.pInt(data.PrimaryAddress)
  this.ViewEmail = typesUtils.pString(data.ViewEmail)
  this.Title = typesUtils.pString(data.Title)
  this.FirstName = typesUtils.pString(data.FirstName)
  this.LastName = typesUtils.pString(data.LastName)
  this.NickName = typesUtils.pString(data.NickName)
  this.Skype = typesUtils.pString(data.Skype)
  this.Facebook = typesUtils.pString(data.Facebook)
  this.PersonalEmail = typesUtils.pString(data.PersonalEmail)
  this.PersonalAddress = typesUtils.pString(data.PersonalAddress)
  this.PersonalCity = typesUtils.pString(data.PersonalCity)
  this.PersonalState = typesUtils.pString(data.PersonalState)
  this.PersonalZip = typesUtils.pString(data.PersonalZip)
  this.PersonalCountry = typesUtils.pString(data.PersonalCountry)
  this.PersonalWeb = typesUtils.pString(data.PersonalWeb)
  this.PersonalFax = typesUtils.pString(data.PersonalFax)
  this.PersonalPhone = typesUtils.pString(data.PersonalPhone)
  this.PersonalMobile = typesUtils.pString(data.PersonalMobile)
  this.BusinessEmail = typesUtils.pString(data.BusinessEmail)
  this.BusinessCompany = typesUtils.pString(data.BusinessCompany)
  this.BusinessAddress = typesUtils.pString(data.BusinessAddress)
  this.BusinessCity = typesUtils.pString(data.BusinessCity)
  this.BusinessState = typesUtils.pString(data.BusinessState)
  this.BusinessZip = typesUtils.pString(data.BusinessZip)
  this.BusinessCountry = typesUtils.pString(data.BusinessCountry)
  this.BusinessJobTitle = typesUtils.pString(data.BusinessJobTitle)
  this.BusinessDepartment = typesUtils.pString(data.BusinessDepartment)
  this.BusinessOffice = typesUtils.pString(data.BusinessOffice)
  this.BusinessPhone = typesUtils.pString(data.BusinessPhone)
  this.BusinessFax = typesUtils.pString(data.BusinessFax)
  this.BusinessWeb = typesUtils.pString(data.BusinessWeb)
  this.OtherEmail = typesUtils.pString(data.OtherEmail)
  this.Notes = typesUtils.pString(data.Notes)
  this.BirthDay = typesUtils.pInt(data.BirthDay)
  this.BirthMonth = typesUtils.pInt(data.BirthMonth)
  this.BirthYear = typesUtils.pInt(data.BirthYear)
  this.ETag = typesUtils.pString(data.ETag)
  this.Auto = typesUtils.pBool(data.Auto)
  this.Frequency = typesUtils.pInt(data.Frequency)
  this.DateModified = typesUtils.pString(data.DateModified)
  this['DavContacts::UID'] = typesUtils.pString(data['DavContacts::UID'])
  this['DavContacts::VCardUID'] = typesUtils.pString(data['DavContacts::VCardUID'])
  this.GroupUUIDs = typesUtils.isNonEmptyArray(data.GroupUUIDs) ? data.GroupUUIDs : []
}

CContact.prototype.setViewEmail = function () {
  switch (this.PrimaryEmail) {
    case contactsEnums.PrimaryEmail.Personal:
      this.ViewEmail = this.PersonalEmail
      break
    case contactsEnums.PrimaryEmail.Business:
      this.ViewEmail = this.BusinessEmail
      break
    case contactsEnums.PrimaryEmail.Other:
      this.ViewEmail = this.OtherEmail
      break
  }
}

CContact.prototype.getFull = function () {
  let sFull = ''
  let sEmail = _.trim(this.ViewEmail)
  if (addressUtils.isCorrectEmail(sEmail)) {
    let sFullName = _.trim(this.FullName)
    if (typesUtils.isNonEmptyString(sFullName)) {
      sFull = '"' + sFullName + '" <' + sEmail + '>'
    } else {
      sFull = sEmail
    }
  }
  return sFull
}

export default CContact
