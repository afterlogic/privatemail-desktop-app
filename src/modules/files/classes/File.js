import date from '../../../utils/date'
import text from '../../../utils/text'
import _ from 'lodash'
import typesUtils from '../../../utils/types'

function File() {
  this.Size = 0
  this.File = null
  this.Hash = Math.random()
  this.Name = ''
  this.Type = ''
  this.LastModified = 0
  this.Owner = ''
  this.FullPath = ''
  this.Path = ''
  this.IsFolder = false
  this.DownloadUrl = ''
  this.EditUrl = ''
  this.Loading = false
  this.ViewUrl = ''
  this.OpenUrl = ''
  this.ParanoidKey = ''
  this.InitializationVector = ''
  this.Content = ''
  this.Downloading = false
  this.PercentDownloading = 0
}

File.prototype.parseUploaderFile = function (file) {
  this.Size = typesUtils.pInt(file.size)
  this.File = file
  this.Hash = Math.random()
  this.Name = typesUtils.pString(file.name, '')
  this.LastModified = typesUtils.pInt((new Date()).getTime() / 1000)
  this.Loading = true
}

File.prototype.parseDataFromServer = function (file) {
  this.Loading = false
  this.Content = typesUtils.pString(file.Content, '')
  this.Size = typesUtils.pInt(file.Size)
  this.File = file
  this.Hash = typesUtils.pString(file.Hash, '')
  this.Name = typesUtils.pString(file.Name, '')
  this.Type = typesUtils.pString(file.Type, '')
  this.LastModified = typesUtils.pInt(file.LastModified)
  this.Owner = typesUtils.pString(file.Owner, '')
  this.FullPath = typesUtils.pString(file.FullPath, '')
  this.Path = typesUtils.pString(file.Path, '')
  this.IsFolder = typesUtils.pBool(file.IsFolder)
  this.Shares = []
  this.PublicLink = ''
  this.Shares = typesUtils.pArray(file?.ExtendedProps?.Shares)
  this.PublicLink = typesUtils.pArray(file?.ExtendedProps?.PublicLink)
  this.DownloadUrl = typesUtils.pString(file?.Actions?.download?.url, '')
  this.EditUrl = typesUtils.pString(file?.Actions?.edit?.url, '')
  this.ViewUrl = typesUtils.pString(file?.Actions?.view?.url, '')
  this.OpenUrl = typesUtils.pString(file?.Actions?.open?.url, '')
  this.ParanoidKey = typesUtils.pString(file?.ExtendedProps?.ParanoidKey, '')
  this.InitializationVector = typesUtils.pString(file?.ExtendedProps?.InitializationVector, '')
}

File.prototype.getDescription = function (owner) {
  if (this.Owner) {
    return 'Added by ' + this.Owner + ' on ' + date.getShortDate(this.LastModified)
  }
  return 'Added by ' + owner + ' on ' + date.getShortDate(this.LastModified)
}
File.prototype.hasDownloadAction = function () {
  return this.DownloadUrl
}
File.prototype.getShortName = function () {
  if (this.Name.length > 12) {
    return this.Name.substr(0, 10) + '...'
  }
  return this.Name
}
File.prototype.getFileSize = function () {
  return text.getFriendlySize(this.Size)
}
File.prototype.isShared = function () {
  const shares = this.File?.ExtendedProps?.Shares
  return _.isArray(shares) && shares.length
}
File.prototype.isEncrypted = function () {
  return this.ParanoidKey && this.InitializationVector
}
File.prototype.hasLink = function () {
  return this.File?.ExtendedProps?.PublicLink
}
File.prototype.hasOpenAction = function () {
  return this.OpenUrl
}
File.prototype.ChangeName = function (name) {
  this.Name = name
}
File.prototype.changeDownloadingStatus = function (status) {
  this.Downloading = status
}
File.prototype.changePercentLoading = function (percentLoading) {
  this.PercentDownloading = percentLoading
}
export default File
