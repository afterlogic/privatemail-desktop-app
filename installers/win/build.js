const electronInstaller = require('electron-winstaller')

let oPackageJsonData = require('../../package.json')
let sVersion = oPackageJsonData.version
let oSettings = {
    appDirectory: '../../dist/electron/Private Mail-win32-x64',
    outputDirectory: './dist',
    loadingGif: './progress.gif',
    author: 'Private Mail LLC',
    authors: 'Private Mail LLC',
    owners: 'Private Mail LLC',
    exe: './privatemail.exe',
    title: 'Private Mail Desktop', // title is used in the list of programs in "Add or Remove Programs" in the Windows Control Panel
    setupIcon: '../../src-electron/icons/icon.ico',
    setupExe: 'privatemail-' + sVersion + '-installer.exe',
    // setupMsi: 'privatemail-' + version + '-installer.msi',
}

// name from package.json should not have dashes (-) in it
// productName from package.json is used in the application header
// build.productName from package.json is used for desktop shortcut and shortcut in the Start menu
electronInstaller.createWindowsInstaller(oSettings).then(() => {
  console.log('The installers of your application were succesfully created!')
}, (oError) => {
  console.log(`Well, sometimes you are not so lucky: ${oError.message}`)
})
