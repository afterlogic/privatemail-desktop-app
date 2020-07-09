import { app, Menu, Tray } from 'electron'
const path = require('path')

let oMainWindow = null
let oTray = null
let bQuiting = false
let bMinimizeToTray = true

const getIcon = () => {
  if (process.platform == 'darwin') {
    return 'osx-tray.png'
  }
  
  if (process.platform == 'win32') {
    return 'win-tray.png'
  }

  return 'linux-tray.png'
}

const getUnreadIcon = () => {
  if (process.platform == 'darwin') {
    return 'osx-tray-unread.png'
  }
  
  if (process.platform == 'win32') {
    return 'win-tray-unread.png'
  }

  return 'linux-tray-unread.png'
}

export default {
  create: function (mainWindow) {
    oMainWindow = mainWindow

    let sPath = path.join(__statics, getIcon())
    oTray = new Tray(sPath)
    oTray.setToolTip('Privatemail Desktop')

    // hide tray in the dock for macOs
    if (app.dock) app.dock.hide()

    app.on('before-quit', function () {
      // allows quitting work during update
      bQuiting = true
    })
    
    oMainWindow.on('close', function (event) {
      if (!bQuiting) {
          event.preventDefault()
          oMainWindow.hide()
      }
      return false
    })

    oMainWindow.on('minimize', function (event) {
      if (bMinimizeToTray) {
        oMainWindow.hide()
      }
    })

    oMainWindow.on('focus', function (event) {
      oTray.setToolTip('Privatemail Desktop')
      oTray.setImage(path.join(__statics, getIcon()))
      oMainWindow.setOverlayIcon(null, '')
      oMainWindow.setTitle('Privatemail Desktop')
    })

    let oContextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Privatemail',
        click: function() {
          oMainWindow.show()
        },
      },
      {
        label: 'Quit Privatemail',
        click: function() {
          bQuiting = true
          app.quit()
        },
      }
    ])

    oTray.on('click', () => {
      oMainWindow.show()
    })
    oTray.setContextMenu(oContextMenu)
  },

  setUnreadStatus (iCount) {
    let sDescription = ('You have %COUNT% new message(s)').replace(/%COUNT%/g, iCount)
    oTray.setImage(path.join(__statics, getUnreadIcon()))
    oTray.setToolTip('Privatemail Desktop - ' + sDescription)
    oMainWindow.setOverlayIcon(path.join(__statics, 'unread-dot.png'), sDescription)
    oMainWindow.setTitle('Privatemail Desktop - ' + sDescription)
  },

  setMinimizeToTray (oUserData) {
    bMinimizeToTray = oUserData && oUserData.main && typeof(oUserData.main.minimizeToTray) === 'boolean' ? oUserData.main.minimizeToTray : true;
  }
}
