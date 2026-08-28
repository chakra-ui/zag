import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./clipboard.anatomy"
import type { ClipboardService, ClipboardApi, IndicatorProps, IndicatorState } from "./clipboard.types"
import * as dom from "./clipboard.dom"

const defaultTranslations: Required<IntlTranslations> = {
  triggerLabel: (copied) => (copied ? "Copied to clipboard" : "Copy to clipboard"),
}

export function connect<T extends PropTypes>(service: ClipboardService, normalize: NormalizeProps<T>): ClipboardApi<T> {
  const { state, send, context, scope, prop } = service
  const copied = state.matches("copied")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getIndicatorState(props: IndicatorProps): IndicatorState {
    return { copied: props.copied, visible: props.copied === copied }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    copied,
    value: context.get("value"),
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    copy() {
      send({ type: "COPY" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        "data-copied": dataAttr(copied),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs(scope.id),
        htmlFor: dom.getInputId(scope),
        "data-copied": dataAttr(copied),
        id: dom.getLabelId(scope),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs(scope.id),
        "data-copied": dataAttr(copied),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs(scope.id),
        defaultValue: context.get("value"),
        "data-copied": dataAttr(copied),
        readOnly: true,
        "data-readonly": "true",
        id: dom.getInputId(scope),
        onFocus(event) {
          event.currentTarget.select()
        },
        onCopy() {
          send({ type: "INPUT.COPY" })
        },
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        type: "button",
        "aria-label": translations.triggerLabel?.(copied),
        "data-copied": dataAttr(copied),
        onClick() {
          send({ type: "COPY" })
        },
      })
    },

    getIndicatorState,
    getIndicatorProps(props) {
      const indicatorState = getIndicatorState(props)
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        hidden: !indicatorState.visible,
      })
    },
  }
}
