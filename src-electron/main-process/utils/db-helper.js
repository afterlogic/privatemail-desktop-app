import _ from 'lodash'

import typesUtils from '../../../src/utils/types.js'

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
            let mValue = oItemDbField.IsArray ? [] : null
            let sValue = mDbItem
            if (typesUtils.isNonEmptyString(sValue)) {
              mValue = JSON.parse(sValue)
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
}
