import CStorages from '../../modules/contacts/classes/CStorages'

export default {
  storages: new CStorages(),

  hasChanges: false,
  syncing: true,

  contacts: {
    list: [],
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
    editable: false,
    group: {},
  },
}
