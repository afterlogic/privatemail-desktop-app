import CStorages from '../../modules/contacts/classes/CStorages'

export default {
  storages: new CStorages(),
  // allContactsInfo: {
  //     'personal': {
  //         downloaded: false,
  //         CTag: null,
  //         list: [],
  //         contactsUUIDs: [],
  //         contactsETags: [],
  //         contacts: {
  //             list: [],
  //             downloaded: false,
  //         },
  //     } ...
  // },
  contactsInfo: {
    downloaded: false,
    list: [],
    CTag: null,
    contactsUUIDs: [],
    contactsETags: [],
  },
  contacts: {
    list: [],
    downloaded: false,
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
}
