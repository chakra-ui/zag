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

    if (state.matches("closing")) return

    const point = getEventPoint(event)
    send({ type: "POINTER_DOWN", point })
  }

  const open = state.hasTag("open")
  const dragging = state.hasTag("dragging")

  const translate = context.get("dragOffset") ?? context.get("resolvedActiveSnapPoint")?.offset

  return {
    open,
    activeSnapPoint: context.get("activeSnapPoint"),

    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },

    setActiveSnapPoint(snapPoint) {
      const activeSnapPoint = context.get("activeSnapPoint")
      if (activeSnapPoint === snapPoint) return
      send({ type: "SET_ACTIVE_SNAP_POINT", snapPoint })
    },

    getContentProps(props = { draggable: true }) {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": dom.getTitleId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          transform: "translate3d(0, var(--bottom-sheet-translate, 0), 0)",
          transitionDuration: dragging ? "0s" : undefined,
          "--bottom-sheet-translate": tap(translate, (v) => `${v}px`),
          willChange: "transform",
        },
        onPointerDown(event) {
          if (!props.draggable) return
          onPointerDown(event)
        },
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(scope),
        dir: prop("dir"),
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
