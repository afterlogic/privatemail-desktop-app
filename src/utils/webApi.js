import axios from 'axios'
import store from 'src/store'
import prefetcher from 'src/prefetcher.js'

let aRequestsNumbers = []

export default {
  sendRequest: function (module, method, parameters, callback) {
    const url = 'http://test.afterlogic.com/?/Api/'

    let oBodyFormData = new FormData()
    oBodyFormData.set('Module', module)
    oBodyFormData.set('Method', method)
    oBodyFormData.set('Parameters', JSON.stringify(parameters))

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
            Code: response.data.ErrorCode,
            Module: response.data.Module,
          }
        }
        if (_.isFunction(callback)) {
          callback(oResult, oError)
        }
        // TODO
        // if (aRequestsNumbers.length === 0) {
        //   prefetcher.start()
        // }
      })
      .catch((oError) => {
        aRequestsNumbers = _.without(aRequestsNumbers, iRequestNumber)
        console.log('webApi error', aRequestsNumbers.length, oError)
        if (_.isFunction(callback)) {
          callback(false, null)
        }
      })
  }
}
