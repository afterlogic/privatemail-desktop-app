import _ from 'lodash'
const openpgp = require('openpgp')

import addressUtils from 'src/utils/address.js'
import typesUtils from 'src/utils/types.js'

let
  Enums = {
    'OpenPgpErrors': {
      'UnknownError': 0,
      'UnknownNotice': 1,
      'InvalidArgumentError': 2,
      'GenerateKeyError': 10,
      'ImportKeyError': 20,
      'ImportNoKeysFoundError': 21,
      'PrivateKeyNotFoundError': 30,
      'PublicKeyNotFoundError': 31,
      'KeyIsNotDecodedError': 32,
      'SignError': 40,
      'VerifyError': 41,
      'EncryptError': 42,
      'DecryptError': 43,
      'SignAndEncryptError': 44,
      'VerifyAndDecryptError': 45,
      'CanNotReadMessage': 50,
      'CanNotReadKey': 51,
      'DeleteError': 60,
      'PublicKeyNotFoundNotice': 70,
      'PrivateKeyNotFoundNotice': 71,
      'VerifyErrorNotice': 72,
      'NoSignDataNotice': 73
    },
    'PgpAction': {
      'Import': 'import',
      'Generate': 'generate',
      'Encrypt': 'encrypt',
      'Sign': 'sign',
      'EncryptSign': 'encrypt-sign',
      'Verify': 'ferify',
      'DecryptVerify': 'decrypt-ferify'
    }
  }

/**
 * @constructor
 */
function COpenPgp() {
  this.oKeyring = null
  this.aKeys = []
}

// /**
//  * @return {Array}
//  */
// COpenPgp.prototype.getKeys = function () {
//   return this.aKeys
// }

// /**
//  * @private
//  */
// COpenPgp.prototype.reloadKeysFromStorage = function () {
//   console.log('reloadKeysFromStorage')
//   let
//     aKeys = [],
//     oOpenpgpKeys = this.oKeyring.getAllKeys()
// console.log('oOpenpgpKeys', oOpenpgpKeys)
//   _.each(oOpenpgpKeys, function (oItem) {
//     if (oItem && oItem.primaryKey) {
//       aKeys.push(oItem)
//     }
//   })
// console.log('aKeys', aKeys)
//   this.aKeys = aKeys
// }

/**
 * @private
 * @param {Array} aKeys
 * @return {Array}
 */
COpenPgp.prototype.convertToNativeKeys = async function (aKeys) {
  let aNativeKeys = []

  async function addNativeKey(oKey) {
    let oKeysInfo = await openpgp.key.readArmored(oKey.sArmor)
    aNativeKeys.push(oKeysInfo.keys[0])
  }

  for (const oKey of aKeys) {
    await addNativeKey(oKey)
  }

  return aNativeKeys
}

/**
 * @private
 * @param {Object} oKey
 */
COpenPgp.prototype.cloneKey = async function (oKey) {
  let oPrivateKey = null
  if (oKey) {
    oPrivateKey = await openpgp.key.readArmored(oKey.armor())
    if (oPrivateKey && !oPrivateKey.err && oPrivateKey.keys && oPrivateKey.keys[0]) {
      oPrivateKey = oPrivateKey.keys[0]
      if (!oPrivateKey || !oPrivateKey.primaryKey) {
        oPrivateKey = null
      }
    } else {
      oPrivateKey = null
    }
  }

  return oPrivateKey
}

/**
 * @private
 * @param {Object} oResult
 * @param {Object} oKey
 * @param {string} sPassword
 * @param {string} sKeyEmail
 */
COpenPgp.prototype.decryptKeyHelper = async function (oResult, oKey, sPassword, sKeyEmail) {
  if (oKey && oKey.primaryKey && oKey.primaryKey.isDecrypted() && sPassword === '') {
    //key is encoded with an empty password
  } else if(oKey) {
    try {
      await oKey.decrypt(typesUtils.pString(sPassword))
      if (!oKey || !oKey.primaryKey || !oKey.primaryKey.isDecrypted()) {
        oResult = { iError: Enums.OpenPgpErrors.KeyIsNotDecodedError, sKeyEmail }
      }
    } catch (e) {
      oResult = { oException: e, iError: Enums.OpenPgpErrors.KeyIsNotDecodedError, sKeyEmail }
    }
  } else {
    oResult = { iError: Enums.OpenPgpErrors.KeyIsNotDecodedError, sKeyEmail }
  }
}

/**
 * @param {string} sUserID
 * @param {string} sPassword
 * @param {number} nKeyLength
 * @param {Function} fOkHandler
 * @param {Function} fErrorHandler
 */
COpenPgp.prototype.generateKey = function (sUserID, sPassword, nKeyLength, fOkHandler, fErrorHandler) {
  let
    oEmailParts = addressUtils.getEmailParts(sUserID),
    oOptions = {
      userIds: [{ name: oEmailParts.name, email: oEmailParts.email }],
      numBits: nKeyLength,
      passphrase: sPassword
    }

  openpgp.generateKey(oOptions).then(async (oKeyPair) => {
    // await this.oKeyring.privateKeys.importKey(oKeyPair.privateKeyArmored)
    // await this.oKeyring.publicKeys.importKey(oKeyPair.publicKeyArmored)
    // await this.oKeyring.store()
      if (_.isFunction(fOkHandler)) {
        fOkHandler(oKeyPair)
      }
      // this.reloadKeysFromStorage()
    },
    function (err) {
      if (_.isFunction(fErrorHandler)) {
        fErrorHandler(err)
      }
    }
  )
}

/**
 * @private
 * @param {string} sArmor
 * @return {Array}
 */
COpenPgp.prototype.splitKeys = function (sArmor) {
  let
    aResult = [],
    iCount = 0,
    iLimit = 30,
    aMatch = null,
    sKey = _.trim(sArmor),
    oReg = /[\-]{3,6}BEGIN[\s]PGP[\s](PRIVATE|PUBLIC)[\s]KEY[\s]BLOCK[\-]{3,6}[\s\S]+?[\-]{3,6}END[\s]PGP[\s](PRIVATE|PUBLIC)[\s]KEY[\s]BLOCK[\-]{3,6}/gi

//  If the key doesn't have any additional fields (for example "Version: 1.1"), this transformation corrupts the key.
//  Seems like it is unnecessary transformation. Everything works fine without it.
//  sKey = sKey.replace(/[\r\n]([a-zA-Z0-9]{2,}:[^\r\n]+)[\r\n]+([a-zA-Z0-9\/\\+=]{10,})/g, '\n$1---xyx---$2')
//    .replace(/[\n\r]+/g, '\n').replace(/---xyx---/g, '\n\n')

  do {
    aMatch = oReg.exec(sKey)
    if (!aMatch || 0 > iLimit) {
      break
    }

    if (aMatch[0] && aMatch[1] && aMatch[2] && aMatch[1] === aMatch[2]) {
      if ('PRIVATE' === aMatch[1] || 'PUBLIC' === aMatch[1]) {
        aResult.push([aMatch[1], aMatch[0]])
        iCount++
      }
    }

    iLimit--
  }
  while (true)

  return aResult
}

/**
 * @param {string} sArmor
 * @return {object}
 */
COpenPgp.prototype.importKeys = async function (sArmor) {
  sArmor = _.trim(sArmor)

  let
    iIndex = 0,
    iCount = 0,
    oResult = {},
    aData = null,
    aKeys = []

  if (!sArmor) {
    return { iError: Enums.OpenPgpErrors.InvalidArgumentErrors }
  }

  aKeys = this.splitKeys(sArmor)

  for (iIndex = 0; iIndex < aKeys.length; iIndex++) {
    aData = aKeys[iIndex]
    if ('PRIVATE' === aData[0]) {
      try {
        await this.oKeyring.privateKeys.importKey(aData[1])
        iCount++
      }
      catch (e) {
        oResult = { oException: e, iError: Enums.OpenPgpErrors.ImportKeyError, sType: 'private' }
      }
    }
    else if ('PUBLIC' === aData[0]) {
      try {
        await this.oKeyring.publicKeys.importKey(aData[1])
        iCount++
      } catch (e) {
        oResult = { oException: e, iError: Enums.OpenPgpErrors.ImportKeyError, sType: 'public' }
      }
    }
  }

  if (0 < iCount) {
    await this.oKeyring.store()
  } else {
    oResult = { iError: Enums.OpenPgpErrors.ImportNoKeysFoundError }
  }

  this.reloadKeysFromStorage()

  return oResult
}

/**
 * @param {string} sArmor
 * @return {Array|boolean}
 */
COpenPgp.prototype.getArmorInfo = async function (sArmor) {
  sArmor = _.trim(sArmor)

  let
    iIndex = 0,
    iCount = 0,
    oKey = null,
    aResult = [],
    aData = null,
    aKeys = []

  if (!sArmor) {
    return false
  }

  aKeys = this.splitKeys(sArmor)

  for (iIndex = 0; iIndex < aKeys.length; iIndex++) {
    aData = aKeys[iIndex]
    if ('PRIVATE' === aData[0]) {
      try {
        oKey = await openpgp.key.readArmored(aData[1])
        if (oKey && !oKey.err && oKey.keys && oKey.keys[0]) {
          aResult.push(oKey.keys[0])
        }
        
        iCount++
      } catch (e) {
        aResult.push(null)
      }
    } else if ('PUBLIC' === aData[0]) {
      try {
        oKey = await openpgp.key.readArmored(aData[1])
        if (oKey && !oKey.err && oKey.keys && oKey.keys[0]) {
          aResult.push(oKey.keys[0])
        }

        iCount++
      } catch (e) {
        aResult.push(null)
      }
    }
  }

  return aResult
}

/**
 * @param {string} sID
 * @param {boolean} bPublic
 * @return {object|null}
 */
COpenPgp.prototype.findKeyByID = function (sID, bPublic) {
  bPublic = !!bPublic
  sID = sID.toLowerCase()
  
  let oKey = _.find(this.aKeys, function (oKey) {
    let
      oResult = false,
      aKeys = null
    
    if (oKey && bPublic !== oKey.isPrivate()) {
      aKeys = oKey.getKeyIds()
      if (aKeys) {
        oResult = _.find(aKeys, function (oKey) {
          return oKey && oKey.toHex && sID === oKey.toHex().toLowerCase()
        })
      }
    }
    
    return !!oResult
  })

  return oKey ? oKey : null
}

/**
 * @param {Array} aEmail
 * @param {boolean} bIsPublic
 * @param {object=} oResult
 * @return {Array}
 */
COpenPgp.prototype.findKeysByEmails = function (aEmail, bIsPublic, oResult) {
  bIsPublic = !!bIsPublic
  
  let
    aResult = [],
    aKeys = this.aKeys

  _.each(aEmail, function (sEmail) {

    let oKey = _.find(aKeys, function (oKey) {
      return oKey && bIsPublic === oKey.isPublic() && sEmail === oKey.getEmail()
    })

    if (oKey) {
      aResult.push(oKey)
    } else {
      if (oResult) {
        oResult = { iError: bIsPublic ?
          Enums.OpenPgpErrors.PublicKeyNotFoundError : Enums.OpenPgpErrors.PrivateKeyNotFoundError, sEmail }
      }
    }
  })

  return aResult
}

/**
 * @param {type} aEmail
 * @returns {Array}
 */
COpenPgp.prototype.getPublicKeysIfExistsByEmail = function (sEmail) {
  let
    aResult = [],
    aKeys = this.aKeys,
    oKey = _.find(aKeys, function (oKey) {
      return oKey && oKey.isPublic() === true && sEmail === oKey.getEmail()
    })

  if (oKey) {
    aResult.push(oKey)
  }

  return aResult
}

/**
 * @param {object} oKey
 * @param {string} sPrivateKeyPassword
 * @returns {object}
 */
COpenPgp.prototype.verifyKeyPassword = async function (oKey, sPrivateKeyPassword) {
  let oKeysInfo = await openpgp.key.readArmored(oKey.sArmor)
  let oOpenPgpKey = oKeysInfo.keys[0]
  let sDecodeKeyError = 'You might have entered the wrong password for %USER% key.'
  if (oOpenPgpKey && oOpenPgpKey.primaryKey && oOpenPgpKey.primaryKey.isDecrypted() && sPrivateKeyPassword === '') {
    //key is encoded with an empty password
    return { bVerified: true, oOpenPgpKey }
  } else if (oOpenPgpKey) {
    try {
      await oOpenPgpKey.decrypt(typesUtils.pString(sPrivateKeyPassword))
      if (!oOpenPgpKey || !oOpenPgpKey.primaryKey || !oOpenPgpKey.primaryKey.isDecrypted()) {
        return { bVerified: false, sError: sDecodeKeyError.replace('%USER%', oKey.sEmail) }
      } else {
        return { bVerified: true, oOpenPgpKey }
      }
    } catch (e) {
      return { bVerified: false, sError: sDecodeKeyError.replace('%USER%', oKey.sEmail) }
    }
  } else {
    return { bVerified: false, sError: sDecodeKeyError.replace('%USER%', oKey.sEmail) }
  }
}

/**
 * @param {string} sData
 * @param {string} sAccountEmail
 * @param {string} sFromEmail
 * @param {string} sPrivateKeyPassword = ''
 * @param {Function} fOkHandler
 * @param {Function} fErrorHandler
 * @return {string}
 */
COpenPgp.prototype.decryptAndVerify = async function (sData, sAccountEmail, sFromEmail, sPrivateKeyPassword, fOkHandler, fErrorHandler) {
  let
    oResult = {},
    aPrivateKeys = this.findKeysByEmails([sAccountEmail], false, oResult),
    oPrivateKey = this.convertToNativeKeys(aPrivateKeys)[0],
    oPrivateKeyClone = await this.cloneKey(oPrivateKey),
    aPublicKeys = this.getPublicKeysIfExistsByEmail(sFromEmail),
    oOptions = {
      message: await openpgp.message.readArmored(sData), // parse armored message
      publicKeys: this.convertToNativeKeys(aPublicKeys) // for verification (optional)
    },
    aInvalidSignatures = []

  if (oPrivateKeyClone) {
    await this.decryptKeyHelper(oResult, oPrivateKeyClone, sPrivateKeyPassword, sAccountEmail)
    if (oResult.errors) {
      if (_.isFunction(fErrorHandler)) {
        fErrorHandler(oResult)
      }
    } else {
      oOptions.privateKeys = oPrivateKeyClone // for decryption

      openpgp.decrypt(oOptions).then(async function(oPgpResult) {
        oResult.result = await openpgp.stream.readToEnd(oPgpResult.data)
        //if result contains invalid signatures 
        let aValidityPromises = []
        for (let oSignature of oPgpResult.signatures) {
          aValidityPromises.push(
            oSignature.verified
            .then(validity => {
              return oSignature && validity !== true ? oSignature : null
            })
          )
        }
        Promise.all(aValidityPromises)
        .then(aSignatures => {
          aInvalidSignatures = _.filter(aSignatures, function (oSignature) {
            return oSignature !== null
          })
          if (oPgpResult.signatures.length && aInvalidSignatures.length > 0) {
            oResult = { iNotice: Enums.OpenPgpErrors.VerifyErrorNotice, sFromEmail }
          }

          if (_.isFunction(fOkHandler)) {
            fOkHandler(oResult)
          }
        })
      }, function (e) {
        oResult = { oException: e, iError: Enums.OpenPgpErrors.VerifyAndDecryptError }
        if (_.isFunction(fErrorHandler)) {
          fErrorHandler(oResult)
        }
      })
    }
  } else {
    oResult = { iError: Enums.OpenPgpErrors.PrivateKeyNotFoundError }
    if (_.isFunction(fErrorHandler)) {
      fErrorHandler(oResult)
    }
  }
}

/**
 * @param {string} sData
 * @param {array} aPublicKeys
 * @return {string}
 */
COpenPgp.prototype.verify = async function (sData, aPublicKeys) {
  let oOptions = {
    message: await openpgp.cleartext.readArmored(sData),
    publicKeys: await this.convertToNativeKeys(aPublicKeys) // for verification
  }

  try {
    let oPgpResult = await openpgp.verify(oOptions)
    if (typesUtils.isNonEmptyArray(oPgpResult.signatures) && oPgpResult.signatures[0].valid) {
      return { sVerifiedData: oPgpResult.data }
    } else {
      return { sError: 'Message was not verified.', oPgpResult }
    }
  } catch (oError) {
    return { sError: 'Message was not verified (' + oError.message + ').' }
  }
}

/**
 * @param {string} sData
 * @param {Array} aPublicKeys
 * @return {string}
 */
COpenPgp.prototype.encrypt = async function (sData, aPublicKeys) {
  let oOptions = {
    message: openpgp.message.fromText(sData),
    publicKeys: await this.convertToNativeKeys(aPublicKeys),
  }
  try {
    let oPgpResult = await openpgp.encrypt(oOptions)
    if (oPgpResult && oPgpResult.data) {
      return { sEncryptedData: oPgpResult.data }
    } else {
      return { sError: 'An error occurred during encrypting the message.', oPgpResult }
    }
  } catch (oError) {
    return { sError: 'An error occurred during encrypting the message (' + oError.message + ').' }
  }
}

/**
 * @param {string} sData
 * @param {object} oPrivateKey
 * @param {string} sSignPassword
 * @return {string}
 */
COpenPgp.prototype.sign = async function (sData, oPrivateKey, sSignPassword) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateKey, sSignPassword)
  if (bVerified && oOpenPgpKey) {
    let oOptions = {
      message: openpgp.cleartext.fromText(sData),
      privateKeys: oOpenPgpKey,
    }
    try {
      let oPgpResult = await openpgp.sign(oOptions)
      if (oPgpResult && oPgpResult.data) {
        return { sSignedData: oPgpResult.data }
      } else {
        return { sError: 'An error occurred during signing the message.', oPgpResult }
      }
    } catch (oError) {
      return { sError: 'An error occurred during signing the message (' + oError.message + ').' }
    }
  } else {
    return { sError }
  }
}

/**
 * @param {string} sData
 * @param {Array} aPublicKeys
 * @param {object} oPrivateKey
 * @param {string} sSignPassword
 * @return {string}
 */
COpenPgp.prototype.signAndEncrypt = async function (sData, aPublicKeys, oPrivateKey, sSignPassword) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateKey, sSignPassword)
  if (bVerified && oOpenPgpKey) {
    let oOptions = {
      message: openpgp.message.fromText(sData),
      publicKeys: await this.convertToNativeKeys(aPublicKeys), // for encryption
      privateKeys: oOpenPgpKey, // for signing (optional)
    }
    try {
      let oPgpResult = await openpgp.encrypt(oOptions)
      if (oPgpResult && oPgpResult.data) {
        return { sEncryptedSignedData: oPgpResult.data }
      } else {
        return { sError: 'An error occurred during encrypting or signing the message.', oPgpResult }
      }
    } catch (oError) {
      return { sError: 'An error occurred during encrypting or signing the message (' + oError.message + ').' }
    }
  } else {
    return { sError }
  }
}

/**
 * @param {object} oKey
 */
COpenPgp.prototype.deleteKey = async function (oKey) {
  let oResult = {}
  if (oKey) {
    try {
      this.oKeyring[oKey.isPrivate() ? 'privateKeys' : 'publicKeys'].removeForId(oKey.primaryKey.getFingerprint())
      await this.oKeyring.store()
    } catch (e) {
      oResult = { oException: e, iError: Enums.OpenPgpErrors.DeleteError }
    }
  } else {
    oResult = { iError: oKey ? Enums.OpenPgpErrors.UnknownError : Enums.OpenPgpErrors.InvalidArgumentError }
  }

  this.reloadKeysFromStorage()

  return oResult
}

export default new COpenPgp()
