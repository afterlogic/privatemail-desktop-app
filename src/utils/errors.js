export default {
  getText: function (error, defaultText) {
    var errorText = defaultText
    if (error) {
      switch (error.Code) {
        case 102:
          errorText = 'The username or password you entered is incorrect.'
          break
      }
    }
    return errorText
  }
}