import { isDom, isIos, noop, pipe } from "@ui-machines/utils"
import scrollIntoView from "scroll-into-view-if-needed"
import { addDomEvent } from "./listener"
import { getScrollParent } from "./scrollable"

interface PreventScrollOptions {
  disabled?: boolean
  allowPinchZoom?: boolean
  document?: Document
}

// HTML input types that do not cause the software keyboard to appear.
const nonTextInputTypes = new Set(["checkbox", "radio", "range", "color", "file", "image", "button", "submit", "reset"])

export function preventBodyScroll(opts?: PreventScrollOptions) {
  const { document: docProp, disabled = false, allowPinchZoom } = opts ?? {}

  const doc = docProp ?? document
  const win = doc?.defaultView ?? window

  const viewport = isDom() ? win.visualViewport : null
  const docEl = doc.documentElement

  function preventScrollStandard() {
    const fn = pipe(
      setStyle(docEl, "paddingRight", `${win.innerWidth - docEl.clientWidth}px`),
      setStyle(docEl, "overflow", "hidden"),
    )
    return () => fn?.()
  }

  function preventScrollMobileSafari() {
    let scrollable: HTMLElement | undefined
    let lastY = 0

    let onTouchStart = (e: TouchEvent) => {
      scrollable = getScrollParent(e.target as HTMLElement)

      if (scrollable === docEl && scrollable === doc.body) {
        return
      }
      lastY = e.changedTouches[0].pageY
    }

    let onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && allowPinchZoom) return

      if (!scrollable || scrollable === docEl || scrollable === doc.body) {
        e.preventDefault()
        return
      }

      let y = e.changedTouches[0].pageY
      let scrollTop = scrollable.scrollTop
      let bottom = scrollable.scrollHeight - scrollable.clientHeight

      if ((scrollTop <= 0 && y > lastY) || (scrollTop >= bottom && y < lastY)) {
        e.preventDefault()
      }

      lastY = y
    }

    let onTouchEnd = (e: TouchEvent) => {
      let target = e.target as HTMLElement
      if (target instanceof win.HTMLInputElement && !nonTextInputTypes.has(target.type)) {
        e.preventDefault()
        target.style.transform = "translateY(-2000px)"
        target.focus()
        win.requestAnimationFrame(() => {
          target.style.transform = ""
        })
      }
    }

    let onFocus = (e: FocusEvent) => {
      let target = e.target as HTMLElement
      if (target instanceof win.HTMLInputElement && !nonTextInputTypes.has(target.type)) {
        target.style.transform = "translateY(-2000px)"
        win.requestAnimationFrame(() => {
          target.style.transform = ""
          if (!viewport) return

          if (viewport.height < win.innerHeight) {
            win.requestAnimationFrame(function () {
              scrollIntoView(target, { scrollMode: "if-needed" })
            })
          } else {
            viewport.addEventListener(
              "resize",
              function () {
                scrollIntoView(target, { scrollMode: "if-needed" })
              },
              { once: true },
            )
          }
        })
      }
    }

    let onWindowScroll = () => {
      win.scrollTo(0, 0)
    }

    let scrollX = win.scrollX
    let scrollY = win.scrollY
    let restoreStyles = pipe(
      setStyle(docEl, "paddingRight", `${win.innerWidth - docEl.clientWidth}px`),
      setStyle(docEl, "overflow", "hidden"),
      setStyle(doc.body, "marginTop", `-${scrollY}px`),
    )

    win.scrollTo(0, 0)

    let removeEvents = pipe(
      addDomEvent(doc, "touchstart", onTouchStart, { passive: false, capture: true }),
      addDomEvent(doc, "touchmove", onTouchMove, { passive: false, capture: true }),
      addDomEvent(doc, "touchend", onTouchEnd, { passive: false, capture: true }),
      addDomEvent(doc, "focus", onFocus, true),
      addDomEvent(win, "scroll", onWindowScroll),
    )

    return () => {
      restoreStyles()
      removeEvents()
      win.scrollTo(scrollX, scrollY)
    }
  }

  if (disabled) return noop
  return isIos() ? preventScrollMobileSafari() : preventScrollStandard()
}

function setStyle(el: HTMLElement, key: string, value: string) {
  let cur = el.style[key]
  el.style[key] = value
  return () => {
    el.style[key] = cur
  }
}

// Backup lib: https://github.com/hanai/html-body-scroll-lock
