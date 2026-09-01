import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./meter.anatomy"
import type { IntlTranslations, MeterApi, MeterService } from "./meter.types"

const defaultTranslations: Required<IntlTranslations> = {
  value: ({ value, percent, formatter }) => {
    if (formatter) {
      const formatOptions = formatter.resolvedOptions()
      const num = formatOptions.style === "percent" ? percent / 100 : value
      return formatter.format(num)
    }
    return value.toString()
  },
}

export function connect<T extends PropTypes>(service: MeterService, normalize: NormalizeProps<T>): MeterApi<T> {
  const { context, computed, prop, send, scope } = service
  const percent = computed("percent")
  const percentAsString = computed("formatter").format(percent / 100)

  const min = prop("min")
  const max = prop("max")
  const low = prop("low")
  const high = prop("high")
  const optimum = prop("optimum")
  const orientation = prop("orientation")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const value = context.get("value")
  const valueAsString = translations.value({ value, max, percent, min, formatter: computed("formatter") })
  const valueState = computed("valueState")
  const labelId = scope.ids?.label ?? `${scope.id}:label`

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
    setValue(next) {
      send({ type: "VALUE.SET", value: next })
    },
    setToMax() {
      send({ type: "VALUE.SET", value: max })
    },
    setToMin() {
      send({ type: "VALUE.SET", value: min })
    },

    getRootProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.root.attrs(scope.id),
        role: "meter",
        "aria-labelledby": labelId,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuenow": value,
        "aria-valuetext": valueAsString,
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
        id: labelId,
        ...parts.label.attrs(scope.id),
        "data-orientation": orientation,
      })
    },

    getValueTextProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.valueText.attrs(scope.id),
        "aria-hidden": true,
      })
    },

    getTrackProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.track.attrs(scope.id),
        "data-orientation": orientation,
        "data-state": valueState,
      })
    },

    getIndicatorProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.indicator.attrs(scope.id),
        "data-orientation": orientation,
        "data-state": valueState,
        style: {
          [computed("isHorizontal") ? "width" : "height"]: `${percent}%`,
        },
      })
    },
  }
}
