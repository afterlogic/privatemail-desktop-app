import axios from 'axios'
import store from 'src/store'
import prefetcher from 'src/prefetcher.js'
import typesUtils from 'src/utils/types.js'

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
        if (aRequestsNumbers.length === 0) {
          prefetcher.start()
        }
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
  }
}
