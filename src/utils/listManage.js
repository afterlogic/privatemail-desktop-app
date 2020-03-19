let listManage = {
  scrollToSelectedItem: function (oScrollArea, iCurrentItemIndex, iItemsCount, bMoveOnTop) {
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
}

export default listManage
