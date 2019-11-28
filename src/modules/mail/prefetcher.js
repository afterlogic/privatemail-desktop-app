import { ipcRenderer } from 'electron'
import store from 'src/store'
import _ from 'lodash'

import typesUtils from 'src/utils/types.js'

import foldersUtils from 'src/store/mail/utils/folders.js'
import messagesUtils from 'src/store/mail/utils/messages.js'

function _getFoldersToRefresh () {
  let oCurrent = store.state.mail.currentFolderList.Current
  let oInbox = store.state.mail.currentFolderList.Inbox
  let oSent = store.state.mail.currentFolderList.Sent
  let oDrafts = store.state.mail.currentFolderList.Drafts
  let aFoldersToRefresh = []

  if (oCurrent) {
    aFoldersToRefresh.push(oCurrent)
  }
  if (oInbox && (!oCurrent || oInbox.FullName !== oCurrent.FullName)) {
    aFoldersToRefresh.push(oInbox)
  }
  if (oSent && (!oCurrent || oSent.FullName !== oCurrent.FullName)) {
    aFoldersToRefresh.push(oSent)
  }
  if (oDrafts && (!oCurrent || oDrafts.FullName !== oCurrent.FullName)) {
    aFoldersToRefresh.push(oDrafts)
  }

  return aFoldersToRefresh
}

function _getMessagesInfo(oFolder) {
  let bPrefetchStarted = false
  if (oFolder.HasChanges) {
    store.dispatch('mail/asyncGetMessagesInfo', oFolder.FullName)
    bPrefetchStarted = true
  }

  return bPrefetchStarted
}

ipcRenderer.on('db-get-folders', (event, oDbFolderList) => {
  if (store.state.mail.currentAccount) {
    if (oDbFolderList && oDbFolderList.Tree) {
      let oFolderList = foldersUtils.prepareFolderListFromDb(oDbFolderList)
      store.commit('mail/setCurrentFolderList', oFolderList)
      prefetcher.foldersRelevantInfoReceived()
    } else {
      store.dispatch('mail/asyncGetFolderList')
    }
  }
})

ipcRenderer.on('db-get-messagesinfo', (event, { iAccountId, sFolderFullName, oMessagesInfo }) => {
  if (store.state.mail.currentAccount && store.state.mail.currentAccount.AccountID === iAccountId) {
    bAllowPrefetch = true
    if (oMessagesInfo) {
      let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, sFolderFullName)
      store.commit('mail/setMessagesInfo', {
        Parameters: oParameters,
        MessagesInfo: oMessagesInfo,
      })

      let bCurrentFolder = sFolderFullName === store.getters['mail/getСurrentFolderFullName']
      if (bCurrentFolder) {
        store.commit('mail/setCurrentMessages')
      }
      prefetcher.start()
    } else {
      store.dispatch('mail/asyncGetMessagesInfo', sFolderFullName)
    }
  }
})

ipcRenderer.on('db-get-messages', (event, { iAccountId, sFolderFullName, aUids, sSearch, sFilter, aMessages }) => {
  if (store.state.mail.currentAccount && store.state.mail.currentAccount.AccountID === iAccountId) {
    if (typesUtils.isNonEmptyArray(aUids)) {
      if (aMessages.length > 0) {
        store.commit('mail/updateMessagesCacheFromDb', { iAccountId, sFolderFullName, aMessages })
        let bCurrentFolder = sFolderFullName === store.getters['mail/getСurrentFolderFullName']
        if (bCurrentFolder) {
          store.commit('mail/setCurrentMessages')
        }
        prefetcher.start()
      }
      if (aMessages.length < aUids.length) {
        let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, sFolderFullName)
        let aMessageList = store.state.mail.allMessageLists[JSON.stringify(oParameters)] || null
        let aUidsToRetrieve = aMessageList === null ? aUids : messagesUtils.getUidsToRetrieve(aMessageList, store.state.mail.messagesCache, iAccountId, sFolderFullName)
        if (aUidsToRetrieve.length > 0) {
          store.dispatch('mail/asyncGetMessages', {
            iAccountId,
            sFolderFullName,
            aUids: aUidsToRetrieve,
          })
        }
      }
    } else {
      store.commit('mail/updateMessagesCacheFromDb', { iAccountId, sFolderFullName, aMessages })
      store.commit('mail/setCurrentFilter', sFilter)
      store.commit('mail/setCurrentSearch', sSearch)
      store.commit('mail/setCurrentFolder', sFolderFullName)
      store.commit('mail/setCurrentFolderChanged')
      store.commit('mail/setСurrentPage', 1)
      let aMessagesInfo = _.map(aMessages, function (oMessage) {
        let aFlags = []
        if (oMessage.IsAnswered) {
          aFlags.push('\\answered')
        }
        if (oMessage.IsFlagged) {
          aFlags.push('\\flagged')
        }
        if (oMessage.IsForwarded) {
          aFlags.push('$forwarded')
        }
        if (oMessage.IsSeen) {
          aFlags.push('\\seen')
        }
        return {
          NeedPopulateThread: false,
          flags: aFlags,
          thread: [],
          uid: oMessage.Uid
        }
      })
      let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, sFolderFullName)
      store.commit('mail/setMessagesInfo', {
        Parameters: oParameters,
        MessagesInfo: aMessagesInfo,
      })
      store.commit('mail/setCurrentMessages')
      let oСurrentMessage = store.getters['mail/getСurrentMessage']
      if (oСurrentMessage && oСurrentMessage.Folder !== sFolderFullName) {
        store.commit('mail/setCurrentMessage', null)
      }
    }
  }
})

function _getMessages(oFolder) {
  let bPrefetchStarted = false
  let iAccountId = store.state.mail.currentAccount.AccountID
  let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, oFolder.FullName)
  let aMessageList = store.state.mail.allMessageLists[JSON.stringify(oParameters)] || null
  if (aMessageList === null) {
    store.dispatch('mail/asyncGetMessagesInfo', oFolder.FullName)
    bPrefetchStarted = true
  } else {
    let aUids = messagesUtils.getUidsToRetrieve(aMessageList, store.state.mail.messagesCache, iAccountId, oFolder.FullName)
    if (aUids.length > 0) {
      ipcRenderer.send('db-get-messages', { iAccountId, sFolderFullName: oFolder.FullName, aUids })
      bPrefetchStarted = true
    }
  }

  return bPrefetchStarted
}

let iCurrentAccountId = 0
let bAllowPrefetch = false
let bFoldersRetrieved = false
let bFoldersFirstRefreshed = false

let prefetcher = {
  currentAccountChanged: function () {
    iCurrentAccountId = store.state.mail.currentAccount ? store.state.mail.currentAccount.AccountID : 0
    bAllowPrefetch = false
    bFoldersRetrieved = false
    bFoldersFirstRefreshed = false
    if (iCurrentAccountId > 0) {
      ipcRenderer.send('db-get-folders', iCurrentAccountId)
    }
  },
  foldersReceived: function () {
    if (!bFoldersRetrieved) {
      bFoldersRetrieved = true
    }
  },
  foldersRelevantInfoReceived: function () {
    if (!bFoldersFirstRefreshed) {
      bFoldersFirstRefreshed = true
      ipcRenderer.send('db-get-messagesinfo', { iAccountId: iCurrentAccountId, sFolderFullName: store.state.mail.currentFolderList.Current.FullName })
    }
  },
  checkMail: function () {
    store.commit('mail/setCurrentFolderChanged')
    store.dispatch('mail/asyncGetFoldersRelevantInformation', store.getters['mail/getDisplayedFolders'])
  },
  start: function () {
    if (bAllowPrefetch) {
      if (!bFoldersRetrieved) {
        store.dispatch('mail/asyncGetFolderList')
        bFoldersRetrieved = true
        bFoldersFirstRefreshed = false
      } else if (!bFoldersFirstRefreshed) {
        store.dispatch('mail/asyncGetFoldersRelevantInformation', store.state.mail.currentFolderList.Names)
        bFoldersFirstRefreshed = true
      } else {
        let aFoldersToRefresh = _getFoldersToRefresh()
        let bPrefetchStarted = false
        _.each(aFoldersToRefresh, function (oFolder) {
          bPrefetchStarted = _getMessagesInfo(oFolder)
          if (!bPrefetchStarted) {
            bPrefetchStarted = _getMessages(oFolder)
          }
          if (bPrefetchStarted) {
            return false // break each
          }
        })
      }
    }
  },
}

export default prefetcher
