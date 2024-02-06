import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./progress.anatomy"
import { dom } from "./progress.dom"
import type { MachineApi, MachineContext, ProgressState, Send, State } from "./progress.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const percent = state.context.percent
  const max = state.context.max
  const min = state.context.min

  const orientation = state.context.orientation
  const translations = state.context.translations
  const indeterminate = state.context.isIndeterminate

  const value = state.context.value
  const valueAsString = translations.value({ value, max, percent, min })
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

  const circleProps = getCircleProps(state.context)

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
        "--percent": indeterminate ? undefined : percent,
      },
    }),

    labelProps: normalize.element({
      dir: state.context.dir,
      id: dom.getLabelId(state.context),
      ...parts.label.attrs,
      "data-orientation": orientation,
    }),

    valueTextProps: normalize.element({
      dir: state.context.dir,
      "aria-live": "polite",
      ...parts.valueText.attrs,
    }),

    trackProps: normalize.element({
      dir: state.context.dir,
      id: dom.getTrackId(state.context),
      ...parts.track.attrs,
      ...progressbarProps,
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

    circleProps: normalize.element({
      dir: state.context.dir,
      id: dom.getCircleId(state.context),
      ...parts.circle.attrs,
      ...progressbarProps,
      ...circleProps.root,
    }),

    circleTrackProps: normalize.element({
      dir: state.context.dir,
      "data-orientation": orientation,
      ...parts.circleTrack.attrs,
      ...circleProps.track,
    }),

    circleRangeProps: normalize.element({
      dir: state.context.dir,
      ...parts.circleRange.attrs,
      ...circleProps.range,
      "data-state": progressState,
    }),

    getViewProps(props) {
      return normalize.element({
        dir: state.context.dir,
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

function getCircleProps(ctx: MachineContext) {
  const determinant = ctx.isIndeterminate ? undefined : ctx.percent * 2.64
  const circleProps = {
    style: {
      cx: "50px",
      cy: "50px",
      r: "42px",
      fill: "transparent",
      strokeWidth: "var(--thickness)",
    },
  }
  return {
    root: {
      viewBox: "0 0 100 100",
      style: {
        width: "var(--size)",
        height: "var(--size)",
      },
    },
    track: circleProps,
    range: {
      style: {
        ...circleProps.style,
        strokeDashoffset: "66px",
        strokeDasharray: determinant != null ? `${determinant} ${264 - determinant}` : undefined,
      },
    },
  }
}
