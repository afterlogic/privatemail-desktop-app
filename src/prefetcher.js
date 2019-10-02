import { ipcRenderer } from 'electron'
import store from 'src/store'

import _ from 'lodash'
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
  console.log('on db-get-folders', oDbFolderList)
  if (oDbFolderList && oDbFolderList.Tree) {
    let oFolderList = foldersUtils.prepareFolderListFromDb(oDbFolderList)
    store.commit('mail/setCurrentFolderList', oFolderList)
    console.log('send db-get-messages-info')
    ipcRenderer.send('db-get-messages-info', { iAccountId: oFolderList.AccountId, sFolderFullName: oFolderList.Current.FullName })
  } else {
    store.dispatch('mail/asyncGetFolderList')
  }
})

ipcRenderer.on('db-get-messages-info', (event, { iAccountId, sFolderFullName, oMessagesInfo }) => {
  console.log('on db-get-messages-info', iAccountId, sFolderFullName, oMessagesInfo)
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
})

ipcRenderer.on('db-get-messages', (event, { iAccountId, sFolderFullName, aUids, aMessages }) => {
  console.log('on db-get-messages', iAccountId, sFolderFullName, aUids, aMessages)
  if (aMessages.length > 0) {
    store.commit('updateMessagesCacheFromDb', { iAccountId, sFolderFullName, aMessages })
  }
  if (aMessages.length < aUids.length) {
    let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, sFolderFullName)
    let aMessageList = store.state.mail.allMessageLists[JSON.stringify(oParameters)] || null
    let aUidsToRetrieve = aMessageList === null ? aUids : messagesUtils.getUidsToRetrieve(aMessageList, store.state.mail.messagesCache, iAccountId, sFolderFullName)
    store.dispatch('mail/asyncGetMessages', {
      iAccountId,
      sFolderFullName,
      aUids: aUidsToRetrieve,
    })
  }
})

function _getMessages(oFolder) {
  let bPrefetchStarted = false
  let iAccountId = store.state.mail.currentAccount.AccountID
  let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, oFolder.FullName)
  console.log('oParameters', oParameters)
  let aMessageList = store.state.mail.allMessageLists[JSON.stringify(oParameters)] || null
console.log('_getMessages', aMessageList ? aMessageList.length : 0)
  if (aMessageList === null) {
    store.dispatch('mail/asyncGetMessagesInfo', oFolder.FullName)
    bPrefetchStarted = true
  } else {
    let aUids = messagesUtils.getUidsToRetrieve(aMessageList, store.state.mail.messagesCache, iAccountId, oFolder.FullName)
    console.log('aUids', aUids)
    if (aUids.length > 0) {
      console.log('send db-get-messages')
      ipcRenderer.send('db-get-messages', { iAccountId, sFolderFullName: oFolder.FullName, aUids })
      bPrefetchStarted = true
    }
  }

  return bPrefetchStarted
}

function _getMessagesBodies(oFolder) {
  let bPrefetchStarted = false
  let iAccountId = store.state.mail.currentAccount.AccountID

  let aUids = messagesUtils.getUidsToRetrieveBodies(store.state.mail.messageList, store.state.mail.messagesCache, iAccountId, oFolder.FullName)
  if (aUids.length > 0) {
    store.dispatch('mail/asyncGetMessagesBodies', {
      iAccountId,
      sFolderFullName: oFolder.FullName,
      aUids,
    })
    bPrefetchStarted = true
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
    if (iCurrentAccountId > 0) {
      bAllowPrefetch = false
      bFoldersRetrieved = false
      bFoldersFirstRefreshed = false
      console.log('send db-get-folders')
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
      console.log('send db-get-messages-info')
      ipcRenderer.send('db-get-messages-info', { iAccountId: iCurrentAccountId, sFolderFullName: store.state.mail.currentFolderList.Current.FullName })
    }
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
          if (!bPrefetchStarted) {
            bPrefetchStarted = _getMessagesBodies(oFolder)
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
