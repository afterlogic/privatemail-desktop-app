const electronInstaller = require('electron-winstaller')

const oPackageJsonData = require('../../package.json')
const sVersion = oPackageJsonData.version
const oSettings = {
    appDirectory: '../../dist/electron/Private Mail-win32-x64',
    outputDirectory: './dist',
    loadingGif: './progress.gif',
    author: 'Private Mail LLC',
    authors: 'Private Mail LLC',
    owners: 'Private Mail LLC',
    exe: './privatemail_desktop.exe',
    title: 'Private Mail Desktop', // title is used in the list of programs in "Add or Remove Programs" in the Windows Control Panel
    setupIcon: '../../src-electron/icons/icon.ico',
    setupExe: 'privatemail-' + sVersion + '-installer.exe',
    noMsi: true,
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
