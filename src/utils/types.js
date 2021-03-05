import _ from 'lodash'

export default {
  isNumber: function (mValue) {
    return typeof mValue === 'number'
  },

  isPositiveNumber: function (mValue) {
    return this.isNumber(mValue) && mValue > 0
  },

  pInt: function (mValue, iDefault) {
    var iValue = parseInt(mValue, 10)
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
   * @return {boolean}
   */
  isString: function (mValue) {
    return typeof mValue === 'string'
  },

  /**
   * @param {*} mValue
   * @return {boolean}
   */
  isNonEmptyString: function (mValue) {
    return this.isString(mValue) && mValue !== ''
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

  pArray: function (mValue, aDefault) {
    if (_.isArray(mValue)) {
      return mValue
    }
    if (_.isArray(aDefault)) {
      return aDefault
    }
    return []
  },

  pBool: function (mValue, bDefault) {
    if (typeof mValue === 'boolean') {
      return mValue
    }
    if (typeof bDefault === 'boolean') {
      return bDefault
    }
    return false
  },

  isNotNullObject: function (mValue) {
    return _.isObject(mValue) && !_.isArray(mValue) && mValue !== null
  },

  isNonEmptyObject: function (mValue) {
    return _.isObject(mValue) && !_.isArray(mValue) && !_.isEmpty(mValue)
  },

  pObject: function (mValue, oDefault) {
    if (this.isNotNullObject(mValue)) {
      return mValue
    }
    if (_.isObject(oDefault) && !_.isArray(oDefault)) {
      return oDefault
    }
    return {}
  },

  pStringToJson: function (sValue) {
    let oResult = null
    if (this.isNonEmptyString(sValue)) {
      try {
        oResult = JSON.parse(sValue)
      } catch (oError) {
        const log = require('electron-log')
        log.error('Error while parsing JSON: ' + sValue)
        log.error(oError)
      }
      if (!_.isObject(oResult)) {
        oResult = null
      }
    }
    return oResult
  },

  base64ToArrayBuffer (sBase64) {
    let
      sBinary = window.atob(sBase64),
      iLen = sBinary.length,
      oBytes = new Uint8Array(iLen)

    for (var i = 0; i < iLen; i++) {
      oBytes[i] = sBinary.charCodeAt(i)
    }

    return oBytes.buffer
  },

  arrayBufferToBase64 (buffer) {
    let
      sBinary = '',
      oBytes = new Uint8Array(buffer),
      iLen = oBytes.byteLength

    for (var i = 0; i < iLen; i++) {
      sBinary += String.fromCharCode(oBytes[ i ])
    }

    return window.btoa(sBinary)
  },
}
