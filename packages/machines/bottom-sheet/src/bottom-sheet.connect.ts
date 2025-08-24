import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { BottomSheetApi, BottomSheetService } from "./bottom-sheet.types"
import { parts } from "./bottom-sheet.anatomy"
import * as dom from "./bottom-sheet.dom"
import { isLeftClick } from "@zag-js/dom-query"

const tap = <T, R>(v: T | null, fn: (v: T) => R): R | undefined => (v != null ? fn(v) : undefined)

export function connect<T extends PropTypes>(
  service: BottomSheetService,
  normalize: NormalizeProps<T>,
): BottomSheetApi<T> {
  const { state, send, context, scope } = service

  const open = state.hasTag("open")

  return {
    open,
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        type: "button",
        onClick() {
          send({ type: open ? "CLOSE" : "OPEN" })
        },
      })
    },
    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: "dialog",
        "aria-modal": "true",
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          transform: tap(context.get("dragOffset"), (v) => `translate3d(0, ${v}px, 0)`),
          ...(state.matches("panning") && {
            transitionDuration: "0s",
          }),
          "--snap-point-height": tap(context.get("snapPointOffset"), (v) => `${v}px`),
          willChange: "transform",
        },
      })
    },
    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          willChange: "opacity",
        },
      })
    },
    getGrabberProps() {
      return normalize.element({
        ...parts.grabber.attrs,
        onPointerDown(event) {
          if (!isLeftClick(event)) return

          const point = { x: event.clientX, y: event.clientY }
          send({ type: "GRABBER_POINTERDOWN", point })
        },
        style: {
          touchAction: "none",
        },
      })
    },
    getGrabberIndicatorProps() {
      return normalize.element({
        ...parts.grabberIndicator.attrs,
      })
    },
    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        id: dom.getCloseTriggerId(scope),
        onClick() {
          send({ type: "CLOSE" })
        },
      })
    },
  }
}
