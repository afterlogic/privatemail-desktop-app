import router from 'src/router'
// import mailPrefetcher from 'src/modules/mail/prefetcher.js'

export default {
  start: function () {
    let sCurrentPath = router.currentRoute && router.currentRoute.path ? router.currentRoute.path : ''
    switch (sCurrentPath) {
      default:
      case '/mail':
        // mailPrefetcher.start()
        break
      case '/contacts':
        break
    }
  },
}
