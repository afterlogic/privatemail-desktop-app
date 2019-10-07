import { Notify } from 'quasar'

import _ from 'lodash'

let fDismissLoading = null

export default {
  showError (message) {
    Notify.create({
      color: 'red',
      textColor: 'white',
      icon: null,
      message,
      position: 'top-right',
      avatar: null,
      multiLine: true,
      timeout: 10000,
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
      multiLine: true,
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
      position: 'top',
      avatar: null,
      multiLine: true,
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
