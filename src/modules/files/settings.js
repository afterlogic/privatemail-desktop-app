import types from "../../utils/types";

function CSettings () {
  this.enableSharedFiles = false
  this.extensionsToView = []
}
CSettings.prototype.parseCoreModule = function (dataCore) {
  if (dataCore) {
    const enableSharedFiles = dataCore.AvailableClientModules.find( module => module === 'SharedFiles' )
    this.enableSharedFiles = !!enableSharedFiles
  }
}
CSettings.prototype.parseOfficeDocumentViewerModule = function (dataOfficeDocumentViewer) {
  if (dataOfficeDocumentViewer) {
    this.extensionsToView = types.pArray(dataOfficeDocumentViewer.ExtensionsToView, [])
  }
}
export default new CSettings()
