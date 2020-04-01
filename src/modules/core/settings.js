import typesUtils from 'src/utils/types.js'

function CSettings () {
  this.bUserSelectsDateFormat = false
  this.iTimeFormat = 0 // 24 hours
  this.sDateFormat = 'DD Month YYYY'
  this.sTimezone = ''

  this.bAllowDesktopNotifications = false
  this.iAutoRefreshIntervalMinutes = 0
}

CSettings.prototype.parse = function (oData, oWebclientData) {
  if (oData) {
    this.bUserSelectsDateFormat = typesUtils.pBool(oData.UserSelectsDateFormat, this.bUserSelectsDateFormat)
    this.setTimeFormat(oData.TimeFormat)
    this.sDateFormat = typesUtils.pString(oData.DateFormat, this.sDateFormat)
    this.sTimezone = typesUtils.pString(oData.Timezone, this.sTimezone)
  }

  if (oWebclientData) {
    this.setAllowDesktopNotifications(oWebclientData.AllowDesktopNotifications)
    this.setAutoRefreshIntervalMinutes(oWebclientData.AutoRefreshIntervalMinutes)
  }
}

CSettings.prototype.setTimeFormat = function (iTimeFormat) {
  this.iTimeFormat = typesUtils.pInt(iTimeFormat, this.iTimeFormat)
}

CSettings.prototype.setAllowDesktopNotifications = function (bAllowDesktopNotifications) {
  this.bAllowDesktopNotifications = typesUtils.pBool(bAllowDesktopNotifications, this.bAllowDesktopNotifications)
}

CSettings.prototype.setAutoRefreshIntervalMinutes = function (iAutoRefreshIntervalMinutes) {
  this.iAutoRefreshIntervalMinutes = typesUtils.pInt(iAutoRefreshIntervalMinutes, this.iAutoRefreshIntervalMinutes)
}

export default new CSettings()
