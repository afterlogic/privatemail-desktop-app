import { app, autoUpdater, dialog } from 'electron'
const log = require('electron-log')

function _isDevMode () {
  const isEnvSet = 'ELECTRON_IS_DEV' in process.env
  const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1

  return isEnvSet ? getFromEnv : !app.isPackaged
}

export default {
  start: function (version) {
    if (_isDevMode()) {
      return
    }

    return // temporary disabled

    let sFeedURL = `http://127.0.0.1:1337/update/win64/${version}`
    log.info('sFeedURL', sFeedURL)
    autoUpdater.setFeedURL(sFeedURL)

    autoUpdater.on('checking-for-update', () => {
      log.info('Auto updater - checking for update...')
      log.info(arguments)
    })

    autoUpdater.on('update-available', () => {
      log.info('Auto updater - update available.')
      log.info('sFeedURL 2', autoUpdater.getFeedURL())
      log.info(arguments)
    })

    autoUpdater.on('update-not-available', () => {
      log.info('Auto updater - update not available.')
      setTimeout(() => {
        autoUpdater.checkForUpdates()
      }, 300000)
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
      log.info('Auto updater - update downloaded.')
      log.info('releaseNotes', releaseNotes)
      log.info('releaseName', releaseName)
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
      }

      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
      })
    })

    autoUpdater.on('error', message => {
      log.error('There was a problem updating the application')
      log.error(message)
    })

    setTimeout(() => {
      autoUpdater.checkForUpdates()
    }, 10000)
  },
}
