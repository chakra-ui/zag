import { getComputedStyle, isIos, setStyleProperty, setStyle } from "@zag-js/dom-query"

const LOCK_CLASSNAME = "data-scroll-lock"

interface LockState {
  count: number
  cleanup: VoidFunction
}

const lockMap = new WeakMap<Document, LockState>()

function getPaddingProperty(documentElement: HTMLElement) {
  // RTL <body> scrollbar
  const documentLeft = documentElement.getBoundingClientRect().left
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft
  return scrollbarX ? "paddingLeft" : "paddingRight"
}

function hasStableScrollbarGutter(element: HTMLElement): boolean {
  const styles = getComputedStyle(element)
  const scrollbarGutter = styles?.scrollbarGutter
  return scrollbarGutter === "stable" || scrollbarGutter?.startsWith("stable ") === true
}

function applyLock(doc: Document): VoidFunction {
  const win = doc.defaultView ?? window
  const { documentElement, body } = doc

  // Check if scrollbar-gutter: stable is set on html or body
  // If so, the browser already reserves space for the scrollbar
  const hasStableGutter = hasStableScrollbarGutter(documentElement) || hasStableScrollbarGutter(body)

  const scrollbarWidth = win.innerWidth - documentElement.clientWidth

  body.setAttribute(LOCK_CLASSNAME, "")

  const setScrollbarWidthProperty = () => setStyleProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`)
  const paddingProperty = getPaddingProperty(documentElement)

  const setBodyStyle = () => {
    // Only add padding if scrollbar-gutter: stable is not set
    const styles: Record<string, string> = {
      overflow: "hidden",
    }

    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`
    }

    return setStyle(body, styles)
  }

  // Only iOS doesn't respect `overflow: hidden` on document.body
  const setBodyStyleIOS = () => {
    const { scrollX, scrollY, visualViewport } = win

    // iOS 12 does not support `visualViewport`.
    const offsetLeft = visualViewport?.offsetLeft ?? 0
    const offsetTop = visualViewport?.offsetTop ?? 0

    // Only add padding if scrollbar-gutter: stable is not set
    const styles: Record<string, string> = {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0",
    }

    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`
    }

    const restoreStyle = setStyle(body, styles)

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

export function preventBodyScroll(_document?: Document): VoidFunction {
  const doc = _document ?? document

  // Ref-count locks per document so concurrent callers (nested dialogs, React Strict Mode
  // remounts) each get a cleanup that releases their own claim. The DOM mutation only
  // applies on the first lock and only reverts when the last lock releases.
  let state = lockMap.get(doc)
  if (!state) {
    state = { count: 0, cleanup: applyLock(doc) }
    lockMap.set(doc, state)
  }
  state.count++

  const lockState = state
  let released = false
  return () => {
    if (released) return
    released = true
    lockState.count--
    if (lockState.count === 0) {
      lockState.cleanup()
      lockMap.delete(doc)
    }
  }
}
