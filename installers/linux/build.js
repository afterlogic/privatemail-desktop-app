const createInstaller = require('electron-installer-debian')

const oOptions = {
  src: '../../dist/electron/PrivateMail-linux-x64',
  dest: 'dist/',
  arch: 'amd64',
  name: 'privatemail_installer',
  productName: 'privatemail',
  icon: '../../src-electron/icons/linux-512x512.png',
}
console.log('options', oOptions)

console.log('Creating package (this may take a while)')
createInstaller(oOptions).then(function () {
  console.log('The installer was succesfully created!')
}, function (oError) {
  console.error(oError)
})
