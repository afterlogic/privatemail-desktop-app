export default {
  syncing: false,

  currentAccount: null,

  allFolderLists: {},
  currentFolderList: {
    Tree: [],
    Flat: {},
    Names: [],
    Count: 0,
    Namespace: '',
  },
  currentFolder: null,

  messageList: null,
  messagesCache: {},
  currentMessages: [],
  currentMessage: null,
}
