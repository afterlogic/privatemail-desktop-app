<template>
  <div>
  <q-dialog v-model="scheduleSendingDialog" persistent>
    <q-card class="q-px-sm" style="min-width: 350px;">
      <q-card-section class="non-selectable">
        <div class="text-h6">Schedule sending</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-item class="q-px-md q-py-none" clickable v-ripple :active="selectedDatetime === option.Unix" active-class="bg-grey-3 text-grey-10"
            v-for="option in predefinedOptions" :key="option.Unix" @click="selectDate(option.Unix)">
          <q-item-section>{{ option.LeftLabel }}</q-item-section>
          <q-item-section side>{{ option.RightLabel }}</q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-item>
          <q-item-section side class="text-center">
            or select custom date and time
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-item class="q-pa-none">
          <q-item-section>
            <q-input dense outlined bg-color="white" class="input-size" v-model="selectedDate" mask="####.##.##" label="Date">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qSelectDate" transition-show="scale" transition-hide="scale">
                    <q-date v-model="selectedDate" @input="() => $refs.qSelectDate.hide()" mask="YYYY.MM.DD" today-btn minimal/>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
          <q-item-section side>
            <q-select dense outlined v-model="selectedTime" :options="timeOptions" label="Time" style="min-width: 90px;" />
          </q-item-section>
        </q-item>
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
      selectedDatetime: 0,

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
      this.selectedDatetime = 0
      this.scheduleSendingDialog = true
    },
    selectDate (iUnix) {
      this.selectedDate = ''
      this.selectedTime = ''
      if (this.selectedDatetime === iUnix) {
        this.selectedDatetime = 0
      } else {
        this.selectedDatetime = iUnix
      }
    },
    selectDateTime () {
      let oMoment = moment(this.selectedDate + ' ' + this.selectedTime, 'YYYY/MM/DD ' + calendarUtils.getTimeFormat())
      this.selectedDatetime = oMoment.unix()
    },
    schedule () {
      if (_.isFunction(this.saveScheduledMessageHandler)) {
        if (this.selectedDatetime === 0) {
          notification.showError('Please select a scheduled time.')
        } else if (this.selectedDatetime < moment().unix()) {
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
