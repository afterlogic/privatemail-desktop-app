export default {
  getText: function (oError, sDefaultText) {
    console.log('oError', oError)
    let sErrorText = sDefaultText
    if (oError) {
      switch (oError.ErrorCode) {
        case 102:
          sErrorText = 'The username or password you entered is incorrect.'
          break
      }
    }
    return sErrorText
  }
}