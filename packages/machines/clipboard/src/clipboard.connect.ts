import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./clipboard.anatomy"
import type { ClipboardService, ClipboardApi, IntlTranslations } from "./clipboard.types"
import * as dom from "./clipboard.dom"

const defaultTranslations: Required<IntlTranslations> = {
  triggerLabel: (copied) => (copied ? "Copied to clipboard" : "Copy to clipboard"),
}

export function connect<T extends PropTypes>(service: ClipboardService, normalize: NormalizeProps<T>): ClipboardApi<T> {
  const { state, send, context, scope, prop } = service
  const copied = state.matches("copied")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

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
        ...parts.root.attrs,
        "data-copied": dataAttr(copied),
        id: dom.getRootId(scope),
      })
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        htmlFor: dom.getInputId(scope),
        "data-copied": dataAttr(copied),
        id: dom.getLabelId(scope),
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        "data-copied": dataAttr(copied),
      })
    },

    getInputProps() {
      return normalize.input({
        ...parts.input.attrs,
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
        ...parts.trigger.attrs,
        type: "button",
        "aria-label": translations.triggerLabel?.(copied),
        "data-copied": dataAttr(copied),
        onClick() {
          send({ type: "COPY" })
        },
      })
    },

    getIndicatorProps(props) {
      return normalize.element({
        ...parts.indicator.attrs,
        hidden: props.copied !== copied,
      })
    },
  }
}
