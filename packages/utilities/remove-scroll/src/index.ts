import {
  addDomEvent,
  getComputedStyle,
  getEventTarget,
  getNearestScrollableAncestor,
  isHTMLElement,
  isIos,
  isOverflowElement,
  setStyle,
  setStyleProperty,
} from "@zag-js/dom-query"

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

// html scrolls when it overflows, body otherwise (e.g. app-shell layouts where body is
// permanently hidden and an inner region scrolls instead).
function getScrollContainer(doc: Document): HTMLElement {
  const { documentElement, body } = doc
  return isOverflowElement(documentElement) ? documentElement : body
}

function isInScrollableArea(target: EventTarget | null): boolean {
  if (!isHTMLElement(target)) return false
  const { overflowX, overflowY } = getComputedStyle(target) ?? {}
  const self = /auto|scroll/.test(`${overflowX}${overflowY}`)
  const overflows = target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth
  return (self && overflows) || getNearestScrollableAncestor(target) != null
}

function preventTouchScroll(doc: Document): VoidFunction {
  let start: { id: number; x: number; y: number } | undefined

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    start =
      event.touches.length === 1 && touch ? { id: touch.identifier, x: touch.clientX, y: touch.clientY } : undefined
  }

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) return
    const touch = event.touches[0]
    // subpixel jitter on a tap; cancelling it drops the click
    if (
      start &&
      touch &&
      touch.identifier === start.id &&
      Math.hypot(touch.clientX - start.x, touch.clientY - start.y) <= 0.01
    ) {
      return
    }
    start = undefined
    if (isInScrollableArea(getEventTarget(event))) return
    if (event.cancelable) event.preventDefault()
  }

  const cleanups = [
    addDomEvent(doc, "touchstart", onTouchStart, { passive: true }),
    addDomEvent(doc, "touchmove", onTouchMove, { passive: false }),
  ]

  return () => cleanups.forEach((fn) => fn())
}

function applyLock(doc: Document): VoidFunction {
  const win = doc.defaultView ?? window
  const { documentElement, body } = doc
  const scroller = getScrollContainer(doc)

  // Check if scrollbar-gutter: stable is set on html or body
  // If so, the browser already reserves space for the scrollbar
  const hasStableGutter = hasStableScrollbarGutter(documentElement) || hasStableScrollbarGutter(body)

  const scrollbarWidth = win.innerWidth - documentElement.clientWidth

  body.setAttribute(LOCK_CLASSNAME, "")

  const setScrollbarWidthProperty = () => setStyleProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`)
  const paddingProperty = getPaddingProperty(documentElement)

  const setScrollerStyle = () => {
    // Only add padding if scrollbar-gutter: stable is not set
    const styles: Record<string, string> = {
      overflow: "hidden",
    }

    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`
    }

    return setStyle(scroller, styles)
  }

  // iOS can still touch-scroll past `overflow: hidden`
  const cleanups = [setScrollbarWidthProperty(), setScrollerStyle(), isIos() ? preventTouchScroll(doc) : undefined]

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
