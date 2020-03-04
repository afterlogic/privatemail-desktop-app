import typesUtils from './types.js'

export default {
  getText: function (oError, sDefaultText) {
    console.log('oError', oError)
    let sErrorText = typesUtils.pString(sDefaultText)
    if (oError) {
      if (oError.Module === 'Mail') {
        switch (oError.ErrorCode) {
          case 704:
            sErrorText = 'Account with the same login already exists.'
            break
          case 4001:
            sErrorText = 'Error while connecting to mail server.'
            break
        }
      } else {
        switch (oError.ErrorCode) {
          case 102:
            sErrorText = 'The username or password you entered is incorrect.'
            break
        }
      }
      if (typesUtils.isNonEmptyString(oError.ErrorMessage)) {
        sErrorText += ' (' + oError.ErrorMessage + ')'
      }
    }
    return sErrorText
  }
}