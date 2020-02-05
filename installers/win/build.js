const electronInstaller = require('electron-winstaller')

const oPackageJsonData = require('../../package.json')
const sVersion = oPackageJsonData.version
const sBuild = oPackageJsonData.buildNumber

const oSettings = {
    appDirectory: '../../dist/electron/PrivateMail-win32-x64',
    outputDirectory: './dist',
    loadingGif: './progress.gif',
    author: 'PrivateMail LLC',
    authors: 'PrivateMail LLC',
    owners: 'PrivateMail LLC',
    exe: './privatemail.exe',
    title: 'PrivateMail Desktop', // title is used in the list of programs in "Add or Remove Programs" in the Windows Control Panel
    setupIcon: '../../src-electron/icons/icon.ico',
    setupExe: 'privatemail-' + sVersion + '(' + sBuild + ')' + '-installer.exe',
    noMsi: true, //anyway .msi doesn't work
}
console.log('settings', oSettings)

// name from package.json should not have dashes (-) in it
// productName from package.json is used in the application header
// build.productName from package.json is used for desktop shortcut and shortcut in the Start menu

console.log('Creating package (this may take a while)')
electronInstaller.createWindowsInstaller(oSettings).then(() => {
  console.log('The installer was succesfully created!')
}, (oError) => {
  console.error(oError)
})
