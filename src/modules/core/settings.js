import typesUtils from 'src/utils/types.js'

function CSettings () {
  this.bUserSelectsDateFormat = false
  this.iTimeFormat = 0 // 24 hours
  this.sDateFormat = 'DD Month YYYY'

  this.iAutoRefreshIntervalMinutes = 0
}

CSettings.prototype.parse = function (oData, oWebclientData) {
  if (oData) {
    this.bUserSelectsDateFormat = typesUtils.pBool(oData.UserSelectsDateFormat, this.bUserSelectsDateFormat)
    this.setTimeFormat(oData.TimeFormat)
    this.sDateFormat = typesUtils.pString(oData.DateFormat, this.sDateFormat)
  }

  if (oWebclientData) {
      this.setAutoRefreshIntervalMinutes(oWebclientData.AutoRefreshIntervalMinutes)
  }
}

CSettings.prototype.setTimeFormat = function (iTimeFormat) {
  iTimeFormat = typesUtils.pInt(iTimeFormat, this.iTimeFormat)
  if (iTimeFormat !== this.iTimeFormat) {
    this.iTimeFormat = iTimeFormat
  }
}

CSettings.prototype.setAutoRefreshIntervalMinutes = function (iAutoRefreshIntervalMinutes) {
  iAutoRefreshIntervalMinutes = typesUtils.pInt(iAutoRefreshIntervalMinutes, this.iAutoRefreshIntervalMinutes)
  if (iAutoRefreshIntervalMinutes !== this.iAutoRefreshIntervalMinutes) {
    this.iAutoRefreshIntervalMinutes = iAutoRefreshIntervalMinutes
  }
}

export default new CSettings()
