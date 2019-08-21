export default {
  isCorrectEmail: function (sValue) {
    return !!(sValue.match(/^[A-Z0-9\"!#\$%\^\{\}`~&'\+\-=_\.]+@[A-Z0-9\.\-]+$/i))
  },
  getFullEmail: function (sName, sEmail) {
    var sFull = ''
    
    if (sEmail.length > 0) {
      if (sName.length > 0) {
        if (this.isCorrectEmail(sName) || sName.indexOf(',') !== -1) {
          sFull = '"' + sName + '" <' + sEmail + '>'
        } else {
          sFull = sName + ' <' + sEmail + '>'
        }
      } else {
        sFull = sEmail
      }
    } else {
      sFull = sName
    }
    
    return sFull
  },
}
