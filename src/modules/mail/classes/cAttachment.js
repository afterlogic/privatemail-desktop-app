import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'

let aViewMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif',
  'text/html', 'text/plain', 'text/css',
  'text/rfc822-headers', 'message/delivery-status',
  'application/x-httpd-php', 'application/javascript'
]
let bAllowPdf = false
if (bAllowPdf) {
  aViewMimeTypes.push('application/pdf')
  aViewMimeTypes.push('application/x-pdf')
}

let aViewExtensions = []

function _getFileExtension (sFile) {
  let sResult = ''
  let iIndex = sFile.lastIndexOf('.')

  if (iIndex > -1) {
    sResult = sFile.substr(iIndex + 1)
  }

  return sResult
}

function cAttachment () {
  this.bInline = false
  this.bLinked = false
  this.bUploadFailed = false
  this.iProgressPercent = 0
  this.iSize = 0
  this.oFile = null
  this.sCid = ''
  this.sContent = ''
  this.sContentLocation = ''
  this.sDownloadLink = ''
  this.sExtension = ''
  this.sFileName = ''
  this.sHash = Math.random()
  this.iMimePartIndex = 0
  this.sLocalPath = ''
  this.sTempName = ''
  this.sThumbnailLink = ''
  this.sType = ''
  this.sViewLink = ''
}

cAttachment.prototype.getFriendlySize = function () {
  return textUtils.getFriendlySize(this.iSize)
}

cAttachment.prototype.getProgressPercent = function () {
  if (this.oFile) {
    this.iProgressPercent = this.bUploadFailed ? 100 : Math.ceil(this.oFile.__progress * 100)
    return this.iProgressPercent
  }
  return this.iProgressPercent
}

cAttachment.prototype.getStatus = function () {
  let iProgressPercent = this.getProgressPercent()
  if (iProgressPercent === 100) {
    if (this.bUploadFailed) {
      return 'Failed'
    }
    return 'Complete'
  }
  if (iProgressPercent === 0 && this.oFile && this.oFile.__status === 'idle') {
    return 'Idle'
  }
  return 'Uploading'
}

cAttachment.prototype.parseUploaderFile = function (oFile, bLinked) {
  this.bInline = bLinked
  this.bLinked = bLinked
  this.iProgressPercent = 0
  this.iSize = typesUtils.pInt(oFile.size, this.iSize)
  if (bLinked) {
    this.sCid = typesUtils.pString('cid-' + Math.round(Math.random() * 1000000), this.sCid)
  }
  this.oFile = oFile
  this.sFileName = typesUtils.pString(oFile.name, this.sFileName)
  this.sLocalPath = typesUtils.pString(oFile.path, this.sLocalPath)
  this.sType = typesUtils.pString(oFile.type, this.sType)
}

cAttachment.prototype.parseDataFromServer = function (oAttach) {
  let sDownloadLink = typesUtils.pString(oAttach.Actions && oAttach.Actions.download && oAttach.Actions.download.url, this.sDownloadLink)
  let sThumbnailLink = typesUtils.pString(oAttach.ThumbnailUrl, this.sThumbnailUrl)
  let sViewLink = typesUtils.pString(oAttach.Actions && oAttach.Actions.view && oAttach.Actions.view.url, this.sViewLink)
  this.bInline = typesUtils.pBool(oAttach.IsInline, this.bInline)
  this.bLinked = typesUtils.pBool(oAttach.IsLinked, this.bLinked)
  this.iSize = typesUtils.pInt(oAttach.Size || oAttach.EstimatedSize, this.iSize)
  this.sCid = typesUtils.pString(oAttach.CID, this.sCid)
  this.sContent = typesUtils.pString(oAttach.Content, this.sContent)
  this.sContentLocation = typesUtils.pString(oAttach.ContentLocation, this.sContentLocation)
  this.sDownloadLink = sDownloadLink
  this.sExtension = _getFileExtension(this.sFileName)
  this.sFileName = typesUtils.pString(oAttach.FileName, this.sFileName)
  this.sHash = typesUtils.pString(oAttach.Hash, this.sHash)
  this.iMimePartIndex = typesUtils.pInt(oAttach.MimePartIndex, this.iMimePartIndex)
  this.sTempName = typesUtils.pString(oAttach.TempName, this.sTempName)
  this.sThumbnailLink = sThumbnailLink
  this.sType = typesUtils.pString(oAttach.MimeType, this.sType)
  let bViewSupported = (-1 !== _.indexOf(aViewMimeTypes, this.sType) || -1 !== _.indexOf(aViewExtensions, this.sExtension))
  if (bViewSupported) {
    this.sViewLink = sViewLink
  }
}

cAttachment.prototype.onUploadComplete = function () {
  this.bUploadFailed = false
  this.iProgressPercent = 100
}

cAttachment.prototype.onUploadFailed = function () {
  this.bUploadFailed = true
}

cAttachment.prototype.setTempName = function (sTempName) {
  this.sTempName = typesUtils.pString(sTempName, this.sTempName)
}

export default cAttachment
