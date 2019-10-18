export default {
    namespaced: true,
    storages: {
        list: [],
        downloaded: false,
    },
    currentStorage: {
        name: 'personal',
        downloaded: false,
    },
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
        contact: {}
    },
    contactsToDowload: {
        chunk: [],
        amount: 2,
    },
}