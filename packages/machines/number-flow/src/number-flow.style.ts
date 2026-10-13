import type { Params } from "@zag-js/core"
import type { Style } from "@zag-js/types"
import type { NumberFlowSchema, TimingOptions } from "./number-flow.types"
import type { SegmentPresence } from "./utils/segments"

type Ctx = Params<NumberFlowSchema>

/** A damped spring (ζ ≈ 0.75) sampled into `linear()`: ~3% overshoot, settled by the end. */
const SPRING_EASING =
  "linear(0, 0.034 3.1%, 0.119 6.2%, 0.231 9.4%, 0.353 12.5%, 0.475 15.6%, 0.589 18.8%, 0.69 21.9%, 0.776 25%, 0.847 28.1%, 0.903 31.2%, 0.946 34.4%, 0.978 37.5%, 1 40.6%, 1.015 43.8%, 1.023 46.9%, 1.027 50%, 1.028 53.1%, 1.027 56.2%, 1.025 59.4%, 1.021 62.5%, 1.018 65.6%, 1.015 68.8%, 1.011 71.9%, 1.009 75%, 1.006 78.1%, 1.004 81.2%, 1.003 84.4%, 1.001 87.5%, 1.001 90.6%, 1)"

// Rolls and width changes share one timing by default
const DEFAULT_TIMING: Required<TimingOptions> = { duration: "900ms", easing: SPRING_EASING }

/** Root style: timing variables only, never animated. */
export function getRootStyle({ prop }: Pick<Ctx, "prop">): Style {
  const spinTiming = { ...DEFAULT_TIMING, ...prop("spinTiming") }
  const transformTiming = { ...DEFAULT_TIMING, ...prop("transformTiming") }

  return {
    display: "inline-flex",
    alignItems: "baseline",
    // A rolling digit can't invalidate ancestor layout
    contain: "layout style paint",
    "--spin-duration": spinTiming.duration,
    "--spin-easing": spinTiming.easing,
    "--transform-duration": transformTiming.duration,
    "--transform-easing": transformTiming.easing,
    "--stagger": prop("stagger") ?? "0ms",
  }
}

// Width animates between `minmax(0, 0fr)` and `minmax(0, 1fr)` without measuring; the `0` minimum lets text symbols shrink too
const SEGMENT_TRANSITION =
  "grid-template-columns var(--transform-duration) var(--transform-easing), opacity calc(var(--transform-duration) / 2) ease-out"

export function getSegmentStyle(presence: SegmentPresence | undefined): Style {
  const hidden = presence === "entering" || presence === "exiting"
  return {
    display: "inline-grid",
    gridTemplateColumns: hidden ? "minmax(0, 0fr)" : "minmax(0, 1fr)",
    opacity: hidden ? 0 : 1,
    transition: SEGMENT_TRANSITION,
  }
}

export function getDigitStyle(presence: SegmentPresence | undefined): Style {
  return {
    ...getSegmentStyle(presence),
    position: "relative",
    overflow: "hidden",
    height: "1lh",
    fontVariantNumeric: "tabular-nums",
  }
}

/** Symbols clip sideways only, so a shrinking `$` never spills into its neighbour. */
export function getSymbolStyle(presence: SegmentPresence | undefined): Style {
  return {
    ...getSegmentStyle(presence),
    overflowX: "clip",
    whiteSpace: "pre",
  }
}

// Delay folded into the shorthand: setting a longhand after a `var()` shorthand breaks it in Chromium
export const DIGIT_TRACK_TRANSITION =
  "transform var(--spin-duration) var(--spin-easing) calc(var(--place-index) * var(--stagger, 0ms))"

export const getTrackTransform = (counter: number) => `translateY(${-counter}lh)`

export function getDigitTrackStyle(placeIndex: number, counter: number): Style {
  return {
    display: "flex",
    flexDirection: "column",
    transform: getTrackTransform(counter),
    "--place-index": placeIndex,
    transition: DIGIT_TRACK_TRANSITION,
  }
}

export function getDigitCellStyle(): Style {
  return {
    height: "1lh",
  }
}
