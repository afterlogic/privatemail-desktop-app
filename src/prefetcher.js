import store from 'src/store'

import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'
import messagesUtils from 'src/store/mail/utils/messages.js'

function _getFoldersToRefresh () {
  let oCurrent = store.state.mail.currentFolder
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


function _setSyncing(bCurrentFolder, bSyncing) {
  if (bCurrentFolder) {
    store.commit('mail/setSyncing', bSyncing)
  }
}

function _asyncGetMessagesInfo (sFolderFullName, bCurrentFolder) {
  _setSyncing(bCurrentFolder, true)
  let oParameters = messagesUtils.getMessagesInfoParameters(store.state.mail.currentAccount.AccountID, sFolderFullName)
  webApi.sendRequest('Mail', 'GetMessagesInfo', oParameters, (oResult, oError) => {
    _setSyncing(bCurrentFolder, false)
    if (oResult) {
      store.commit('mail/setMessagesInfo', {
        Parameters: oParameters,
        MessagesInfo: oResult,
      })
      if (bCurrentFolder) {
        store.commit('mail/setCurrentMessages')
      }
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
    }
  })
}

export function _asyncGetMessages (iAccountId, sFolderFullName, aUids, bCurrentFolder) {
    _setSyncing(bCurrentFolder, true)
    webApi.sendRequest('Mail', 'GetMessagesByUids', {AccountID: iAccountId, Folder: sFolderFullName, Uids: aUids}, (oResult, oError) => {
      _setSyncing(bCurrentFolder, false)
      if (oResult && oResult['@Collection']) {
        store.commit('mail/updateMessagesCache', {
          AccountId: iAccountId,
          Messages: oResult['@Collection'],
        })
        store.commit('mail/setCurrentMessages')
        store.dispatch('mail/asyncGetMessagesBodies')
      } else {
        notification.showError(errors.getText(oError, 'Error occurred while getting messages'))
      }
    })
}

export default {
  start: function () {
    if (store.state.mail.currentAccount) {
      this.refreshAll()
    }
  },
  refreshAll: function () {
    let sFolderFullNameToRefresh = ''
    let aFoldersToRefresh = _getFoldersToRefresh()
    _.each(aFoldersToRefresh, function (oFolder) {
      if (oFolder.HasChanges) {
        sFolderFullNameToRefresh = oFolder.FullName
        return false // break each
      }
    })
  
    let sСurrentFolderFullName = store.getters['mail/getСurrentFolderFullName']
    if (sFolderFullNameToRefresh !== '') {
      _asyncGetMessagesInfo(sFolderFullNameToRefresh, sСurrentFolderFullName === sFolderFullNameToRefresh)
    } else {
      let iAccountId = store.state.mail.currentAccount.AccountID
      _.each(aFoldersToRefresh, function (oFolder) {
        let oParameters = messagesUtils.getMessagesInfoParameters(iAccountId, oFolder.FullName)
        let aMessageList = store.state.mail.allMessageLists[JSON.stringify(oParameters)] || null
        if (aMessageList === null) {
          _asyncGetMessagesInfo(oFolder.FullName, sСurrentFolderFullName === oFolder.FullName)
        } else {
          let aUids = messagesUtils.getUidsToRetrieve(aMessageList, store.state.mail.messagesCache, iAccountId, oFolder.FullName)
          if (aUids.length > 0) {
            _asyncGetMessages (iAccountId, oFolder.FullName, aUids, sСurrentFolderFullName === oFolder.FullName)
            return false // break each
          }
        }
      })
    }

  // if (state.messageList === null) {
  //   // dispatch('asyncGetMessagesInfo')
  // } else if (state.currentMessages.length === 0 && state.messageList.length > 0) {
  //   dispatch('asyncGetMessages')
  // }
  },
}
