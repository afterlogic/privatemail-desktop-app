import typesUtils from '../../../utils/types'

function CContactsInfo (data) {
  this.UUID = ''
  this.ETag = ''

  this.parse(data)
}

CContactsInfo.prototype.parse = function (data) {
  if ( typesUtils.isNonEmptyString(data.UUID) ) {
    this.UUID = data.UUID
  }

  if ( typesUtils.isNonEmptyString(data.ETag) ) {
    this.ETag = data.ETag
  }
}

export default CContactsInfo
