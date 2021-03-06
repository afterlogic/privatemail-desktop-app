import _ from 'lodash'
import axios from 'axios'
import store from 'src/store'
import typesUtils from 'src/utils/types.js'
import { saveAs } from 'file-saver'

import { ipcRenderer } from 'electron'

// let aRequestsNumbers = []
let oCallbacks = {}
ipcRenderer.on('core-send-web-api-request', (oEvent, { iRequestId, oResult, oError }) => {
  if (_.isFunction(oCallbacks[iRequestId])) {
    oCallbacks[iRequestId](oResult, oError)
    delete oCallbacks[iRequestId]
  }
})

export default {
  // sendRequest: function ({sApiHost, sModule, sMethod, oParameters, fCallback}) {
  //   let url = store.getters['main/getApiHost'] + '/?/Api/'
  //   if (typesUtils.isNonEmptyString(sApiHost)) {
  //     url = sApiHost + '/?/Api/'
  //   }

  //   let oBodyFormData = new FormData()
  //   oBodyFormData.set('Module', sModule)
  //   oBodyFormData.set('Method', sMethod)
  //   oBodyFormData.set('Parameters', JSON.stringify(oParameters))

  //   let sAuthToken = store.getters['user/getAuthToken']
  //   let oHeaders = {
  //     'Content-Type': 'multipart/form-data',
  //   }
  //   if (sAuthToken) {
  //     oHeaders['Authorization'] = 'Bearer ' + sAuthToken
  //   }
  //   let iRequestNumber = Math.random()
  //   aRequestsNumbers.push(iRequestNumber)
  //   axios({
  //     method: 'post',
  //     url,
  //     data: oBodyFormData,
  //     headers: oHeaders,
  //     // transformRequest: [function (data, headers) {
  //     //   console.log('transformRequest', data, headers);
  //     //   return data;
  //     // }],
  //     // withCredentials: false,
  //   })
  //     .then((response) => {
  //       aRequestsNumbers = _.without(aRequestsNumbers, iRequestNumber)
  //       // console.log('webApi response', aRequestsNumbers.length, response)
  //       let bResponseOk = !!response && response.status === 200 && !!response.data
  //       let oResult = bResponseOk && response.data.Result
  //       let oError = null
  //       if (bResponseOk && !oResult && response.data.ErrorCode) {
  //         oError = {
  //           ErrorCode: response.data.ErrorCode,
  //           Module: response.data.Module,
  //         }
  //       }
  //       if (_.isFunction(fCallback)) {
  //         fCallback(oResult, oError)
  //       }
  //       // if (aRequestsNumbers.length === 0) {
  //       // }
  //     })
  //     .catch((oError) => {
  //       aRequestsNumbers = _.without(aRequestsNumbers, iRequestNumber)
  //       console.log('webApi error', aRequestsNumbers.length, oError)
  //       if (_.isFunction(fCallback)) {
  //         fCallback(false, {
  //           ErrorCode: 0,
  //           Module: sModule,
  //           ErrorMessage: oError.message
  //         })
  //       }
  //     })
  // },

  sendRequest: function ({ sApiHost, sModule, sMethod, oParameters, fCallback }) {
    if (!typesUtils.isNonEmptyString(sApiHost)) {
      sApiHost = store.getters['main/getApiHost']
    }
    let sAuthToken = store.getters['user/getAuthToken']
    let iRequestId = Math.random()
    oCallbacks[iRequestId] = fCallback
    ipcRenderer.send('core-send-web-api-request', { iRequestId, sApiHost, sAuthToken, sModule, sMethod, oParameters })
  },

  viewByUrlInNewWindow: function (sViewUrl, sFileName) {
    let url = store.getters['main/getApiHost'] + '/' + sViewUrl

    const electron = require('electron');
    const BrowserWindow = electron.remote.BrowserWindow;

    const window = new BrowserWindow({
      width: 1200,
      height: 600,
    })
    window.loadURL(url)
    window.removeMenu()
    window.setTitle(sFileName)
  },

  downloadByUrl: function (sDownloadUrl, sFileName) {
    let sUrl = store.getters['main/getApiHost'] + '/' + sDownloadUrl

    // Use this part if cookie is set
    let oIframe = document.createElement('iframe')
    oIframe.setAttribute('style', 'display: none;')
    document.body.appendChild(oIframe)
    oIframe.setAttribute('src', sUrl);

    setTimeout(function () {
      oIframe.parentNode.removeChild(oIframe)
    }, 60000)

    // // Use this part if cookie is NOT set
    // let sAuthToken = store.getters['user/getAuthToken']
    // let oHeaders = {}
    // if (sAuthToken) {
    //   oHeaders['Authorization'] = 'Bearer ' + sAuthToken
    // }

    // axios({
    //   method: 'get',
    //   url: sUrl,
    //   headers: oHeaders,
    //   responseType: 'blob',
    // })
    //   .then((oResponse) => {
    //     saveAs(oResponse.data, sFileName)
    //   })
  },
  downloadExportFile: function (oParameters, oFileName) {
    let oHeaders = {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + store.getters['user/getAuthToken']
    }
    let url = store.getters['main/getApiHost'] + '/?/Api/'
    let oBodyFormData = new FormData()
    oBodyFormData.set('Module', 'Contacts')
    oBodyFormData.set('Method', 'Export')
    oBodyFormData.set('Parameters', JSON.stringify(oParameters))
    axios({
      method: 'post',
      url,
      data: oBodyFormData,
      headers: oHeaders
    })
      .then((oResponse) => {
        let resData = oResponse.data.split("\n")
        resData.pop()
        resData = resData.join('\n')
        let oBlob = new Blob([resData])
        saveAs(oBlob, oFileName)
           })
  }
}
