export default {
  pInt: function (mValue, iDefault) {
    var iValue = window.parseInt(mValue, 10)
    if (isNaN(iValue)) {
      iValue = !isNaN(iDefault) ? iDefault : 0
    }
    return iValue
  },

  roundNumber: function (iNum, iDec) {
    return Math.round(iNum * Math.pow(10, iDec)) / Math.pow(10, iDec)
  },
}
