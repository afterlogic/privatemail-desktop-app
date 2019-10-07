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

  /**
   * @param {*} mValue
   * @param {string} sDefault
   * @return {string}
   */
  pString: function (mValue, sDefault) {
    if (mValue !== undefined && mValue !== null) {
      return mValue.toString()
    }
    if (typeof sDefault === 'string') {
      return sDefault
    }
    return ''
  },

  /**
   * @param {*} aValue
   * @param {number=} iArrayLen
   * @return {boolean}
   */
  isNonEmptyArray: function (aValue, iArrayLen) {
    iArrayLen = iArrayLen || 1
    return _.isArray(aValue) && iArrayLen <= aValue.length
  },
}
