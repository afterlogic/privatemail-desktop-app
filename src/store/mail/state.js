export default {
  syncing: false,

  currentAccount: null,

  allFolderLists: {},
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
  
  messageList: null,
  messagesCache: {},
  currentMessages: [],
  currentMessage: null,
}
