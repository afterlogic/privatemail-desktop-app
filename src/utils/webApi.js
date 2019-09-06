import axios from 'axios'
import store from 'src/store'
import prefetcher from 'src/prefetcher.js'

export default {
  sendRequest: function (module, method, parameters, callback) {
    const url = 'http://aurora.dev.com/?/Api/'

    var bodyFormData = new FormData()
    bodyFormData.set('Module', module)
    bodyFormData.set('Method', method)
    bodyFormData.set('Parameters', JSON.stringify(parameters))

    var authToken = store.getters['user/getAuthToken']
    var headers = {'Content-Type': 'multipart/form-data'}
    if (authToken) {
      headers['Authorization'] = 'Bearer ' + authToken
    }
    axios({
      method: 'post',
      url,
      data: bodyFormData,
      headers,
    })
      .then((response) => {
        var responseOk = response && response.status === 200 && response.data
        var result = responseOk && response.data.Result
        var error = null
        if (responseOk && !result && response.data.ErrorCode) {
          error = {
            Code: response.data.ErrorCode,
            Module: response.data.Module,
          }
        }
        if (_.isFunction(callback)) {
          callback(result, error)
        }
        prefetcher.start()
      })
      .catch((error) => {
        console.log('webApi error', error)
        if (_.isFunction(callback)) {
          callback(false, null)
        }
      })
  }
}
