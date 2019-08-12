import axios from 'axios'

export default {
  sendRequest: function (module, method, parameters, callback) {
    const url = 'http://aurora-platform.dev.com/?/Api/'

    var bodyFormData = new FormData()
    bodyFormData.set('Module', module)
    bodyFormData.set('Method', method)
    bodyFormData.set('Parameters', JSON.stringify(parameters))

    axios({
      method: 'post',
      url: url,
      data: bodyFormData,
      config: { headers: {'Content-Type': 'multipart/form-data' }},
    })
      .then((response) => {
        console.log('webApi response', response)
        var responseOk = response && response.status === 200 && response.data
        var result = responseOk && response.data.Result
        var error = null
        if (responseOk && !result && response.data.ErrorCode) {
          error = {
            Code: response.data.ErrorCode,
            Module: response.data.Module,
          }
        }
        callback(result, error)
      })
      .catch((error) => {
        console.log('webApi error', error)
        callback(false, null)
      })
  }
}