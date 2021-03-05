import _ from 'lodash'
import moment from 'moment'

import calendarUtils from './calendar.js'
import typesUtils from './types.js'

import mailSettings from 'src/modules/mail/settings.js'

function getPredefinedHour(oScheduleItem) {
	let iHour = typesUtils.pInt(oScheduleItem.Hour)
	if (iHour <= 12 && typesUtils.isString(oScheduleItem.Hour) && oScheduleItem.Hour.toLowerCase().indexOf('pm') !== -1) {
		iHour += 12
	}
	return iHour
}

function getPredefinedMoment(oScheduleItem, iHour) {
	let oMoment = moment()
	if (oScheduleItem.DayOfWeek.toLowerCase() === 'today') {
		oMoment.set('hour', iHour).set('minute', 0).set('second', 0)
	} else if (oScheduleItem.DayOfWeek.toLowerCase() === 'tomorrow') {
		oMoment.add(1, 'd').set('hour', iHour).set('minute', 0).set('second', 0)
	} else {
		let
			oDays = {
				'sunday': 0,
				'monday': 1,
				'tuesday': 2,
				'wednesday': 3,
				'thursday': 4,
				'friday': 5,
				'saturday': 6
			},
			iDay = typesUtils.pInt(oDays[oScheduleItem.DayOfWeek.toLowerCase()], 1)

		if (iDay <= oMoment.day()) {
			iDay += 7
		}
		oMoment.set('hour', iHour).set('minute', 0).set('second', 0).day(iDay)
	}
	return oMoment
}

function getWhenLabel(oMoment, iHour) {
	let
		sWhenLabel = '',
		oDaysTexts = {
			0: 'Sunday',
			1: 'Monday',
			2: 'Tuesday',
			3: 'Wednesday',
			4: 'Thursday',
			5: 'Friday',
			6: 'Saturday'
		},
		oNowMoment = moment()

	if (oNowMoment.date() === oMoment.date()) {
		sWhenLabel = 'Today'
	} else if (oNowMoment.add(1, 'd').date() === oMoment.date()) {
		sWhenLabel = 'Tomorrow'
	} else {
		sWhenLabel = oDaysTexts[oMoment.day()]
	}

	if (iHour >= 0 && iHour <= 3) {
		sWhenLabel += ' night'
	} else if (iHour >= 4 && iHour <= 11) {
		sWhenLabel += ' morning'
	} else if (iHour >= 12 && iHour <= 16) {
		sWhenLabel += ' afternoon'
	} else if (iHour >= 16 && iHour <= 23) {
		sWhenLabel += ' evening'
	}

	return sWhenLabel
}

export default {
	getPredefinedOptions () {
		let aOptions = []
		if (_.isArray(mailSettings.aPredefinedSchedule)) {
			_.each(mailSettings.aPredefinedSchedule, function (oScheduleItem) {
				let
					iHour = getPredefinedHour(oScheduleItem),
					oMoment = getPredefinedMoment(oScheduleItem, iHour)

				aOptions.push({
					LeftLabel: getWhenLabel(oMoment, iHour),
					RightLabel: oMoment.format('D MMM, ' + calendarUtils.getTimeFormat()),
					Unix: oMoment.unix()
				})
			})
		}
		aOptions.sort(function (left, right) {
			return left.Unix === right.Unix ? 0 : (left.Unix < right.Unix ? -1 : 1)
		})

		let aResultOptions = []
		_.each(aOptions, function (oOption) {
			if (oOption.Unix > moment().unix() && !_.find(aResultOptions, function (oResOption) {
				return oOption.Unix === oResOption.Unix
			})) {
				aResultOptions.push(oOption)
			}
		})
		return _.uniq(aResultOptions)
	},

	getScheduledAtText (iUnix) {
		let oMoment = moment.unix(iUnix)
		return 'Sending scheduled for ' + oMoment.format('D MMM, ' + calendarUtils.getTimeFormat())
	},
}
