import _ from 'lodash'
import typesUtils from '../../../utils/types'

function Folder() {
  this.File = null
  this.Hash = Math.random()
  this.Name = ''
  this.Type = ''
  this.LastModified = 0
  this.FullPath = ''
  this.Path = ''
  this.IsFolder = false
  this.Shares = []
  this.PublicLink = ''
  this.Deleted = false
}
Folder.prototype.parseDataFromServer = function (folder) {
  this.File = folder
  this.Hash = typesUtils.pString(folder.Hash, '')
  this.Name = typesUtils.pString(folder.Name, '')
  this.Type = typesUtils.pString(folder.Type, '')
  this.LastModified = typesUtils.pInt(folder.LastModified)
  this.FullPath = typesUtils.pString(folder.FullPath, '')
  this.Path = typesUtils.pString(folder.Path, '')
  this.IsFolder = typesUtils.pBool(folder.IsFolder)
  this.Shares = typesUtils.pArray(folder?.ExtendedProps?.Shares)
  this.PublicLink = typesUtils.pArray(folder?.ExtendedProps?.PublicLink)
}
Folder.prototype.getShortName = function () {
  if (this.Name.length > 36) {
    return this.Name.substr(0, 36)
  }
  return this.Name
}
Folder.prototype.isShared = function () {
  const shares = this.File?.ExtendedProps?.Shares
  return _.isArray(shares) && shares.length
}
Folder.prototype.hasLink = function () {
  return this.File?.ExtendedProps?.PublicLink
}
Folder.prototype.ChangeName = function (name) {
  this.Name = name
}
Folder.prototype.isEncrypted = function () {
  return false
}
Folder.prototype.changeDeleteStatus = function (status) {
  this.Deleted = status
}
export default Folder
