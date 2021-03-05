import _ from 'lodash'
import moment from 'moment'

import coreSettings from 'src/modules/core/settings.js'

function _getTimeFormat () {
  return (coreSettings.iTimeFormat === 0) ? 'HH:mm' : 'hh:mm A'
}

export default {
  getTimeFormat () {
    return _getTimeFormat()
  },

  getTimeListStepHalfHour () {
    let aTimeList = [
      '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30',
      '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
      '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
    ]

    return _.map(aTimeList, function (sTime) {
      let
        oMoment = moment(sTime, 'HH:mm'),
        sText = oMoment.format(_getTimeFormat())

      return sText
    })
  },

  getDateFormatForDatePicker (sDateFormat) {
    let sDatePickerDateFormat = 'mm/dd/yy'

    switch (sDateFormat) {
      case 'MM/DD/YYYY':
        sDatePickerDateFormat = 'mm/dd/yy'
        break
      case 'DD/MM/YYYY':
        sDatePickerDateFormat = 'dd/mm/yy'
        break
      case 'DD Month YYYY':
        sDatePickerDateFormat = 'dd MM yy'
        break
    }

    return sDatePickerDateFormat
  }
}
