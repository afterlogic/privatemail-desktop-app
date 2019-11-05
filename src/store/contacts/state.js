import CStorages from '../../modules/contacts/classes/CStorages'

export default {
  storages: new CStorages(),

  hasChanges: false,
  syncing: true,

  currentPage: 1,
  contactsPerPage: 20,
  searchText: '',

  contacts: {
    list: [], // list of contacts on the current page
    count: 0, // total count of contacts in the current storage or group
  },

  contactByUUID: {
    UUID: null,
    editable: false,
    contact: {},
  },
  isContactEdit: false,
  selectedContact: null,
  contactsToDowload: {
    chunk: [],
    amount: 2,
  },
  groups: [],
  currentGroup: {
    editable: null,
    group: null,
  },
}
