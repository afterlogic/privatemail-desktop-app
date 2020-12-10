const UAParser = require('ua-parser-js')
import {productName, version, buildNumber} from '../../package.json'

import typesUtils from './types.js'

export default {
  getName: function () {
    let
      sUserAgent = navigator.userAgent,
      oUaData = UAParser(typesUtils.pString(sUserAgent)),
      // sName = oUaData.browser.name + '/' + oUaData.browser.major,
      sName = productName + ' ' + version + '(' + buildNumber + ')',
      sPlatform = oUaData.os.name + ' ' + oUaData.os.version,
      sDeviceName = sName + ' on ' + sPlatform

    return sDeviceName
  }
}
