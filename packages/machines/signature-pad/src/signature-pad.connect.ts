import { getRelativePoint, isLeftClick, isModifierKey } from "@zag-js/dom-event"
import { dataAttr, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./signature-pad.anatomy"
import { dom } from "./signature-pad.dom"
import type { IntlTranslations, MachineApi, Send, State } from "./signature-pad.types"

const defaultTranslations: IntlTranslations = {
  control: "signature pad",
  clearTrigger: "clear signature",
}

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const drawing = state.matches("drawing")
  const empty = state.context.isEmpty
  const interactive = state.context.isInteractive
  const disabled = !!state.context.disabled

  const translations = state.context.translations || defaultTranslations

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
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(state.context),
        "data-disabled": dataAttr(disabled),
        htmlFor: dom.getHiddenInputId(state.context),
        onClick(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          const controlEl = dom.getControlEl(state.context)
          controlEl?.focus({ preventScroll: true })
        },
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
        role: "application",
        "aria-roledescription": "signature pad",
        "aria-label": translations.control,
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
          WebkitUserSelect: "none",
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
        "aria-label": translations.clearTrigger,
        hidden: !state.context.paths.length || drawing,
        disabled,
        onClick() {
          send({ type: "CLEAR" })
        },
      })
    },

    getHiddenInputProps(props) {
      return normalize.input({
        id: dom.getHiddenInputId(state.context),
        type: "text",
        hidden: true,
        disabled,
        required: state.context.required,
        readOnly: state.context.readOnly,
        name: state.context.name,
        value: props.value,
      })
    },
  }
}
