import store from 'src/store'
import _ from 'lodash'

const openpgp = require('openpgp')

import addressUtils from 'src/utils/address.js'
import typesUtils from 'src/utils/types.js'

/**
 * @constructor
 */
function COpenPgp() {
  this.oKeyring = null
  this.aKeys = []
}

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
 * @param {String} sUserID
 * @param {String} sPassword
 * @param {Number} nKeyLength
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
      if (_.isFunction(fOkHandler)) {
        fOkHandler(oKeyPair)
      }
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
 * @param {String} sArmor
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
 * @param {String} sEmail
 * @return {Boolean}
 */
COpenPgp.prototype.isOwnEmail = function (sEmail)
{
  if (store.getters['user/getUserPublicId'] === sEmail) {
    return true
  }

  let aOwnEmails = store.getters['mail/getAllAccountsFullEmails']
  return (_.find(aOwnEmails, sOwnEmail => {
    let oEmailParts = addressUtils.getEmailParts(sOwnEmail);
    return sEmail === oEmailParts.email
  }) != undefined) ? true : false;
}

/**
 * @param {String} sArmor
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
 * @param {String} sEmail
 * @param {Function} fAskForKeyPassword
 * @returns {Promise}
 */
COpenPgp.prototype.getPrivateOwnKeyAndPassphrase = function (sEmail, fAskForKeyPassword) {
  return new Promise(async (resolve, reject) => {
    let
      aPrivateKeys = this.getOwnKeysByEmails([sEmail], false),
      oPrivateKey = typesUtils.isNonEmptyArray(aPrivateKeys) ? aPrivateKeys[0] : null

    if (oPrivateKey) {
      let sPassphrase = oPrivateKey.getPassphrase()
      if (sPassphrase === null) {
        fAskForKeyPassword(oPrivateKey.sEmail, async (sPassphrase) => {
          let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateKey, sPassphrase)
          if (bVerified) {
            oPrivateKey.setPassphrase(sPassphrase)
            resolve({ oPrivateKey, sPassphrase })
          } else {
            resolve({ sError })
          }
        })
      } else {
        resolve({ oPrivateKey, sPassphrase })
      }
    } else {
      resolve({ sError: 'No private key found for ' + sEmail + ' user.' })
    }
  })
}

/**
 * @param {Object} oKey
 * @param {String} sPassphrase
 * @returns {Object}
 */
COpenPgp.prototype.verifyKeyPassword = async function (oKey, sPassphrase) {
  let oKeysInfo = await openpgp.key.readArmored(oKey.sArmor)
  let oOpenPgpKey = oKeysInfo.keys[0]
  let sDecodeKeyError = 'You might have entered the wrong password for %USER% key.'
  if (oOpenPgpKey && oOpenPgpKey.primaryKey && oOpenPgpKey.primaryKey.isDecrypted() && sPassphrase === '') {
    //key is encoded with an empty password
    return { bVerified: true, oOpenPgpKey }
  } else if (oOpenPgpKey) {
    try {
      await oOpenPgpKey.decrypt(typesUtils.pString(sPassphrase))
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
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {Array} aPublicKeys
 * @param {Function} fAskForKeyPassword
 * @return {Promise}
 */
COpenPgp.prototype.decryptAndVerifyText = function (sData, oPrivateKey, aPublicKeys, fAskForKeyPassword) {
  return new Promise(async (resolve, reject) => {
    let sPassphrase = oPrivateKey.getPassphrase()
    if (sPassphrase === null) {
      fAskForKeyPassword(oPrivateKey.sEmail, (sPassphrase) => {
        resolve(this.decryptAndVerifyTextWithPassphrase(sData, oPrivateKey, sPassphrase, aPublicKeys))
      })
    } else {
      resolve(this.decryptAndVerifyTextWithPassphrase(sData, oPrivateKey, sPassphrase, aPublicKeys))
    }
  })
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {String} sPassphrase
 * @param {Array} aPublicKeys
 * @return {Object}
 */
COpenPgp.prototype.decryptAndVerifyTextWithPassphrase = async function (sData, oPrivateKey, sPassphrase, aPublicKeys) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateKey, sPassphrase)
  if (bVerified && oOpenPgpKey) {
    oPrivateKey.setPassphrase(sPassphrase)
    let oOptions = {
      message: await openpgp.message.readArmored(sData),
      privateKeys: [oOpenPgpKey], // for decryption
    }
    if (typesUtils.isNonEmptyArray(aPublicKeys)) {
      oOptions.publicKeys = await this.convertToNativeKeys(aPublicKeys) // for verification (optional)
    }
    try {
      let oPgpResult = await openpgp.decrypt(oOptions)
      if (oPgpResult && oPgpResult.data) {
        let oResult = { sDecryptedData: await openpgp.stream.readToEnd(oPgpResult.data) }
        if (_.isArray(oPgpResult.signatures) && oPgpResult.signatures.length === 0) {
          oResult.sReport = 'Message was successfully decrypted and it was not signed while creating.'
        } else if (typesUtils.isNonEmptyArray(oPgpResult.signatures) && oPgpResult.signatures[0].valid) {
          oResult.sReport = 'Message was successfully decrypted and verified.'
        } else {
          oResult.sReport = 'Message was successfully decrypted but not verified.'
        }
        return oResult
      } else {
        return { sError: 'An error occurred during decrypting the message.' }
      }
    } catch (oError) {
      return { sError: 'An error occurred during decrypting the message (' + oError.message + ').' }
    }
  } else {
    return { sError }
  }
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @return {Object}
 */
COpenPgp.prototype.verifyText = async function (sData, aPublicKeys) {
  let oOptions = {
    message: await openpgp.cleartext.readArmored(sData),
    publicKeys: await this.convertToNativeKeys(aPublicKeys), // for verification
  }

  try {
    let oPgpResult = await openpgp.verify(oOptions)
    if (typesUtils.isNonEmptyArray(oPgpResult.signatures) && oPgpResult.signatures[0].valid) {
      return { sVerifiedData: oPgpResult.data }
    } else {
      return { sError: 'Message was not verified.' }
    }
  } catch (oError) {
    return { sError: 'Message was not verified (' + oError.message + ').' }
  }
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @return {Object}
 */
COpenPgp.prototype.encryptText = async function (sData, aPublicKeys) {
  let oOptions = {
    message: openpgp.message.fromText(sData),
    publicKeys: await this.convertToNativeKeys(aPublicKeys),
  }
  try {
    let oPgpResult = await openpgp.encrypt(oOptions)
    if (oPgpResult && oPgpResult.data) {
      return { sEncryptedData: oPgpResult.data }
    } else {
      return { sError: 'An error occurred during encrypting the message.' }
    }
  } catch (oError) {
    return { sError: 'An error occurred during encrypting the message (' + oError.message + ').' }
  }
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {Function} fAskForKeyPassword
 * @return {Promise}
 */
COpenPgp.prototype.signText = function (sData, oPrivateKey, fAskForKeyPassword) {
  return new Promise(async (resolve, reject) => {
    let sPassphrase = oPrivateKey.getPassphrase()
    if (sPassphrase === null) {
      fAskForKeyPassword(oPrivateKey.sEmail, (sPassphrase) => {
        resolve(this.signTextWithPassphrase(sData, oPrivateKey, sPassphrase))
      })
    } else {
      resolve(this.signTextWithPassphrase(sData, oPrivateKey, sPassphrase))
    }
  })
}

/**
 * @param {String} sData
 * @param {Object} oPrivateKey
 * @param {String} sPassphrase
 * @return {Object}
 */
COpenPgp.prototype.signTextWithPassphrase = async function (sData, oPrivateKey, sPassphrase) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateKey, sPassphrase)
  if (bVerified && oOpenPgpKey) {
    oPrivateKey.setPassphrase(sPassphrase)
    let oOptions = {
      message: openpgp.cleartext.fromText(sData),
      privateKeys: oOpenPgpKey,
    }
    try {
      let oPgpResult = await openpgp.sign(oOptions)
      if (oPgpResult && oPgpResult.data) {
        return { sSignedData: oPgpResult.data }
      } else {
        return { sError: 'An error occurred during signing the message.' }
      }
    } catch (oError) {
      return { sError: 'An error occurred during signing the message (' + oError.message + ').' }
    }
  } else {
    return { sError }
  }
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @param {Object} oPrivateKey
 * @param {Function} fAskForKeyPassword
 * @return {Promise}
 */
COpenPgp.prototype.signAndEncryptText = function (sData, aPublicKeys, oPrivateKey, fAskForKeyPassword) {
  return new Promise(async (resolve, reject) => {
    let sPassphrase = oPrivateKey.getPassphrase()
    if (sPassphrase === null) {
      fAskForKeyPassword(oPrivateKey.sEmail, (sPassphrase) => {
        resolve(this.signAndEncryptTextWithPassphrase(sData, aPublicKeys, oPrivateKey, sPassphrase))
      })
    } else {
      resolve(this.signAndEncryptTextWithPassphrase(sData, aPublicKeys, oPrivateKey, sPassphrase))
    }
  })
}

/**
 * @param {String} sData
 * @param {Array} aPublicKeys
 * @param {Object} oPrivateKey
 * @param {String} sPassphrase
 * @return {Object}
 */
COpenPgp.prototype.signAndEncryptTextWithPassphrase = async function (sData, aPublicKeys, oPrivateKey, sPassphrase) {
  let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateKey, sPassphrase)
  if (bVerified && oOpenPgpKey) {
    oPrivateKey.setPassphrase(sPassphrase)
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
        return { sError: 'An error occurred during encrypting or signing the message.' }
      }
    } catch (oError) {
      return { sError: 'An error occurred during encrypting or signing the message (' + oError.message + ').' }
    }
  } else {
    return { sError }
  }
}

/**
 * @return {Array}
 */
COpenPgp.prototype.getAllKeys = function () {
  let
    aOwnOpenPgpKeys = store.getters['main/getOpenPgpKeys'],
    aExternalOpenPgpKeys = store.getters['contacts/getOpenPgpExternalKeys'],
    aAllOpenPgpKeys = aOwnOpenPgpKeys.concat(aExternalOpenPgpKeys)

  return aAllOpenPgpKeys;
}

/**
 * @return {Object|null}
 */
COpenPgp.prototype.getCurrentPrivateOwnKey = function () {
  let
    aOpenPgpKeys = store.getters['main/getOpenPgpKeys'],
    oCurrentAccount = store.getters['mail/getCurrentAccount'],
    oPrivateCurrentKey = _.find(aOpenPgpKeys, (oKey) => {
      let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
      return !oKey.bPublic && oKeyEmail.email === oCurrentAccount.sEmail
    })

  if (oPrivateCurrentKey) {
    return oPrivateCurrentKey
  } else {
    notification.showError('No private key found for ' + oCurrentAccount.sEmail + ' user.')
    return null
  }
},

/**
 * @param {Array} aEmail
 * @param {Boolean} bIsPublic
 * @return {Array}
 */
COpenPgp.prototype.getOwnKeysByEmails = function (aEmail, bIsPublic) {
  bIsPublic = !!bIsPublic

  let aOpenPgpKeys = store.getters['main/getOpenPgpKeys']
  let aResult = []

  _.each(aEmail, sEmail => {
    let oKey = _.find(aOpenPgpKeys, (oKey) => {
      let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
      return oKey.bPublic === bIsPublic && oKeyEmail.email === sEmail
    })

    if (oKey) {
      aResult.push(oKey)
    }
  })

  return aResult
}

/**
 * @param {String} sEmail
 * @return {Object|null}
 */
COpenPgp.prototype.getPrivateKeyByEmail = function (sEmail) {
  let aOpenPgpKeys = store.getters['main/getOpenPgpKeys']
  let aPrivateKeys = _.filter(aOpenPgpKeys, (oKey) => {
    let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
    return !oKey.bPublic && oKeyEmail.email === sEmail
  })
  if (aPrivateKeys.length > 0) {
    return aPrivateKeys[0]
  } else {
    return null
  }
}

/**
 * @param {String} sEmail
 * @return {Object|null}
 */
COpenPgp.prototype.getPublicKeyByEmail = function (sEmail) {
  let oPublicKey = _.find(this.getAllKeys(), (oKey) => {
    let oKeyEmail = addressUtils.getEmailParts(oKey.sEmail)
    return oKey.bPublic && oKeyEmail.email === sEmail
  })
  return oPublicKey ? oPublicKey : null
}

/**
 * @return {String}
 */
COpenPgp.prototype.generatePassword = function () {
  let sPassword = ''

  if (window.crypto) {
    let oPassword = window.crypto.getRandomValues(new Uint8Array(10))
    sPassword = btoa(String.fromCharCode.apply(null, oPassword))
    sPassword = sPassword.replace(/[^A-Za-z0-9]/g, '')
  } else {
    const sSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!;%:?*()_+='
    for (let i = 0; i < this.iPasswordLength; i++) {
      sPassword += sSymbols.charAt(Math.floor(Math.random() * sSymbols.length))
    }
  }

  return sPassword
}

/**
 * @param {Mixed} mData
 * @param {String} sUserEmail
 * @param {String} sPrincipalsEmail
 * @param {Boolean} bPasswordBasedEncryption
 * @param {Boolean} bSign
 * @param {Function} fAskForKeyPassword
 * @return {Object}
 */
COpenPgp.prototype.encryptData = async function (mData, sUserEmail, sPrincipalsEmail, bPasswordBasedEncryption, bSign, fAskForKeyPassword) {
  return new Promise(async (resolve, reject) => {
    if (!bPasswordBasedEncryption && bSign) {
      let oPrivateUserKey = this.getPrivateKeyByEmail(sUserEmail)
      if (oPrivateUserKey) {
        let sPassphrase = oPrivateUserKey.getPassphrase()
        if (sPassphrase === null) {
          fAskForKeyPassword(oPrivateUserKey.sEmail, async (sPassphrase) => {
            let oResult = await this.encryptDataWithPassphrase(mData, sUserEmail, oPrivateUserKey, sPrincipalsEmail, bPasswordBasedEncryption, bSign, sPassphrase)
            oResult.sPassphrase = sPassphrase
            resolve(oResult)
          })
        } else {
          let oResult = await this.encryptDataWithPassphrase(mData, sUserEmail, oPrivateUserKey, sPrincipalsEmail, bPasswordBasedEncryption, bSign, sPassphrase)
          oResult.sPassphrase = sPassphrase
          resolve(oResult)
        }
      } else {
        return { sError: 'No private key found for ' + sUserEmail + ' user.' }
      }
    } else {
      resolve(this.encryptDataWithPassphrase(mData, sUserEmail, null, sPrincipalsEmail, bPasswordBasedEncryption, bSign, null))
    }
  })
}

/**
 * @param {Mixed} mData
 * @param {String} sUserEmail
 * @param {String} sPrincipalsEmail
 * @param {Boolean} bPasswordBasedEncryption
 * @param {Boolean} bSign
 * @param {String} sPassphrase
 * @return {Object}
 */
COpenPgp.prototype.encryptDataWithPassphrase = async function (mData, sUserEmail, oPrivateUserKey, sPrincipalsEmail, bPasswordBasedEncryption, bSign, sPassphrase) {
  let
    sPassword = '',
    bIsBlob = mData instanceof Blob,
    oOptions = {}

  if (bIsBlob) {
    let oBuffer = await new Response(mData).arrayBuffer()
    oOptions.message = openpgp.message.fromBinary(new Uint8Array(oBuffer))
    oOptions.armor = false
    mData = null
    oBuffer = null
  } else {
    oOptions.message = openpgp.message.fromText(mData)
  }

  if (bPasswordBasedEncryption) {
    sPassword = this.generatePassword()
    oOptions.passwords = [sPassword]
  } else {
    let aPublicKeys = []
    let oPrincipalPublicKey = this.getPublicKeyByEmail(sPrincipalsEmail)
    if (oPrincipalPublicKey) {
      aPublicKeys.push(oPrincipalPublicKey)
    } else {
      return { sError: 'No public key found for ' + sPrincipalsEmail + ' user.' }
    }
    let oUserPublicKey = this.getPublicKeyByEmail(sUserEmail)
    if (oUserPublicKey) {
      aPublicKeys.push(oUserPublicKey)
    }
    oOptions.publicKeys = await this.convertToNativeKeys(aPublicKeys)
  }

  if (!bPasswordBasedEncryption && bSign && oPrivateUserKey) {
    let { bVerified, oOpenPgpKey, sError } = await this.verifyKeyPassword(oPrivateUserKey, sPassphrase)
    if (bVerified && oOpenPgpKey) {
      oPrivateUserKey.setPassphrase(sPassphrase)
      oOptions.privateKeys = [oOpenPgpKey]
    } else {
      return { sError }
    }
  }

  try {
    let oPgpResult = await openpgp.encrypt(oOptions)
    if (oPgpResult && (oPgpResult.data || bIsBlob && oPgpResult.message)) {
      return {
        sEncryptedData: bIsBlob ? oPgpResult.message.packets.write() : oPgpResult.data,
        sPassword,
      }
    } else {
      return { sError: 'An error occurred during encrypting the data.' }
    }
  } catch (oError) {
    return { sError: 'An error occurred during encrypting the data (' + oError.message + ').' }
  }
}

export default new COpenPgp()
