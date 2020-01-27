const createDMG = require('electron-installer-dmg')
let oOptions = {
  appPath: '../../dist/electron/Private Mail-darwin-x64/Private Mail.app',
  name: 'Private Mail-0.0.1-installer',
  title: 'Private Mail',
  icon: 'icon.icns',
  // background: 'background.png',
  overwrite: true,
  debug: true,
}
console.log('oOptions', oOptions)

  createDMG(oOptions, function done (err) {
    console.log('err', err)
  })
  


// electron-installer-dmg '../../dist/electron/Private Mail-darwin-x64/Private Mail.app' 'Private Mail' --debug --overwrite --icon='icon.icns'
