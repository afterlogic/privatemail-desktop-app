const createDMG = require('electron-installer-dmg')

const oPackageJsonData = require('../../package.json')
const sVersion = oPackageJsonData.version
const sBuild = oPackageJsonData.buildNumber

const oOptions = {
  appPath: '../../dist/electron/PrivateMail-darwin-x64/PrivateMail.app',
  name: 'privatemail-' + sVersion + '(' + sBuild + ')' + '-installer',
  title: 'PrivateMail',
  icon: '../../src-electron/icons/icon.icns',
  background: 'background.png',
  overwrite: true,
}
console.log('options', oOptions)

console.log('Creating package (this may take a while)')
createDMG(oOptions).then(function () {
  console.log('The installer was succesfully created!')
}, function (oError) {
  console.error(oError)
})

// electron-installer-dmg '../../dist/electron/Private Mail-darwin-x64/Private Mail.app' 'Private Mail' --debug --overwrite --icon='icon.icns'
