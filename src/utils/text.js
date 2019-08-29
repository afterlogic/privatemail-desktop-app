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
}
