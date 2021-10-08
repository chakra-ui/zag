// Check this implementation as well: https://github.com/hanai/html-body-scroll-lock
// The current implementation is inspired by react-aria's `usePreventScroll`

import scrollIntoView from "scroll-into-view-if-needed"
import { addDomEvent } from "tiny-dom-event"
import { getScrollParent } from "tiny-dom-query/scrollable"
import { cast, pipe } from "tiny-fn"
import { isDom, isIos } from "tiny-guard"

interface PreventScrollOptions {
  disabled?: boolean
  environment?: { window: Window; document: Document }
}

// HTML input types that do not cause the software keyboard to appear.
const nonTextInputTypes = new Set(["checkbox", "radio", "range", "color", "file", "image", "button", "submit", "reset"])

export class PreventScroll {
  private win: Window & typeof globalThis
  private doc: Document
  private disabled: boolean

  constructor(opts?: PreventScrollOptions) {
    this.doc = opts?.environment?.document ?? document
    this.win = cast(opts?.environment?.window ?? window)
    this.disabled = opts?.disabled ?? false
  }

  private get viewport() {
    return isDom() ? this.win.visualViewport : null
  }

  private get docEl() {
    return this.doc.documentElement
  }

  apply = () => {
    if (this.disabled) return
    const prevent = isIos() ? this.preventScrollMobileSafari : this.preventScrollStandard
    return prevent()
  }

  private preventScrollStandard = () => {
    return pipe(
      this.setStyle(this.docEl, "paddingRight", `${this.win.innerWidth - this.docEl.clientWidth}px`),
      this.setStyle(this.docEl, "overflow", "hidden"),
    )
  }

  private preventScrollMobileSafari = () => {
    let scrollable: HTMLElement | undefined
    let lastY = 0

    let onTouchStart = (e: TouchEvent) => {
      scrollable = getScrollParent(e.target as HTMLElement)
      if (scrollable === this.docEl && scrollable === this.doc.body) {
        return
      }
      lastY = e.changedTouches[0].pageY
    }

    let onTouchMove = (e: TouchEvent) => {
      if (!scrollable || scrollable === this.docEl || scrollable === this.doc.body) {
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
      if (target instanceof this.win.HTMLInputElement && !nonTextInputTypes.has(target.type)) {
        e.preventDefault()
        target.style.transform = "translateY(-2000px)"
        target.focus()
        requestAnimationFrame(() => {
          target.style.transform = ""
        })
      }
    }

    let onFocus = (e: FocusEvent) => {
      let target = e.target as HTMLElement
      if (target instanceof this.win.HTMLInputElement && !nonTextInputTypes.has(target.type)) {
        target.style.transform = "translateY(-2000px)"
        requestAnimationFrame(() => {
          target.style.transform = ""
          if (!this.viewport) return

          if (this.viewport.height < this.win.innerHeight) {
            requestAnimationFrame(function () {
              scrollIntoView(target, { scrollMode: "if-needed" })
            })
          } else {
            this.viewport.addEventListener(
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
      this.win.scrollTo(0, 0)
    }

    let scrollX = this.win.pageXOffset
    let scrollY = this.win.pageYOffset
    let restoreStyles = pipe(
      this.setStyle(this.docEl, "paddingRight", `${this.win.innerWidth - this.docEl.clientWidth}px`),
      this.setStyle(this.docEl, "overflow", "hidden"),
      this.setStyle(this.doc.body, "marginTop", `-${scrollY}px`),
    )

    this.win.scrollTo(0, 0)

    let removeEvents = pipe(
      addDomEvent(this.doc, "touchstart", onTouchStart, { passive: false, capture: true }),
      addDomEvent(this.doc, "touchmove", onTouchMove, { passive: false, capture: true }),
      addDomEvent(this.doc, "touchend", onTouchEnd, { passive: false, capture: true }),
      addDomEvent(this.doc, "focus", onFocus, true),
      addDomEvent(this.win, "scroll", onWindowScroll),
    )

    return () => {
      restoreStyles()
      removeEvents()
      this.win.scrollTo(scrollX, scrollY)
    }
  }

  setStyle = (element: HTMLElement, style: string, value: string) => {
    let cur = element.style[style]
    element.style[style] = value
    return () => {
      element.style[style] = cur
    }
  }
}
