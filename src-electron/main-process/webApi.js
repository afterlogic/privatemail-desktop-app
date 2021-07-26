import _ from 'lodash'
import http from 'http'
import https from 'https'
import querystring from 'querystring'
import { machineIdSync } from 'node-machine-id'

import typesUtils from '../../src/utils/types.js'

const sMachineId = machineIdSync(true)
let oRequest = null
let aRequestsNumbers = []

export default {
  sendRequest: function ({sApiHost, sAuthToken, sModule, sMethod, oParameters, fCallback}) {
/*    if (oRequest !== null) {
      oRequest.abort()
      oRequest = null
    }*/
    let protocol = http
    let iPort = 80
    if (_.trim(sApiHost).indexOf('https://') === 0) {
      protocol = https
      iPort = 443
    }

    let oPostData = querystring.stringify({
      'Module': sModule,
      'Method': sMethod,
      'Parameters': typesUtils.isNonEmptyObject(oParameters) ? JSON.stringify(oParameters) : '{}',
    })

    let sHostPath = sApiHost.replace('https://', '').replace('http://', '')
    let aHostPath = sHostPath.split('/')
    let sHostName = aHostPath.shift()
    if (aHostPath.length > 0 && aHostPath[aHostPath.length - 1] === '') {
      aHostPath.pop()
    }
    aHostPath.unshift('')
    aHostPath.push('?')
    aHostPath.push('Api')
    aHostPath.push('')
    let oOptions = {
      hostname: sHostName,
      port: iPort,
      path: aHostPath.join('/'),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(oPostData),
        'X-DeviceId': sMachineId,
      },
    }
    if (typesUtils.isNonEmptyString(sAuthToken)) {
      oOptions.headers['Authorization'] = 'Bearer ' + sAuthToken
    }

    let iRequestNumber = Math.random()
    aRequestsNumbers.push(iRequestNumber)

    try {
      let aData = []
      oRequest = protocol.request(oOptions, (oResponse) => {
        oResponse.setEncoding('utf8')

        oResponse.on('data', (sData) => {
          aData.push(sData)
        })

        oResponse.on('end', () => {
          let sData = aData.join('')
          let oData = typesUtils.pStringToJson(sData)
          aRequestsNumbers = _.without(aRequestsNumbers, iRequestNumber)
          // console.log('webApi response', aRequestsNumbers.length, oData)
          let oResult = oData && oData.Result
          let oError = null
          if (!oResult && oData && (oData.ErrorCode || oData.ErrorMessage)) {
            oError = {
              ErrorCode: oData.ErrorCode,
              ErrorMessage: oData.ErrorMessage,
              Module: oData.Module,
            }
          }
          if (_.isFunction(fCallback)) {
            fCallback(oResult, oError)
          }
          // if (aRequestsNumbers.length === 0) {
          // }
        })
      })

      oRequest.on('error', (oError) => {
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

      oRequest.write(oPostData)
      oRequest.end()
    } catch (oCatchedError) {
      console.log('oCatchedError', oCatchedError)
      console.log('oOptions', oOptions)
      console.log('oPostData', oPostData)
      console.log('aData', aData)
    }
  },
}
