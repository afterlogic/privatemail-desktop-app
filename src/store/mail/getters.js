
export function getSyncing (state) {
  return state.syncing
}

export function getCurrentAccount (state) {
  return state.currentAccount
}

export function getCurrentFoldersTree (state) {
  return state.currentFolderList.Tree
}

export function getСurrentMessages (state) {
  return state.currentMessages
}

export function getСurrentMessage (state) {
  return state.currentMessage
}

export function getСurrentFolderFullName (state) {
  return state.currentFolderList.Current ? state.currentFolderList.Current.FullName : ''
}

export function getInboxFullName (state) {
  return state.currentFolderList.Inbox ? state.currentFolderList.Inbox.FullName : ''
}

export function getDisplayedFolders (state) {
  let aDisplayedFolders = _.filter(state.currentFolderList.Flat, function (oFolder) {
    return oFolder.Exists && oFolder.IsSelectable && oFolder.IsSubscribed
  })
  return _.map(aDisplayedFolders, function (oFolder) {
    return oFolder.FullName
  })
}
