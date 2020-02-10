import _ from 'lodash'
import axios from 'axios'
import store from 'src/store'
import typesUtils from 'src/utils/types.js'
import { saveAs } from 'file-saver'

let aRequestsNumbers = []

export default {
  sendRequest: function ({sApiHost, sModule, sMethod, oParameters, fCallback}) {
    let url = store.getters['main/getApiHost'] + '/?/Api/'
    if (typesUtils.isNonEmptyString(sApiHost)) {
      url = sApiHost + '/?/Api/'
    }

    let oBodyFormData = new FormData()
    oBodyFormData.set('Module', sModule)
    oBodyFormData.set('Method', sMethod)
    oBodyFormData.set('Parameters', JSON.stringify(oParameters))

    let sAuthToken = store.getters['user/getAuthToken']
    let oHeaders = {
      'Content-Type': 'multipart/form-data',
    }
    if (sAuthToken) {
      oHeaders['Authorization'] = 'Bearer ' + sAuthToken
    }
    let iRequestNumber = Math.random()
    aRequestsNumbers.push(iRequestNumber)
    axios({
      method: 'post',
      url,
      data: oBodyFormData,
      headers: oHeaders,
      // transformRequest: [function (data, headers) {
      //   console.log('transformRequest', data, headers);
    
      //   return data;
      // }],
      // withCredentials: false,
    })
      .then((response) => {
        aRequestsNumbers = _.without(aRequestsNumbers, iRequestNumber)
        // console.log('webApi response', aRequestsNumbers.length, response)
        let bResponseOk = !!response && response.status === 200 && !!response.data
        let oResult = bResponseOk && response.data.Result
        let oError = null
        if (bResponseOk && !oResult && response.data.ErrorCode) {
          oError = {
            ErrorCode: response.data.ErrorCode,
            Module: response.data.Module,
          }
        }
        if (_.isFunction(fCallback)) {
          fCallback(oResult, oError)
        }
        // if (aRequestsNumbers.length === 0) {
        // }
      })
      .catch((oError) => {
        aRequestsNumbers = _.without(aRequestsNumbers, iRequestNumber)
        console.log('webApi error', aRequestsNumbers.length, oError)
        if (_.isFunction(fCallback)) {
          fCallback(false, {
            ErrorCode: 0,
            Module: sModule,
            ErrorMessage: oError.message
          })
        }
      })
  },

  viewByUrlInNewWindow: function (sViewUrl, sFileName) {
    let url = store.getters['main/getApiHost'] + '/' + sViewUrl
    window.open(url, sFileName)
  },

  downloadByUrl: function (sDownloadUrl, sFileName) {
    let url = store.getters['main/getApiHost'] + '/' + sDownloadUrl

    let sAuthToken = store.getters['user/getAuthToken']
    let oHeaders = {}
    if (sAuthToken) {
      oHeaders['Authorization'] = 'Bearer ' + sAuthToken
    }

    axios({
      method: 'get',
      url,
      headers: oHeaders,
      responseType: 'blob',
    })
      .then((oResponse) => {
        saveAs(oResponse.data, sFileName)
      })
  },
}
