import type { Params } from "@zag-js/core"
import type { Style } from "@zag-js/types"
import type { NumberFlowSchema, TimingOptions } from "./number-flow.types"

type Ctx = Params<NumberFlowSchema>

const DEFAULT_SPIN_TIMING: Required<TimingOptions> = {
  duration: "900ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
}

const DEFAULT_TRANSFORM_TIMING: Required<TimingOptions> = {
  duration: "500ms",
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
}

/* -----------------------------------------------------------------------------
 * Root style - timing config only. Never animated (§9.1).
 * -----------------------------------------------------------------------------*/

export function getRootStyle(params: Pick<Ctx, "prop">): Style {
  const { prop } = params
  const spinTiming = { ...DEFAULT_SPIN_TIMING, ...prop("spinTiming") }
  const transformTiming = { ...DEFAULT_TRANSFORM_TIMING, ...prop("transformTiming") }

  return {
    display: "inline-flex",
    alignItems: "baseline",
    // Prevents a rolling digit from invalidating ancestor layout (§9.6)
    contain: "layout style paint",
    "--spin-duration": spinTiming.duration,
    "--spin-easing": spinTiming.easing,
    "--transform-duration": transformTiming.duration,
    "--transform-easing": transformTiming.easing,
    "--stagger": prop("stagger") ?? "0ms",
  }
}

/* -----------------------------------------------------------------------------
 * Digit style - the clipping window. No measurement: height is a fixed `1lh` (§8).
 * -----------------------------------------------------------------------------*/

export function getDigitStyle(): Style {
  return {
    display: "inline-block",
    position: "relative",
    overflow: "hidden",
    height: "1lh",
    fontVariantNumeric: "tabular-nums",
  }
}

/* -----------------------------------------------------------------------------
 * Digit track style - the moving strip. `transform` is written directly and animated via
 * a plain CSS transition, so interruption retargets on the compositor with no JS reads (§9.1).
 *
 * The delay is folded into the single `transition` shorthand rather than set via a separate
 * `transitionDelay` assignment. Setting a longhand transition-* property right after a
 * shorthand whose own value contains `var()` corrupts the shorthand's other longhands in
 * Chromium - `transition-property`/`-duration`/`-timing-function` silently revert to their
 * initial values, killing the animation entirely.
 *
 * The machine also writes this same `DIGIT_TRACK_TRANSITION` string back onto the element
 * after a silent reset (§9.6). Framework bindings only re-apply a style property when its
 * *value* changes across renders, so restoring it to `""` instead of this exact string would
 * desync the DOM from the declarative style forever - the property would just stay cleared.
 * -----------------------------------------------------------------------------*/

export const DIGIT_TRACK_TRANSITION =
  "transform var(--spin-duration) var(--spin-easing) calc(var(--place-index) * var(--stagger, 0ms))"

export function getDigitTrackStyle(placeIndex: number, counter: number): Style {
  return {
    display: "flex",
    flexDirection: "column",
    transform: `translateY(${-counter}lh)`,
    "--place-index": placeIndex,
    transition: DIGIT_TRACK_TRANSITION,
  }
}

/* -----------------------------------------------------------------------------
 * Digit cell style - one cell in the strip.
 * -----------------------------------------------------------------------------*/

export function getDigitCellStyle(): Style {
  return {
    height: "1lh",
  }
}
