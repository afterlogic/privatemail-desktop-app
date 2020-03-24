const createDebianInstaller = require('electron-installer-debian')
const createRpmInstaller = require('electron-installer-redhat')

const oPackageJsonData = require('../../package.json')
const sVersion = oPackageJsonData.version
const sBuild = oPackageJsonData.buildNumber

const oDebOptions = {
  src: '../../dist/electron/PrivateMail-linux-x64',
  dest: 'dist/',
  arch: 'amd64',
  name: 'privatemail-' + sVersion + '(' + sBuild + ')' + '-installer',
  productName: 'privatemail',
  icon: '../../src-electron/icons/linux-512x512.png',
}

console.log('Debian package options', oDebOptions)
console.log('Creating Debian package (this may take a while)')

createDebianInstaller(oDebOptions).then(function () {
  console.log('The installer for Debian was succesfully created!')
}, function (oError) {
  console.error(oError)
})

const oRpmOptions = {
  src: '../../dist/electron/PrivateMail-linux-x64',
  dest: 'dist/',
  arch: 'x86_64',
  name: 'privatemail-' + sVersion + '(' + sBuild + ')' + '-installer',
  productName: 'privatemail',
  icon: '../../src-electron/icons/linux-512x512.png',
}

console.log('Creating RedHat package (this may take a while)')
createRpmInstaller(oRpmOptions).then(function () {
  console.log('The installer for RedHat was succesfully created!')
}, function (oError) {
  console.error(oError)
})
