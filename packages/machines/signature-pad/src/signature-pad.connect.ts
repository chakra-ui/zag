import { dataAttr, getEventTarget, getRelativePoint, isLeftClick, isModifierKey } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./signature-pad.anatomy"
import * as dom from "./signature-pad.dom"
import type { SignaturePadApi, SignaturePadService } from "./signature-pad.types"

export function connect<T extends PropTypes>(
  service: SignaturePadService,
  normalize: NormalizeProps<T>,
): SignaturePadApi<T> {
  const { state, send, prop, computed, context, scope } = service

  const drawing = state.matches("drawing")
  const empty = computed("isEmpty")
  const interactive = computed("isInteractive")
  const disabled = prop("disabled")

  const translations = prop("translations")

  return {
    empty: empty,
    drawing: drawing,
    currentPath: context.get("currentPath"),
    paths: context.get("paths"),
    clear() {
      send({ type: "CLEAR" })
    },

    getDataUrl(type, quality) {
      if (computed("isEmpty")) return Promise.resolve("")
      return dom.getDataUrl(scope, { type, quality })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        id: dom.getLabelId(scope),
        "data-disabled": dataAttr(disabled),
        htmlFor: dom.getHiddenInputId(scope),
        onClick(event) {
          if (!interactive) return
          if (event.defaultPrevented) return
          const controlEl = dom.getControlEl(scope)
          controlEl?.focus({ preventScroll: true })
        },
      })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-disabled": dataAttr(disabled),
        id: dom.getRootId(scope),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        tabIndex: disabled ? undefined : 0,
        id: dom.getControlId(scope),
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
          const { offset } = getRelativePoint(point, dom.getControlEl(scope)!)
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
          fill: prop("drawing").fill,
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
        hidden: !context.get("paths").length || drawing,
        disabled,
        onClick() {
          send({ type: "CLEAR" })
        },
      })
    },

    getHiddenInputProps(props) {
      return normalize.input({
        id: dom.getHiddenInputId(scope),
        type: "text",
        hidden: true,
        disabled,
        required: prop("required"),
        readOnly: prop("readOnly"),
        name: prop("name"),
        value: props.value,
      })
    },
  }
}
