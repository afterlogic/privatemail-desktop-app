import typesUtils from 'src/utils/types'

export default {
  getFriendlySize: function (iSizeInBytes) {
    var iBytesInKb = 1024
    var iBytesInMb = iBytesInKb * iBytesInKb
    var iBytesInGb = iBytesInKb * iBytesInKb * iBytesInKb

    iSizeInBytes = typesUtils.pInt(iSizeInBytes)

    if (iSizeInBytes >= iBytesInGb) {
      return typesUtils.roundNumber(iSizeInBytes / iBytesInGb, 1) + 'GB'
    } else if (iSizeInBytes >= iBytesInMb) {
      return typesUtils.roundNumber(iSizeInBytes / iBytesInMb, 1) + 'MB'
    } else if (iSizeInBytes >= iBytesInKb) {
      return typesUtils.roundNumber(iSizeInBytes / iBytesInKb, 0) + 'KB'
    }

    return iSizeInBytes + 'B'
  },
  i18n: function (sText) {
    return sText
  },
  encodeHtml: function (sText) {
    return (sText) ? sText.toString()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;') : ''
  },
}
