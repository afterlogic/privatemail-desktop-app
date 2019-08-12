import { Notify } from 'quasar'

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
      actions: [],
      timeout: 10000,
      actions: [{ icon: 'close', color: 'white' }],
    })
  },
}
