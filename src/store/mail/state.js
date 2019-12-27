export default {
  syncing: false,

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

  allMessageLists: {},
  
  messageList: null, // messages info
  currentMessages: [], // list of messages for current page
  currentPage: 1,
  currentFilter: '',
  currentSearch: '',
  messagesPerPage: 20,

  messagesCache: {},
  currentMessage: null,
}
