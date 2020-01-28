const createDMG = require('electron-installer-dmg')

const oPackageJsonData = require('../../package.json')
const sVersion = oPackageJsonData.version
const oOptions = {
  appPath: '../../dist/electron/Private Mail-darwin-x64/Private Mail.app',
  name: 'privatemail-' + sVersion + '-installer',
  title: 'Private Mail',
  icon: '../../src-electron/icons/icon.icns',
  background: 'background.png',
  overwrite: true,
  debug: true,
}
console.log('options', oOptions)

console.log('Creating package (this may take a while)')
createDMG(oOptions).then(function () {
  console.log('The installer of your application was succesfully created!')
}, function (oError) {
  console.log(`Well, sometimes you are not so lucky: ${oError.message}`)
})

// electron-installer-dmg '../../dist/electron/Private Mail-darwin-x64/Private Mail.app' 'Private Mail' --debug --overwrite --icon='icon.icns'
