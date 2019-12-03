import textUtils from 'src/utils/text.js'
import typesUtils from 'src/utils/types.js'

function CAttachment () {
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
  this.sFileName = ''
  this.sHash = ''
  this.iMimePartIndex = 0
  this.sLocalPath = ''
  this.sTempName = ''
  this.sThumbnailLink = ''
  this.sType = ''
  this.sViewLink = ''
}

CAttachment.prototype.getFriendlySize = function () {
  return textUtils.getFriendlySize(this.iSize)
}

CAttachment.prototype.getProgressPercent = function () {
  if (this.oFile) {
    this.iProgressPercent = Math.ceil(this.oFile.__progress * 100)
    return this.iProgressPercent
  }
  return this.iProgressPercent
}

CAttachment.prototype.getStatus = function () {
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

CAttachment.prototype.parseUploaderFile = function (oFile, bLinked) {
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

CAttachment.prototype.parseDataFromServer = function (oAttach, sApiHost) {
  let sDownloadLink = typesUtils.pString(oAttach.Actions && oAttach.Actions.download && oAttach.Actions.download.url, this.sDownloadLink)
  if (typesUtils.isNonEmptyString(sDownloadLink)) {
    sDownloadLink = sApiHost + '/' + sDownloadLink
  }
  let sThumbnailLink = typesUtils.pString(oAttach.ThumbnailUrl, this.sThumbnailUrl)
  if (typesUtils.isNonEmptyString(sThumbnailLink)) {
    sThumbnailLink = sApiHost + '/' + sThumbnailLink
  }
  let sViewLink = typesUtils.pString(oAttach.Actions && oAttach.Actions.view && oAttach.Actions.view.url, this.sViewLink)
  if (typesUtils.isNonEmptyString(sViewLink)) {
    sViewLink = sApiHost + '/' + sViewLink
  }
  this.bInline = typesUtils.pBool(oAttach.IsInline, this.bInline)
  this.bLinked = typesUtils.pBool(oAttach.IsLinked, this.bLinked)
  this.iSize = typesUtils.pInt(oAttach.Size || oAttach.EstimatedSize, this.iSize)
  this.sCid = typesUtils.pString(oAttach.CID, this.sCid)
  this.sContent = typesUtils.pString(oAttach.Content, this.sContent)
  this.sContentLocation = typesUtils.pString(oAttach.ContentLocation, this.sContentLocation)
  this.sDownloadLink = sDownloadLink
  this.sFileName = typesUtils.pString(oAttach.FileName, this.sFileName)
  this.sHash = typesUtils.pString(oAttach.Hash, this.sHash)
  this.iMimePartIndex = typesUtils.pInt(oAttach.MimePartIndex, this.iMimePartIndex)
  this.sTempName = typesUtils.pString(oAttach.TempName, this.sTempName)
  this.sThumbnailLink = sThumbnailLink
  this.sType = typesUtils.pString(oAttach.MimeType, this.sType)
  this.sViewLink = sViewLink
}

CAttachment.prototype.onUploadComplete = function () {
  this.bUploadFailed = false
  this.iProgressPercent = 100
}

CAttachment.prototype.onUploadFailed = function () {
  this.bUploadFailed = true
  this.iProgressPercent = 100
}

CAttachment.prototype.setTempName = function (sTempName) {
  this.sTempName = typesUtils.pString(sTempName, this.sTempName)
}

export default CAttachment
