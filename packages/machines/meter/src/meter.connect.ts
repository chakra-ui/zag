import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./meter.anatomy"
import * as dom from "./meter.dom"
import type { MeterApi, MeterService } from "./meter.types"

export function connect<T extends PropTypes>(service: MeterService, normalize: NormalizeProps<T>): MeterApi<T> {
  const { context, computed, prop, send, scope } = service
  const percent = computed("percent")
  const percentAsString = computed("formatter").format(percent / 100)

  const max = prop("max")
  const min = prop("min")
  const low = prop("low")
  const high = prop("high")
  const optimum = prop("optimum")

  const orientation = prop("orientation")
  const translations = prop("translations")

  const value = context.get("value")
  const valueAsString = translations?.value({ value, max, percent, min, formatter: computed("formatter") }) ?? ""
  const valueState = computed("valueState")

  const meterProps = {
    role: "meter",
    "aria-label": valueAsString,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "data-orientation": orientation,
    "data-state": valueState,
  }

  return {
    value,
    valueAsString,
    percent,
    percentAsString,
    min,
    max,
    low,
    high,
    optimum,
    valueState,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    getRootProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "data-value": value,
        "data-state": valueState,
        "data-orientation": orientation,
        style: {
          "--percent": percent,
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        ...parts.label.attrs,
        "data-orientation": orientation,
      })
    },

    getValueTextProps() {
      return normalize.element({
        dir: prop("dir"),
        "aria-live": "polite",
        ...parts.valueText.attrs,
      })
    },

    getTrackProps() {
      return normalize.element({
        dir: prop("dir"),
        id: dom.getTrackId(scope),
        ...parts.track.attrs,
        ...meterProps,
      })
    },

    getIndicatorProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.indicator.attrs,
        "data-orientation": orientation,
        "data-state": valueState,
        style: {
          [computed("isHorizontal") ? "width" : "height"]: `${percent}%`,
        },
      })
    },
  }
}
