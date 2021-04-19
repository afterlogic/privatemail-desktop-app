import typesUtils from 'src/utils/types.js'
import store from 'src/store'

function CSettings () {
  this.iContactsPerPage = 20
}

CSettings.prototype.parse = function (oData) {
  if (oData) {
    this.setSettingImportExportFormats(oData.ImportExportFormats)
    this.setContactsPerPage(oData.ContactsPerPage)
  }
}

CSettings.prototype.setContactsPerPage = function (iContactsPerPage) {
  iContactsPerPage = typesUtils.pInt(iContactsPerPage, this.iContactsPerPage)
  if (iContactsPerPage !== this.iContactsPerPage) {
    this.iContactsPerPage = iContactsPerPage
    store.commit('contacts/setContactsPerPage', this.iContactsPerPage)
    store.dispatch('contacts/asyncGetContacts')
  }
}
CSettings.prototype.setSettingImportExportFormats = function (ImportExportFormats) {
  store.commit('contacts/setSettingImportExportFormats', ImportExportFormats)
}

export default new CSettings()
