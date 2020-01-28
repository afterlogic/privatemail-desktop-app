const createDMG = require('electron-installer-dmg')

let pjson = require('../../package.json')

let oOptions = {
  appPath: '../../dist/electron/Private Mail-darwin-x64/Private Mail.app',
  name: 'Private Mail-' + pjson.version + '-installer',
  title: 'Private Mail',
  icon: '../../src-electron/icons/icon.icns',
  background: 'background.png',
  overwrite: true,
  debug: true,
}
console.log('options', oOptions)

createDMG(oOptions, function done (oError) {
  console.log('error', oError)
})

// electron-installer-dmg '../../dist/electron/Private Mail-darwin-x64/Private Mail.app' 'Private Mail' --debug --overwrite --icon='icon.icns'
