import { getRelativePoint, isLeftClick, isModifierKey } from "@zag-js/dom-event"
import { dataAttr, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./signature-pad.anatomy"
import { dom } from "./signature-pad.dom"
import type { MachineApi, Send, State } from "./signature-pad.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const drawing = state.matches("drawing")
  const empty = state.context.isEmpty
  const interactive = state.context.isInteractive
  const disabled = !!state.context.disabled

  return {
    empty: empty,
    drawing: drawing,
    currentPath: state.context.currentPath,
    paths: state.context.paths,
    clear() {
      send({ type: "CLEAR" })
    },

    getDataUrl(type, quality) {
      return dom.getDataUrl(state.context, { type, quality })
    },

    getLabelProps() {
      return normalize.element({
        ...parts.label.attrs,
        "data-disabled": dataAttr(disabled),
        htmlFor: dom.getControlId(state.context),
      })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-disabled": dataAttr(disabled),
        id: dom.getRootId(state.context),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        tabIndex: disabled ? undefined : 0,
        id: dom.getControlId(state.context),
        "aria-label": "Signature Pad",
        "aria-roledescription": "signature pad",
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (isModifierKey(event)) return
          if (!interactive) return

          const target = getEventTarget<HTMLElement>(event)
          if (target?.closest("[data-part=clear-trigger]")) return

          event.currentTarget.setPointerCapture(event.pointerId)

          const point = { x: event.clientX, y: event.clientY }
          const { offset } = getRelativePoint(point, dom.getControlEl(state.context)!)
          send({ type: "POINTER_DOWN", point: offset, pressure: event.pressure })
        },
        onPointerUp(event) {
          if (!interactive) return
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        },
        style: {
          position: "relative",
          touchAction: "none",
          userSelect: "none",
        },
      })
    },

    getSegmentProps() {
      return normalize.svg({
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
      })
    },

    getSegmentPathProps(props) {
      return normalize.path({
        ...parts.segmentPath.attrs,
        d: props.path,
      })
    },

    getGuideProps() {
      return normalize.element({
        ...parts.guide.attrs,
        "data-disabled": dataAttr(disabled),
      })
    },

    getClearTriggerProps() {
      return normalize.button({
        ...parts.clearTrigger.attrs,
        type: "button",
        "aria-label": "Clear Signature",
        hidden: !state.context.paths.length || drawing,
        disabled: disabled,
        onClick() {
          send({ type: "CLEAR" })
        },
      })
    },

    getHiddenInputProps(props) {
      return normalize.input({
        type: "text",
        hidden: true,
        disabled: disabled,
        name: state.context.name,
        value: props.value,
      })
    },
  }
}
