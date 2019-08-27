import _ from 'lodash'
import webApi from 'src/utils/webApi.js'
import errors from 'src/utils/errors.js'
import notification from 'src/utils/notification.js'

function _getIconName(sType, sFolderFullName) {
  var sIconName = ''
  switch (sType) {
    case 1:
      sIconName = 'mail' // inbox
      break
    case 2:
      sIconName = 'send' // sent
      break
    case 3:
      sIconName = 'insert_drive_file' // drafts
      break
    case 4:
      sIconName = 'error' // spam
      break
    case 5:
      sIconName = 'delete' // trash
      break
    case 7:
      sIconName = 'star' // starred
      break
  }
  if (sFolderFullName === 'Notes') {
    sIconName = 'edit'
  }
  return sIconName;
}

function _prepareFolderList(aFolderListFromServer, oOldFoldersByNames) {
  var aNewFoldersByNames = []
  var aNewFoldersNames = []

  function _recursive(aFolderList) {
    var aNewFolderList = []
    _.each(aFolderList, function (oFolderFromServer) {
      var oOldFolder = oOldFoldersByNames[oFolderFromServer.FullName]
      var oNewFolder = {
        FullName: oFolderFromServer.FullName,
        Name: oFolderFromServer.Name,
        Type: oFolderFromServer.Type,
        IconName: _getIconName(oFolderFromServer.Type, oFolderFromServer.FullName),
        Count: oOldFolder ? oOldFolder.Count : 0,
        UnseenCount: oOldFolder ? oOldFolder.UnseenCount : 0,
        NextUid: oOldFolder ? oOldFolder.NextUid : '',
        Hash: oOldFolder ? oOldFolder.Hash : oFolderFromServer.FullName,
      }
      oNewFolder.SubFolders = (oFolderFromServer.SubFolders && oFolderFromServer.SubFolders['@Collection']) ? _recursive(oFolderFromServer.SubFolders['@Collection']) : []
      aNewFolderList.push(oNewFolder)
      aNewFoldersByNames[oNewFolder.FullName] = oNewFolder
      aNewFoldersNames.push(oNewFolder.FullName)
    })

    return aNewFolderList
  }

  var aResultNewFolderList = _recursive(aFolderListFromServer)

  return {
    folderList: aResultNewFolderList,
    foldersByNames: aNewFoldersByNames,
    foldersNames: aNewFoldersNames,
  }
}

function _prepareFoldersByNames(aStateFolderList) {
  var aNewFoldersByNames = []

  function _recursive(aFolderList) {
    _.each(aFolderList, function (oFolder) {
      aNewFoldersByNames[oFolder.FullName] = oFolder
    })
  }
  _recursive(aStateFolderList)
  
  return aNewFoldersByNames
}

function _getUids(aStateMessageList, iPage) {
  var aUids = []
  var iPageSize = 20
  var iOffset = (iPage - 1) * iPageSize
  var aPagedList = _.drop(aStateMessageList, iOffset).slice(0, iPageSize)

  _.each(aPagedList, function (oMessageInfo) {
    aUids.push(oMessageInfo.uid)
    if (oMessageInfo.thread) {
      _.each(oMessageInfo.thread, function (threadItem) {
        aUids.push(threadItem.uid)
      })
    }
  })

  return aUids
}

export function asyncGetSettings ({ state, commit, dispatch }) {
  if (_.isEmpty(state.foldersByNames) && !_.isEmpty(state.foldersNames)) {
    commit('setFoldersByNames', _prepareFoldersByNames(state.folderList))
  }
  webApi.sendRequest('Mail', 'GetSettings', {}, (oResult, oError) => {
    if (oResult) {
      if (oResult.Accounts && oResult.Accounts[0]) {
        commit('setAccount', oResult.Accounts[0])
        dispatch('asyncGetFolderList')
      }
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting mail settings'))
    }
  })
}

export function logout ({ commit }) {
  commit('setAccount', null)
  commit('setFolderList', null)
  commit('setFoldersByNames', null)
  commit('setFoldersNames', null)
  commit('setFoldersCount', 0)
  commit('setFoldersNamespace', '')
}

export function setCurrentFolder ({ commit, dispatch }, payload) {
  commit('setCurrentFolder', payload)
  dispatch('asyncGetMessagesInfo')
}

export function setCurrentMessage ({ commit, dispatch }, payload) {
  commit('setCurrentMessage', payload)
  if (!payload.IsSeen) {
    dispatch('setMessagesRead', {
      Uids: [payload.Uid],
      IsSeen: true
    })
  }
  if (!payload.Received) {
    dispatch('asyncGetCurrentMessage')
  }
}

export function setMessagesRead ({ state, commit, dispatch }, payload) {
  commit('setMessagesRead', payload)
  webApi.sendRequest('Mail', 'SetMessagesSeen', {AccountID: state.account.AccountID, Folder: state.currentFolder, Uids: payload.Uids.join(','), SetAction: payload.IsSeen}, (oResult, oError) => {
    dispatch('asyncGetFoldersRelevantInformation')
  })
}

export function setAllMessagesRead ({ state, commit, dispatch }) {
  commit('setAllMessagesRead')
  webApi.sendRequest('Mail', 'SetAllMessagesSeen', {AccountID: state.account.AccountID, Folder: state.currentFolder, SetAction: true}, (oResult, oError) => {
    dispatch('asyncGetFoldersRelevantInformation')
  })
}

export function moveMessagesToFolder ({ state, commit, dispatch }, payload) {
  commit('moveMessagesToFolder', payload)
  webApi.sendRequest('Mail', 'MoveMessages', {AccountID: state.account.AccountID, Folder: state.currentFolder, ToFolder: payload.ToFolder, Uids: payload.Uids.join(',')}, (oResult, oError) => {
    dispatch('asyncGetFoldersRelevantInformation')
  })
}

export function setMessageFlagged ({ state, commit, dispatch }, payload) {
  commit('setMessageFlagged', payload)
  webApi.sendRequest('Mail', 'SetMessageFlagged', {AccountID: state.account.AccountID, Folder: state.currentFolder, Uids: payload.Uid, SetAction: payload.Flagged}, (oResult, oError) => {
    dispatch('asyncGetFoldersRelevantInformation')
  })
}

export function asyncGetCurrentMessage ({ state, commit }) {
  webApi.sendRequest('Mail', 'GetMessage', {AccountID: state.account.AccountID, Folder: state.currentFolder, Uid: state.currentMessage.Uid}, (oResult, oError) => {
    if (oResult) {
      commit('updateMessage', oResult)
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting message'))
    }
  })
}

export function asyncGetMessages ({ state, commit }) {
  commit('setSyncing', true)
  webApi.sendRequest('Mail', 'GetMessagesByUids', {AccountID: state.account.AccountID, Folder: state.currentFolder, Uids: _getUids(state.messageList, 1)}, (oResult, oError) => {
    commit('setSyncing', false)
    if (oResult && oResult['@Collection']) {
      commit('setMessagesCache', oResult['@Collection'])
      commit('setCurrentMessages')
    } else {
      notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
    }
  })
}

export function asyncGetMessagesInfo ({ state, commit, dispatch }) {
  webApi.sendRequest('Mail', 'GetMessagesInfo', {AccountID: state.account.AccountID, Folder: state.currentFolder, UseThreading: true, SortBy: 'date', SortOrder: 1}, (oResult, oError) => {
    if (oResult) {
      commit('setMessageList', oResult)
      dispatch('asyncGetMessages')
    } else {
      commit('setSyncing', false)
      notification.showError(errors.getText(oError, 'Error occurred while getting messages info'))
    }
  })
}

export function asyncGetFoldersRelevantInformation ({ state, commit, dispatch }) {
  if (state.account) {
    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetRelevantFoldersInformation', {AccountID: state.account.AccountID, Folders: state.foldersNames, UseListStatusIfPossible: true}, (oResult, oError) => {
      if (oResult && oResult.Counts) {
        commit('setFoldersRelevantInformation', oResult.Counts)
        dispatch('asyncGetMessagesInfo')
      } else {
        commit('setSyncing', false)
        notification.showError(errors.getText(oError, 'Error occurred while getting folders relevant information'))
      }
    })
  } else {
    commit('setSyncing', false)
  }
}

export function asyncGetFolderList ({ state, commit, dispatch }) {
  if (state.account) {
    commit('setSyncing', true)
    webApi.sendRequest('Mail', 'GetFolders', {AccountID: state.account.AccountID}, (oResult, oError) => {
      if (oResult && oResult.Folders && oResult.Folders['@Collection']) {
        var oFolderListData = _prepareFolderList(oResult.Folders['@Collection'], state.foldersByNames || [])
        commit('setFolderList', oFolderListData.folderList)
        commit('setFoldersByNames', oFolderListData.foldersByNames)
        commit('setFoldersNames', oFolderListData.foldersNames)
        commit('setFoldersCount', oResult.Folders['@Count'])
        commit('setFoldersNamespace', oResult.Folders.Namespace)
        dispatch('asyncGetFoldersRelevantInformation')
      } else {
        commit('setSyncing', false)
        notification.showError(errors.getText(oError, 'Error occurred while getting folder list'))
      }
    })
  }
}
