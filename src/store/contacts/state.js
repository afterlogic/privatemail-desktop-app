import CStorages from '../../modules/contacts/classes/CStorages'

export default {
  storages: new CStorages(),

  hasChanges: false,
  syncing: true,
  loading: true,

  currentPage: 1,
  contactsPerPage: 20,
  searchText: '',

  contacts: {
    list: [], // list of contacts on the current page
    count: 0, // total count of contacts in the current storage or group
  },

  contactsByEmail: {},
  newContactToEdit: null,

  contactByUUID: {
    UUID: null,
    editable: false,
    contact: {},
  },
  stateForCreatingContact: false,
  stateForCreatingGroup: false,
  selectedContact: null,
  checkedContactsList: [],
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
