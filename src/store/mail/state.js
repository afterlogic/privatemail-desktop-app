export default {
  foldersSyncing: false,
  messagesSyncing: false,

  accounts: [],
  currentAccount: null,
  currentIdentities: [],

  currentFolderList: {
    AccountId: 0,
    Namespace: '',
    Count: 0,
    Tree: [],
    Flat: {},
    Names: [],

    Inbox: null,
    Sent: null,
    Drafts: null,
    Spam: null,
    Trash: null,

    Current: null,
  },

  currentMessages: [], // list of messages for current page
  totalMessagesCount: 0,
  currentPage: 1,
  currentFilter: '',
  currentSearch: '',
  currentAdvancedSearch: null,
  messagesPerPage: 20,

  messagesCache: {},
  currentMessage: null,
}
