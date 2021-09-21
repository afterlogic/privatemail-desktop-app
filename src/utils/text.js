import typesUtils from './types.js'

export default {
  getFriendlySize: function (iSizeInBytes) {
    let
      iBytesInKb = 1024,
      iBytesInMb = iBytesInKb * iBytesInKb,
      iBytesInGb = iBytesInKb * iBytesInKb * iBytesInKb

    iSizeInBytes = typesUtils.pInt(iSizeInBytes)

    if (iSizeInBytes >= iBytesInGb) {
      return typesUtils.roundNumber(iSizeInBytes / iBytesInGb, 1) + 'GB'
    } else if (iSizeInBytes >= iBytesInMb) {
      return typesUtils.roundNumber(iSizeInBytes / iBytesInMb, 1) + 'MB'
    } else if (iSizeInBytes >= iBytesInKb) {
      return typesUtils.roundNumber(iSizeInBytes / iBytesInKb, 0) + 'KB'
    }

    return iSizeInBytes + 'B'
  },

  i18n: function (sText) {
    return sText
  },

  encodeHtml: function (sText) {
    return (sText) ? sText.toString()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;') : ''
  },

  htmlToPlain: function (sHtml) {
    return sHtml
      .replace(/([^>]{1})<div>/gi, '$1\n')
      .replace(/<style[^>]*>[^<]*<\/style>/gi, '\n')
      .replace(/<br *\/{0,1}>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<a [^>]*href="([^"]*?)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
  },

  htmlToTextSearch: function (sHtml) {
    return sHtml
      .replace(/([^>]{1})<div>/gi, '$1 ')
      .replace(/<style[^>]*>[^<]*<\/style>/gi, ' ')
      .replace(/<br *\/{0,1}>/gi, '\n')
      .replace(/<\/p>/gi, ' ')
      .replace(/<\/div>/gi, ' ')
      .replace(/<a [^>]*href="([^"]*?)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
  },

  unescapeHTMLSymbols (sText) {
    let htmlEntities = {
      nbsp: ' ',
      cent: '¢',
      pound: '£',
      yen: '¥',
      euro: '€',
      copy: '©',
      reg: '®',
      lt: '<',
      gt: '>',
      quot: '"',
      amp: '&',
      apos: '\'',
    }

    return sText.replace(/\&([^;]+);/g, function (entity, entityCode) {
      let match

      if (entityCode in htmlEntities) {
        return htmlEntities[entityCode]
        /*eslint no-cond-assign: 0*/
      } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
        return String.fromCharCode(parseInt(match[1], 16))
        /*eslint no-cond-assign: 0*/
      } else if (match = entityCode.match(/^#(\d+)$/)) {
        return String.fromCharCode(~~match[1])
      } else {
        return entity
      }
    })
  },
  validateFileOrFolderName (sName) {
    sName = _.trim(sName);
    return '' !== sName && !/["\/\\*?<>|:]/.test(sName);
  }
}
