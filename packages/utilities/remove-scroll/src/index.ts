import { isIos, setStyleProperty, setStyle } from "@zag-js/dom-query"

const LOCK_CLASSNAME = "data-scroll-lock"

function getPaddingProperty(documentElement: HTMLElement) {
  // RTL <body> scrollbar
  const documentLeft = documentElement.getBoundingClientRect().left
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft
  return scrollbarX ? "paddingLeft" : "paddingRight"
}

export function preventBodyScroll(_document?: Document) {
  const doc = _document ?? document
  const win = doc.defaultView ?? window

  const { documentElement, body } = doc

  const locked = body.hasAttribute(LOCK_CLASSNAME)
  if (locked) return

  body.setAttribute(LOCK_CLASSNAME, "")

  const scrollbarWidth = win.innerWidth - documentElement.clientWidth
  const setScrollbarWidthProperty = () => setStyleProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`)
  const paddingProperty = getPaddingProperty(documentElement)

  const setBodyStyle = () =>
    setStyle(body, {
      overflow: "hidden",
      [paddingProperty]: `${scrollbarWidth}px`,
    })

  // Only iOS doesn't respect `overflow: hidden` on document.body
  const setBodyStyleIOS = () => {
    const { scrollX, scrollY, visualViewport } = win

    // iOS 12 does not support `visualViewport`.
    const offsetLeft = visualViewport?.offsetLeft ?? 0
    const offsetTop = visualViewport?.offsetTop ?? 0

    const restoreStyle = setStyle(body, {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0",
      [paddingProperty]: `${scrollbarWidth}px`,
    })

    return () => {
      restoreStyle?.()
      win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" })
    }
  }

  const cleanups = [setScrollbarWidthProperty(), isIos() ? setBodyStyleIOS() : setBodyStyle()]

  return () => {
    cleanups.forEach((fn) => fn?.())
    body.removeAttribute(LOCK_CLASSNAME)
  }
}
