import { getNativeEvent, getRelativePoint, isLeftClick, isModifierKey } from "@zag-js/dom-event"
import { dataAttr, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./signature-pad.anatomy"
import { dom } from "./signature-pad.dom"
import type { MachineApi, Send, State } from "./signature-pad.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isDrawing = state.matches("drawing")
  const isEmpty = state.context.isEmpty
  const isInteractive = state.context.isInteractive
  const isDisabled = !!state.context.disabled

  return {
    isEmpty,
    isDrawing,
    currentPath: state.context.currentPath,
    paths: state.context.paths,
    clear() {
      send({ type: "CLEAR" })
    },

    getDataUrl(type, quality) {
      return dom.getDataUrl(state.context, { type, quality })
    },

    labelProps: normalize.element({
      ...parts.label.attrs,
      "data-disabled": dataAttr(isDisabled),
      htmlFor: dom.getControlId(state.context),
    }),

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-disabled": dataAttr(isDisabled),
      id: dom.getRootId(state.context),
    }),

    controlProps: normalize.element({
      ...parts.control.attrs,
      tabIndex: isDisabled ? undefined : 0,
      id: dom.getControlId(state.context),
      "aria-label": "Signature Pad",
      "aria-roledescription": "signature pad",
      "aria-disabled": isDisabled,
      "data-disabled": dataAttr(isDisabled),
      onPointerDown(event) {
        const target = getEventTarget<HTMLElement>(getNativeEvent(event))
        if (target?.closest("[data-part=clear-trigger]")) return
        if (!isLeftClick(event) || isModifierKey(event) || !isInteractive) return
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
        position: "relative",
        touchAction: "none",
        userSelect: "none",
      },
    }),

    segmentProps: normalize.svg({
      ...parts.segment.attrs,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        fill: state.context.drawing.fill,
      },
    }),

    getSegmentPathProps(props) {
      return normalize.path({
        ...parts.segmentPath.attrs,
        d: props.path,
      })
    },

    guideProps: normalize.element({
      ...parts.guide.attrs,
      "data-disabled": dataAttr(isDisabled),
    }),

    clearTriggerProps: normalize.button({
      ...parts.clearTrigger.attrs,
      type: "button",
      "aria-label": "Clear Signature",
      hidden: !state.context.paths.length || isDrawing,
      disabled: isDisabled,
      onClick() {
        send({ type: "CLEAR" })
      },
    }),

    getHiddenInputProps(props) {
      return normalize.input({
        type: "text",
        hidden: true,
        disabled: isDisabled,
        name: state.context.name,
        value: props.value,
      })
    },
  }
}
