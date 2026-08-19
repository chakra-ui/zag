import { dataAttr, visuallyHiddenStyle } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { DigitSegment } from "./utils/segments"
import { parts } from "./number-flow.anatomy"
import * as dom from "./number-flow.dom"
import { getDigitCellStyle, getRootStyle, getDigitStyle, getDigitTrackStyle } from "./number-flow.style"
import type {
  DigitCellProps,
  DigitProps,
  DigitTrackProps,
  NumberFlowApi,
  NumberFlowService,
  SymbolProps,
} from "./number-flow.types"
import { getCycles, getDigitCells, getDigitGlyphs, getPlaceOrder, normalizeCounter } from "./utils/segments"

export function connect<T extends PropTypes>(
  service: NumberFlowService,
  normalize: NormalizeProps<T>,
): NumberFlowApi<T> {
  const { context, computed, refs, state, prop, send, scope } = service

  const result = computed("result")
  const value = context.get("value")
  const prevValue = refs.get("prevValue")
  const counters = refs.get("counters")
  const animating = state.matches("rolling")
  const reducedMotion = !!prop("respectMotionPreference") && refs.get("reducedMotion")
  const live = !!prop("live")

  const places = getPlaceOrder(result.places)
  const placeIndex = new Map(places.map((place, index) => [place, index]))
  const cycles = getCycles(prop("continuous"))

  // A digit renders before the machine has a counter for it - on the server, on the first
  // client render, and on the render that introduces a new place. Resting it on its own digit
  // means it comes in showing the right glyph instead of flashing a zero.
  const restingCounter = (segment: DigitSegment) =>
    counters.get(segment.place) ?? normalizeCounter(segment.digit, cycles)

  // `prevValue` is only behind on the render between the value landing and the roll starting.
  // From then on the roll's own direction is read off the ref, so `data-trend` describes the
  // roll for its whole duration instead of flipping to "none" the moment it starts.
  const trend = value > prevValue ? "up" : value < prevValue ? "down" : refs.get("trend")

  return {
    value,
    valueText: result.valueText,
    announcedValueText: context.get("announcedValueText"),
    segments: result.segments,
    digitCells: getDigitCells(prop("locale"), cycles),
    digitGlyphs: getDigitGlyphs(prop("locale")),
    animating,

    setValue(value) {
      send({ type: "VALUE.SET", value })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs(scope.id),
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: live ? undefined : "img",
        "aria-label": live ? undefined : result.valueText,
        "data-state": animating ? "rolling" : "idle",
        "data-trend": trend,
        "data-reduced-motion": dataAttr(reducedMotion),
        style: getRootStyle({ prop }),
      })
    },

    getValueTextProps() {
      return normalize.element({
        ...parts.valueText.attrs(scope.id),
        id: dom.getValueTextId(scope),
        role: live ? "status" : undefined,
        "aria-live": live ? "polite" : undefined,
        "aria-hidden": live ? undefined : true,
        style: visuallyHiddenStyle,
      })
    },

    getSymbolProps(props: SymbolProps) {
      const { segment } = props
      return normalize.element({
        ...parts.symbol.attrs(scope.id),
        "aria-hidden": true,
        "data-type": segment.type,
        dir: prop("dir"),
      })
    },

    getDigitProps(props: DigitProps) {
      const { segment } = props
      return normalize.element({
        ...parts.digit.attrs(scope.id),
        "aria-hidden": true,
        "data-place": segment.place,
        dir: prop("dir"),
        style: getDigitStyle(),
      })
    },

    getDigitTrackProps(props: DigitTrackProps) {
      const { segment } = props
      const index = placeIndex.get(segment.place) ?? 0

      return normalize.element({
        ...parts.digitTrack.attrs(scope.id),
        "aria-hidden": true,
        "data-place": segment.place,
        dir: prop("dir"),
        style: getDigitTrackStyle(index, restingCounter(segment)),
      })
    },

    getDigitCellProps(props: DigitCellProps) {
      const { segment, cell } = props
      return normalize.element({
        ...parts.digitCell.attrs(scope.id),
        "aria-hidden": true,
        "data-place": segment.place,
        "data-digit": cell.digit,
        dir: prop("dir"),
        style: getDigitCellStyle(),
      })
    },
  }
}
