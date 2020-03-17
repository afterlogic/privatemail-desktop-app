import { Notify } from 'quasar'

import _ from 'lodash'

let fDismissLoading = null

export default {
  showError (message, timeout) {
    if (!_.isInteger(timeout)) {
      timeout = 10000
    }
    Notify.create({
      color: 'red',
      textColor: 'white',
      icon: null,
      message,
      position: 'top-right',
      avatar: null,
      multiLine: false, // if multiLine=true then close button is displayed at the bottom
      timeout,
      actions: [{ icon: 'close', color: 'white' }],
    })
  },
  showReport (message) {
    Notify.create({
      color: 'green',
      textColor: 'white',
      icon: null,
      message,
      position: 'top-right',
      avatar: null,
      multiLine: false, // if multiLine=true then close button is displayed at the bottom
      timeout: 10000,
      actions: [{ icon: 'close', color: 'white' }],
    })
  },
  showLoading (message) {
    this.hideLoading()
    fDismissLoading = Notify.create({
      color: 'orange',
      textColor: 'white',
      icon: null,
      message,
      position: 'top-right',
      avatar: null,
      multiLine: false,
      timeout: 0,
      actions: [],
    })
  },
  hideLoading () {
    if (_.isFunction(fDismissLoading)) {
      fDismissLoading()
      fDismissLoading = null
    }
  },
}
