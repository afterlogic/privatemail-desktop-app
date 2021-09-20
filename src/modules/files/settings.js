function CSettings () {
  this.enableSharedFiles = false
}
CSettings.prototype.parse = function (dataCore) {
  if (dataCore) {
    const enableSharedFiles = dataCore.AvailableClientModules.find( module => module === 'SharedFiles' )
    this.enableSharedFiles = !!enableSharedFiles
  }
}
export default new CSettings()
