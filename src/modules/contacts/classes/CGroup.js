import typesUtils from '../../../utils/types'

function CGroup(data) {
  this['@Object'] = 'Object/Aurora\\Modules\\Contacts\\Classes\\Group'
  this.EntityId = null
  this.UUID = ''
  this.ParentUUID = ''
  this.ModuleName = ''
  this.IdUser = null
  this.Name = null
  this.IsOrganization = ''
  this.Email = ''
  this.Company = null
  this.Street = null
  this.City = null
  this.State = null
  this.Zip = ''
  this.Country = ''
  this.Phone = ''
  this.Fax = ''
  this.Web = ''
  this['DavContacts::UID'] = ''

  this.parse(data)
}

CGroup.prototype.parse = function (data) {
  this['@Object'] = typesUtils.pString(data['@Object'])
  this.EntityId = typesUtils.pInt(data.EntityId)
  this.UUID = typesUtils.pString(data.UUID)
  this.ParentUUID = typesUtils.pString(data.ParentUUID)
  this.ModuleName = typesUtils.pString(data.ModuleName)
  this.IdUser = typesUtils.pInt(data.IdUser)
  this.Name = typesUtils.pString(data.Name)
  this.IsOrganization = typesUtils.pBool(data.IsOrganization)
  this.Email = typesUtils.pString(data.Email)
  this.Company = typesUtils.pString(data.Company)
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
