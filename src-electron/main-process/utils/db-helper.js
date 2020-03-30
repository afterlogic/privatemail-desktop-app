import _ from 'lodash'

import textUtils from '../../../src/utils/text.js'
import typesUtils from '../../../src/utils/types.js'

function _getPreparedAddress (oAddresses, oDataToLog) {
  if (_.isObject(oAddresses) && _.isArray(oAddresses['@Collection'])) {
    let aAddresses = []
    _.each(oAddresses['@Collection'], function (oAddressData) {
      if (typesUtils.isNonEmptyString(oAddressData.DisplayName)) {
        if (typesUtils.isNonEmptyString(oAddressData.Email)) {
          aAddresses.push(oAddressData.DisplayName + ' <' + oAddressData.Email + '>')
        } else {
          aAddresses.push(oAddressData.DisplayName)
        }
      } else if (typesUtils.isNonEmptyString(oAddressData.Email)) {
        aAddresses.push(oAddressData.Email)
      }
    })
    return aAddresses.join('\n')
  } else {
    if (oAddresses !== null) {
      console.log('oAddresses is not an object: ', oAddresses, oDataToLog)
    }
    return ''
  }
}

export default {
  prepareDataFromDb: function (aRows, aDbFieldsMap) {
    let aItems = []
    _.each(aRows, function (oRow) {
      if (typesUtils.isNonEmptyObject(oRow)) {
        let oItem = {}
        _.each(aDbFieldsMap, function (oItemDbField) {
          let mDbItem = oRow[oItemDbField.DbName]
          if (oItemDbField.IsBool) {
            oItem[oItemDbField.Name] = !!mDbItem
          } else if (oItemDbField.IsArray || oItemDbField.IsObject) {
            let mValue = typesUtils.pStringToJson(mDbItem)
            if (!_.isObject(mValue) || _.isEmpty(mValue)) {
              mValue = oItemDbField.IsArray ? [] : null
            }
            oItem[oItemDbField.Name] = mValue
          } else {
            oItem[oItemDbField.Name] = mDbItem
          }
        })
        aItems.push(oItem)
      }
    })
    return aItems
  },

  prepareInsertParams: function (oItem, aDbFieldsMap) {
    let aParams = []
    _.each(aDbFieldsMap, function (oDbField) {
      if (oDbField.IsArray) {
        let aValue = typesUtils.pArray(oItem[oDbField.Name])
        aParams.push(JSON.stringify(aValue))
      } else if (oDbField.IsObject) {
        let oValue = typesUtils.pObject(oItem[oDbField.Name])
        aParams.push(JSON.stringify(oValue))
      } else {
        aParams.push(oItem[oDbField.Name])
      }
    })
    return aParams
  },

  prepareMessageFields: function (oMessage, iAccountId) {
    oMessage.AccountId = iAccountId

    if (typesUtils.isNonEmptyString(oMessage.Html)) {
      oMessage.TextSearch = textUtils.unescapeHTMLSymbols(textUtils.htmlToTextSearch(oMessage.Html))
    } else if (typesUtils.isNonEmptyString(oMessage.PlainRaw)) {
      oMessage.TextSearch = oMessage.PlainRaw
    }

    let aAttachmentsSearch = []
    if (_.isObject(oMessage.Attachments) && _.isArray(oMessage.Attachments['@Collection'])) {
      _.each(oMessage.Attachments['@Collection'], function (oAttachData) {
        if (!oAttachData.IsLinked) {
          aAttachmentsSearch.push(oAttachData.FileName)
        }
      })
    }
    oMessage.AttachmentsSearch = aAttachmentsSearch.join('\n')

    oMessage.Bcc = _getPreparedAddress(oMessage.Bcc, { Name: 'Bcc', AccountId: oMessage.AccountId, Folder: oMessage.Folder, Uid: oMessage.Uid })
    oMessage.Cc = _getPreparedAddress(oMessage.Cc, { Name: 'Cc', AccountId: oMessage.AccountId, Folder: oMessage.Folder, Uid: oMessage.Uid })
    oMessage.From = _getPreparedAddress(oMessage.From, { Name: 'From', AccountId: oMessage.AccountId, Folder: oMessage.Folder, Uid: oMessage.Uid })
    oMessage.ReplyTo = _getPreparedAddress(oMessage.ReplyTo, { Name: 'ReplyTo', AccountId: oMessage.AccountId, Folder: oMessage.Folder, Uid: oMessage.Uid })
    oMessage.Sender = _getPreparedAddress(oMessage.Sender, { Name: 'Sender', AccountId: oMessage.AccountId, Folder: oMessage.Folder, Uid: oMessage.Uid })
    oMessage.To = _getPreparedAddress(oMessage.To, { Name: 'To', AccountId: oMessage.AccountId, Folder: oMessage.Folder, Uid: oMessage.Uid })
  },
}
