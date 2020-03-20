let hotkeys = {
  scrollToSelectedItem (oScrollArea, iCurrentItemIndex, iItemsCount, bMoveOnTop) {
    if (oScrollArea) {
      let
        iOffset = 20,
        iScrollPosition = oScrollArea.scrollPosition,
        iContainerHeight = oScrollArea.containerHeight,
        iSelectedHeight = oScrollArea.scrollSize / iItemsCount,
        iSelectedTop = iSelectedHeight * iCurrentItemIndex
      
      if (iSelectedTop < iScrollPosition || iSelectedTop + iSelectedHeight > iScrollPosition + iContainerHeight) {
        let iNewPosition = 0
        if (iSelectedTop < iScrollPosition || bMoveOnTop) {
          iNewPosition = iSelectedTop - iOffset
        } else {
          iNewPosition = iScrollPosition + iSelectedTop - (iScrollPosition + iContainerHeight) + iSelectedHeight + iOffset
        }
        oScrollArea.setScrollPosition(iNewPosition)
      }
    }
  },

  isTextFieldFocused () {
    let
      mTag = document && document.activeElement ? document.activeElement : null,
      mTagName = mTag ? mTag.tagName : null,
      mTagType = mTag && mTag.type ? mTag.type.toLowerCase() : null,
      mContentEditable = mTag ? mTag.contentEditable : null

    return ('INPUT' === mTagName && (mTagType === 'text' || mTagType === 'password' || mTagType === 'email' || mTagType === 'search')) ||
      'TEXTAREA' === mTagName || 'IFRAME' === mTagName || mContentEditable === 'true'
  },
}

export default hotkeys
