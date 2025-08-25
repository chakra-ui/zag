import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import type { BottomSheetApi, BottomSheetService } from "./bottom-sheet.types"
import { parts } from "./bottom-sheet.anatomy"
import * as dom from "./bottom-sheet.dom"
import { getEventPoint, getEventTarget, isLeftClick } from "@zag-js/dom-query"

const tap = <T, R>(v: T | null, fn: (v: T) => R): R | undefined => (v != null ? fn(v) : undefined)

export function connect<T extends PropTypes>(
  service: BottomSheetService,
  normalize: NormalizeProps<T>,
): BottomSheetApi<T> {
  const { state, send, context, scope, prop } = service

  function onPointerDown(event: JSX.PointerEvent<HTMLElement>) {
    if (!isLeftClick(event)) return

    const target = getEventTarget<HTMLElement>(event)
    if (target?.hasAttribute("data-no-drag") || target?.closest("[data-no-drag]")) return

    const point = getEventPoint(event)
    context.set("isPointerDown", true)
    send({ type: "GRABBER_POINTERDOWN", point })
  }

  const open = state.hasTag("open")

  return {
    open,
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
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
          transitionDuration: context.get("isDragging") ? "0s" : undefined,
          "--snap-point-height": tap(context.get("snapPointOffset"), (v) => `${v}px`),
          willChange: "transform",
        },
        onPointerDown(event) {
          if (prop("grabberOnly")) return
          onPointerDown(event)
        },
      })
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

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: dom.getBackdropId(scope),
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
        id: dom.getGrabberId(scope),
        onPointerDown(event) {
          onPointerDown(event)
        },
        style: {
          touchAction: "none",
        },
      })
    },

    getGrabberIndicatorProps() {
      return normalize.element({
        ...parts.grabberIndicator.attrs,
        id: dom.getGrabberIndicatorId(scope),
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
