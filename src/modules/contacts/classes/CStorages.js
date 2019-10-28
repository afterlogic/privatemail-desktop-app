import _ from 'lodash'

const aStoragesData = [
  {
    name: 'all',
    text: 'All',
  },
  {
    name: 'personal',
    text: 'Personal',
  },
  {
    name: 'team',
    text: 'Team',
  },
  {
    name: 'shared',
    text: 'Shared',
  },
]

function CStorages() {
  this.storages = []
  this.currentStorage = ''
}

CStorages.prototype.parse = function (mData) {
  if (_.isArray(mData)) {
    this.storages = mData
    let sCurrentStorage = this.currentStorage
    if (this.storages.length > 0) {
      if (_.indexOf(this.storages, this.currentStorage) === -1) {
        if (_.indexOf(this.storages, 'personal') !== -1) {
          sCurrentStorage = 'personal'
        } else {
          sCurrentStorage = this.storages[0]
        }
      }
    } else {
      sCurrentStorage = ''
    }
    this.currentStorage = sCurrentStorage
  }
}

CStorages.prototype.getList = function () {
  return _.filter(aStoragesData, (oStorageData) => {
    return _.indexOf(this.storages, oStorageData.name) !== -1
  })
}

CStorages.prototype.setCurrentStorage = function (sCurrentStorage) {
  this.currentStorage = sCurrentStorage
}

CStorages.prototype.getCurrentStorage = function () {
  return this.currentStorage
}

export default CStorages
