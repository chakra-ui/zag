import type { NormalizeProps, PropTypes, Required } from "@zag-js/types"
import { mergeWithDefault } from "@zag-js/utils"
import { parts } from "./progress.anatomy"
import * as dom from "./progress.dom"
import type { IntlTranslations, ProgressApi, ProgressService, ViewProps, ViewState } from "./progress.types"
import { getProgressState } from "./progress.utils"

const defaultTranslations: Required<IntlTranslations> = {
  value: ({ value, percent, formatter }) => {
    if (value === null) return "loading..."

    if (formatter) {
      const formatOptions = formatter.resolvedOptions()
      const num = formatOptions.style === "percent" ? percent / 100 : value
      return formatter.format(num)
    }

    return value.toString()
  },
}

export function connect<T extends PropTypes>(service: ProgressService, normalize: NormalizeProps<T>): ProgressApi<T> {
  const { computed, prop, send, scope } = service
  const percent = computed("percent")
  const percentAsString = computed("isIndeterminate") ? "" : computed("percentFormatter").format(percent / 100)

  const max = prop("max")
  const min = prop("min")

  const orientation = prop("orientation")
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))
  const indeterminate = computed("isIndeterminate")

  const value = computed("clampedValue")
  const valueAsString = translations.value({ value, max, percent, min, formatter: computed("formatter") })
  const progressState = getProgressState(value, max)

  const progressbarProps = {
    role: "progressbar",
    "aria-labelledby": dom.getLabelId(scope),
    "data-max": max,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value ?? undefined,
    "aria-valuetext": indeterminate ? undefined : valueAsString,
    "data-orientation": orientation,
    "data-state": progressState,
  }

  const circleProps = getCircleProps(service)

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getViewState(props: ViewProps): ViewState {
    return { state: props.state, visible: props.state === progressState }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    value,
    valueAsString,
    min,
    max,
    percent,
    percentAsString,
    indeterminate,
    setValue(value) {
      send({ type: "VALUE.SET", value })
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
        "data-max": max,
        "data-value": value ?? undefined,
        "data-state": progressState,
        "data-orientation": orientation,
        style: {
          "--percent": indeterminate ? undefined : percent,
        },
      })
    },

    getLabelProps() {
      return normalize.element({
        dir: prop("dir"),
        id: dom.getLabelId(scope),
        ...parts.label.attrs(scope.id),
        "data-orientation": orientation,
      })
    },

    getValueTextProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.valueText.attrs(scope.id),
      })
    },

    getTrackProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.track.attrs(scope.id),
        ...progressbarProps,
      })
    },

    getRangeProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.range.attrs(scope.id),
        "data-orientation": orientation,
        "data-state": progressState,
        style: {
          [computed("isHorizontal") ? "width" : "height"]: indeterminate ? undefined : `${percent}%`,
        },
      })
    },

    getCircleProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.circle.attrs(scope.id),
        ...progressbarProps,
        ...circleProps.root,
      })
    },

    getCircleTrackProps() {
      return normalize.element({
        dir: prop("dir"),
        "data-orientation": orientation,
        ...parts.circleTrack.attrs(scope.id),
        ...circleProps.track,
      })
    },

    getCircleRangeProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.circleRange.attrs(scope.id),
        ...circleProps.range,
        "data-state": progressState,
      })
    },

    getViewState,
    getViewProps(props) {
      const viewState = getViewState(props)
      return normalize.element({
        dir: prop("dir"),
        ...parts.view.attrs(scope.id),
        "data-state": viewState.state,
        hidden: !viewState.visible,
      })
    },
  }
}

const circleProps = {
  style: {
    "--radius": "calc(var(--size) / 2 - var(--thickness) / 2)",
    cx: "calc(var(--size) / 2)",
    cy: "calc(var(--size) / 2)",
    r: "var(--radius)",
    fill: "transparent",
    strokeWidth: "var(--thickness)",
  },
}

const rootProps = {
  style: {
    width: "var(--size)",
    height: "var(--size)",
  },
}

function getCircleProps(service: ProgressService) {
  const { computed } = service
  return {
    root: rootProps,
    track: circleProps,
    range: {
      opacity: !computed("isIndeterminate") && computed("percent") === 0 ? 0 : undefined,
      style: {
        ...circleProps.style,
        "--percent": computed("percent"),
        "--circumference": `calc(2 * 3.14159 * var(--radius))`,
        "--offset": `calc(var(--circumference) * (100 - var(--percent)) / 100)`,
        strokeDashoffset: `calc(var(--circumference) * ((100 - var(--percent)) / 100))`,
        strokeDasharray: computed("isIndeterminate") ? undefined : `var(--circumference)`,
        transformOrigin: "center",
        transform: "rotate(-90deg)",
      },
    },
  }
}
