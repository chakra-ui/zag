import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./progress.anatomy"
import * as dom from "./progress.dom"
import type { ProgressApi, ProgressService, ProgressState } from "./progress.types"

export function connect<T extends PropTypes>(service: ProgressService, normalize: NormalizeProps<T>): ProgressApi<T> {
  const { context, computed, prop, send, scope } = service
  const percent = computed("percent")
  const percentAsString = computed("isIndeterminate") ? "" : computed("formatter").format(percent / 100)

  const max = prop("max")
  const min = prop("min")

  const orientation = prop("orientation")
  const translations = prop("translations")
  const indeterminate = computed("isIndeterminate")

  const value = context.get("value")
  const valueAsString = translations?.value({ value, max, percent, min, formatter: computed("formatter") }) ?? ""
  const progressState = getProgressState(value, max)

  const progressbarProps = {
    role: "progressbar",
    "aria-label": valueAsString,
    "data-max": max,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value ?? undefined,
    "data-orientation": orientation,
    "data-state": progressState,
  }

  const circleProps = getCircleProps(service)

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
        ...parts.root.attrs,
        id: dom.getRootId(scope),
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
        ...progressbarProps,
      })
    },

    getRangeProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.range.attrs,
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
        id: dom.getCircleId(scope),
        ...parts.circle.attrs,
        ...progressbarProps,
        ...circleProps.root,
      })
    },

    getCircleTrackProps() {
      return normalize.element({
        dir: prop("dir"),
        "data-orientation": orientation,
        ...parts.circleTrack.attrs,
        ...circleProps.track,
      })
    },

    getCircleRangeProps() {
      return normalize.element({
        dir: prop("dir"),
        ...parts.circleRange.attrs,
        ...circleProps.range,
        "data-state": progressState,
      })
    },

    getViewProps(props) {
      return normalize.element({
        dir: prop("dir"),
        ...parts.view.attrs,
        "data-state": props.state,
        hidden: props.state !== progressState,
      })
    },
  }
}

function getProgressState(value: number | null, maxValue: number): ProgressState {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading"
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
  const { context, computed } = service
  return {
    root: rootProps,
    track: circleProps,
    range: {
      opacity: context.get("value") === 0 ? 0 : undefined,
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
