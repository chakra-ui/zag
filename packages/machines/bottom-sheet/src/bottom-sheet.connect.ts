import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { SnapPoint, BottomSheetService } from "./bottom-sheet.types"
import { parts } from "./bottom-sheet.anatomy"
import * as dom from "./bottom-sheet.dom"
import { getNativeEvent, isLeftClick } from "@zag-js/dom-query"
import { contains, dataAttr, isHTMLElement } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

const tap = <T, R>(v: T | null, fn: (v: T) => R): R | undefined => (v != null ? fn(v) : undefined)

function shouldGestureMoveSheet(event: PointerEvent, scope: Scope) {
  let move = true
  for (const el of event.composedPath()) {
    if (!isHTMLElement(el)) continue
    const contentEl = dom.getContentEl(scope)
    if (!contains(contentEl, el)) continue
    if (el.scrollWidth > el.clientWidth) {
      move = false
    }
    if (el.scrollHeight > el.clientHeight && el.scrollHeight <= 0) {
      move = false
    }
  }
  return move
}

export function connect<T extends PropTypes>(service: BottomSheetService, normalize: NormalizeProps<T>) {
  const { state, send, context, scope, computed } = service

  const open = state.hasTag("open")

  return {
    open,
    setOpen(nextOpen: boolean) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "open" : "close" })
    },
    snapToIndex(index: number) {},
    snapToPoint(point: SnapPoint) {},
    snapToMaxPoint() {},
    snapToMinPoint() {},

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      type: "button",
      onClick() {
        send({ type: open ? "close" : "open" })
      },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(scope),
      role: "dialog",
      "aria-modal": "true",
      hidden: !open,
      "data-state": open ? "open" : "closed",
      "data-visible": dataAttr(context.get("visible")),
      style: {
        transform: tap(context.get("dragOffset"), (v) => `translate3d(0, ${v}px, 0)`),
        "--snap-point-height": tap(computed("snapPointOffset"), (v) => `${v}px`),
        willChange: "transform",
      },
    }),

    headerProps: normalize.element({
      ...parts.header.attrs,
    }),

    backdropProps: normalize.element({
      ...parts.backdrop.attrs,
      hidden: !open,
      "data-visible": dataAttr(context.get("visible")),
      style: {
        willChange: "opacity",
      },
    }),

    grabberProps: normalize.element({
      ...parts.grabber.attrs,
      onPointerDown(event) {
        const evt = getNativeEvent(event)

        if (!shouldGestureMoveSheet(evt, scope)) return
        if (!isLeftClick(event)) return

        event.currentTarget.setPointerCapture(event.pointerId)

        const point = { x: event.clientX, y: event.clientY, timestamp: event.timeStamp }
        send({ type: "grabber.pointerdown", point })
      },
      onPointerUp(event) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      },
      style: {
        touchAction: "none",
      },
    }),

    closeTriggerProps: normalize.button({
      type: "button",
      ...parts.closeTrigger.attrs,
      onClick() {
        send({ type: "close" })
      },
    }),
  }
}
