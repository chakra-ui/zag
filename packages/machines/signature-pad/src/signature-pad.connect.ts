import { getRelativePoint, isLeftClick, isModifiedEvent } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./signature-pad.anatomy"
import { dom } from "./signature-pad.dom"
import type { LayerProps, Send, State } from "./signature-pad.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isDrawing = state.matches("drawing")
  const isEmpty = state.context.isEmpty
  const isInteractive = state.context.isInteractive

  return {
    isEmpty,
    isDrawing,
    currentPath: state.context.currentPath,
    paths: state.context.paths,

    getDataUrl(type: "image/png" | "image/jpeg" | "image/svg+xml", quality?: number) {
      const canvasEl = dom.getCanvasEl(state.context)
      return canvasEl.toDataURL(type, quality ?? 0.92)
    },

    labelProps: normalize.element({
      ...parts.label.attrs,
      "data-disabled": dataAttr(state.context.disabled),
      htmlFor: dom.getControlId(state.context),
    }),

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-disabled": dataAttr(state.context.disabled),
      id: dom.getRootId(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      tabIndex: 0,
      id: dom.getControlId(state.context),
      "aria-label": "Signature Pad",
      "aria-roledescription": "signature pad",
      "aria-disabled": state.context.disabled,
      "data-disabled": dataAttr(state.context.disabled),
      onPointerDown(event) {
        if (!isLeftClick(event) || isModifiedEvent(event) || !isInteractive) return
        event.currentTarget.setPointerCapture(event.pointerId)
        const point = { x: event.clientX, y: event.clientY }
        const { offset } = getRelativePoint(point, dom.getControlEl(state.context)!)
        send({ type: "POINTER_DOWN", point: offset, pressure: event.pressure })
      },
      onPointerUp(event) {
        if (!isInteractive) return
        event.currentTarget.releasePointerCapture(event.pointerId)
      },
      style: {
        touchAction: "none",
        userSelect: "none",
      },
    }),

    layerProps: normalize.svg({
      ...parts.layer.attrs,
      style: {
        pointerEvents: "none",
      },
    }),

    getLayerPathProps(props: LayerProps) {
      return normalize.path({
        ...parts.layerPath.attrs,
        d: props.path,
      })
    },

    separatorProps: normalize.element({
      ...parts.separator.attrs,
      role: "separator",
    }),

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      type: "button",
      "aria-label": "Clear Signature",
      hidden: !state.context.paths.length,
      disabled: state.context.disabled,
      onClick() {
        send({ type: "CLEAR" })
      },
    }),
  }
}
