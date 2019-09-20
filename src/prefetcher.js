import store from 'src/store'

import _ from 'lodash'
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
      store.dispatch('mail/asyncGetMessages', {
        iAccountId,
        sFolderFullName: oFolder.FullName,
        aUids,
      })
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
let bFoldersRetrieved = false
let bFoldersFirstRefreshed = false

export default {
  start: function () {
    if (store.state.mail.currentAccount) {
      if (!bFoldersRetrieved || iCurrentAccountId !== store.state.mail.currentAccount.AccountID) {
        store.dispatch('mail/asyncGetFolderList')
        iCurrentAccountId = store.state.mail.currentAccount.AccountID
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
