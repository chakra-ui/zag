import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send, SnapPoint, MachineContext } from "./bottom-sheet.types"
import { parts } from "./bottom-sheet.anatomy"
import { dom } from "./bottom-sheet.dom"
import { getNativeEvent, isLeftClick } from "@zag-js/dom-event"
import { contains, dataAttr, isHTMLElement } from "@zag-js/dom-query"

const tap = <T, R>(v: T | null, fn: (v: T) => R): R | undefined => (v != null ? fn(v) : undefined)

function shouldGestureMoveSheet(event: PointerEvent, ctx: MachineContext) {
  let move = true
  for (const el of event.composedPath()) {
    if (!isHTMLElement(el)) continue
    const contentEl = dom.getContentEl(ctx)
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

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const open = state.hasTag("open")

  return {
    open,
    setOpen(_open: boolean) {},
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
      id: dom.getContentId(state.context),
      role: "dialog",
      "aria-modal": "true",
      hidden: !open,
      "data-state": open ? "open" : "closed",
      "data-visible": dataAttr(state.context.visible),
      style: {
        transform: tap(state.context.dragOffset, (v) => `translate3d(0, ${v}px, 0)`),
        "--snap-point-height": tap(state.context.snapPointOffset, (v) => `${v}px`),
        willChange: "transform",
      },
    }),

    headerProps: normalize.element({
      ...parts.header.attrs,
    }),

    backdropProps: normalize.element({
      ...parts.backdrop.attrs,
      hidden: !open,
      "data-visible": dataAttr(state.context.visible),
      style: {
        willChange: "opacity",
      },
    }),

    grabberProps: normalize.element({
      ...parts.grabber.attrs,
      onPointerDown(event) {
        const evt = getNativeEvent(event)

        if (!shouldGestureMoveSheet(evt, state.context)) return
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
