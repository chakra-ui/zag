import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./progress.anatomy"
import type { MachineApi, ProgressState, Send, State } from "./progress.types"
import { dom } from "./progress.dom"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const percent = state.context.percent
  const max = state.context.max
  const orientation = state.context.orientation
  const translations = state.context.translations
  const indeterminate = state.context.isIndeterminate

  const value = state.context.value
  const valueAsString = translations.value({ value, max, percent })
  const progressState = getProgressState(value, max)

  return {
    value,
    valueAsString,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    setToMax() {
      send({ type: "VALUE.SET", value: max })
    },

    rootProps: normalize.element({
      dir: state.context.dir,
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      "data-max": max,
      "data-value": value ?? undefined,
      "data-state": progressState,
      "data-orientation": orientation,
      style: {
        "--progress-percent": indeterminate ? undefined : `${percent}%`,
      },
    }),

    labelProps: normalize.element({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      ...parts.label.attrs,
      "data-orientation": orientation,
    }),

    trackProps: normalize.element({
      dir: state.context.dir,
      ...parts.track.attrs,
      id: dom.getTrackId(state.context),
      role: "progressbar",
      "aria-label": translations.value({ value, max, percent }),
      "data-max": max,
      "aria-valuemin": 0,
      "aria-valuemax": max,
      "aria-valuenow": value ?? undefined,
      "data-orientation": orientation,
    }),

    valueTextProps: normalize.element({
      dir: state.context.dir,
      "aria-live": "polite",
      ...parts.valueText.attrs,
    }),

    rangeProps: normalize.element({
      dir: state.context.dir,
      ...parts.range.attrs,
      "data-orientation": orientation,
      "data-state": progressState,
      style: {
        [state.context.isHorizontal ? "width" : "height"]: indeterminate ? undefined : `${percent}%`,
      },
    }),

    getIndicatorProps(props) {
      return normalize.element({
        dir: state.context.dir,
        ...parts.indicator.attrs,
        "data-state": props.state,
        hidden: props.state !== progressState,
      })
    },
  }
}

function getProgressState(value: number | null, maxValue: number): ProgressState {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading"
}
