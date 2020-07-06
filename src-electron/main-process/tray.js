import { app, Menu, Tray } from 'electron'
const path = require('path')

let oTray = null
let bQuiting = false

export default {
  create: function (mainWindow) {
    let sPath = path.join(__statics, 'tray.png')
    oTray = new Tray(sPath)
    oTray.setToolTip('Privatemail desktop app')

    // hide tray in the dock for macOs
    if (app.dock) app.dock.hide()

    app.on('before-quit', function () {
      // allows quitting work during update
      bQuiting = true
    })
    
    mainWindow.on('close', function (event) {
      if (!bQuiting) {
          event.preventDefault()
          mainWindow.hide()
      }
      return false
    })

    let oContextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit Privatemail',
        click: function() {
          bQuiting = true
          app.quit()
        },
      }
    ])

    oTray.on('click', () => {
      mainWindow.show()
    })
    oTray.setContextMenu(oContextMenu)
  },
}
