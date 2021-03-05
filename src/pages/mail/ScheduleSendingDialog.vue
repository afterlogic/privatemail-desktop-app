<template>
  <div>
  <q-dialog v-model="scheduleSendingDialog" persistent>
    <q-card class="q-px-sm" style="min-width: 300px;">
      <q-card-section class="non-selectable">
        <div class="text-h6">Schedule sending</div>
      </q-card-section>
      <q-card-section>
        <q-item class="q-px-xs q-py-xs" clickable v-ripple :active="selectedDatetime === option.Unix" active-class="bg-grey-3 text-grey-10"
            v-for="option in predefinedOptions" :key="option.Unix" @click="selectDate(option.Unix)">
          <q-item-section>{{ option.LeftLabel }}</q-item-section>
          <q-item-section side>{{ option.RightLabel }}</q-item-section>
        </q-item>
      </q-card-section>
      <q-item align="center">
        <q-item-section side top>
          <span>or select custom date and time</span>
        </q-item-section>
      </q-item>
      <q-card-section>
        <q-input filled v-model="selectedDate" mask="date" :rules="['date']" >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date v-model="selectedDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-select dense outlined v-model="selectedTime" :options="timeOptions" label="Time" />
      </q-card-section>
      <q-card-actions align="right" class="non-selectable">
        <q-btn flat label="Schedule" color="primary" @click="schedule" />
        <q-btn flat label="Cancel" color="grey-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<style lang="scss">
</style>

<script>
import _ from 'lodash'
import moment from 'moment'

import calendarUtils from 'src/utils/calendar.js'
import notification from 'src/utils/notification.js'
import scheduleUtils from 'src/utils/schedule.js'

export default {
  data () {
    return {
      timeOptions: calendarUtils.getTimeListStepHalfHour(),
      predefinedOptions: scheduleUtils.getPredefinedOptions(),

      selectedDate: '',
      selectedTime: '',
      selectedDatetime: '',

      saveScheduledMessageHandler: null,

      scheduleSendingDialog: false,
    }
  },

  watch: {
    selectedDate () {
      if (this.selectedTime === '' && this.selectedDate !== '') {
        this.selectedTime = _.find(this.timeOptions, function (sOption) {
          return sOption.indexOf('8') !== -1;
        }) || ''
      }
      if (this.selectedDate !== '') {
        this.selectDateTime()
      }
    },
    selectedTime () {
      if (this.selectedDate !== '') {
        this.selectDateTime()
      }
    },
  },

  methods: {
    open (saveScheduledMessageHandler) {
      this.saveScheduledMessageHandler = saveScheduledMessageHandler
      this.selectedDate = ''
      this.selectedTime = ''
      this.selectedDatetime = ''
      this.scheduleSendingDialog = true
    },
    selectDate (iUnix) {
      this.selectedDate = ''
      this.selectedTime = ''
      this.selectedDatetime = iUnix
    },
    selectDateTime () {
      let oMoment = moment(this.selectedDate + ' ' + this.selectedTime, 'YYYY/MM/DD ' + calendarUtils.getTimeFormat())
      this.selectedDatetime = oMoment.unix()
    },
    schedule () {
      if (_.isFunction(this.saveScheduledMessageHandler)) {
        if (this.selectedDatetime < moment().unix()) {
          notification.showError('Please select a scheduled time later than the current one.')
        } else {
          this.saveScheduledMessageHandler(this.selectedDatetime)
          this.scheduleSendingDialog = false
        }
      }
    },
  },
}
</script>
