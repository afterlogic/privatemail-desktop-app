import typesUtils from '../../../utils/types'

function CGroup(data) {
  this.EntityId = 0
  this.UUID = ''
  this.Name = ''
  this.IsOrganization = false
  this.Email = ''
  this.Company = ''
  this.Country = ''
  this.Street = ''
  this.City = ''
  this.State = ''
  this.Zip = ''
  this.Country = ''
  this.Phone = ''
  this.Fax = ''
  this.Web = ''
  this['DavContacts::UID'] = ''

  this.parse(data)
}

CGroup.prototype.parse = function (data) {
  this.EntityId = typesUtils.pInt(data.EntityId)
  this.UUID = typesUtils.pString(data.UUID)
  this.Name = typesUtils.pString(data.Name)
  this.IsOrganization = typesUtils.pBool(data.IsOrganization)
  this.Email = typesUtils.pString(data.Email)
  this.Company = typesUtils.pString(data.Company)
  this.Country = typesUtils.pString(data.Country)
  this.Street = typesUtils.pString(data.Street)
  this.City = typesUtils.pString(data.City)
  this.State = typesUtils.pString(data.State)
  this.Zip = typesUtils.pString(data.Zip)
  this.Country = typesUtils.pString(data.Country)
  this.Phone = typesUtils.pString(data.Phone)
  this.Fax = typesUtils.pString(data.Fax)
  this.Web = typesUtils.pString(data.Web)
  this['DavContacts::UID'] = typesUtils.pString(data['DavContacts::UID'])
}

export default CGroup
