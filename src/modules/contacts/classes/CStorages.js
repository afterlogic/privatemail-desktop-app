import typesUtils from '../../../utils/types'

function CStorages(data) {
  storages = []
  this.parse(data)
}

CStorages.prototype.parse = function (data) {
  if (typesUtils.isNonEmptyArray(data)) {
    this.storages = data
  }
}

export default CStorages