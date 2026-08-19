import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, LocaleProperties, PropTypes } from "@zag-js/types"
import type { DigitCell, DigitSegment, RenderResult, Segment, SymbolSegment, Trend } from "./utils/segments"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: number
}

export interface AnimationDetails {
  /** The place exponents of the digit segments that are rolling. */
  places: number[]
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  valueText: string
}>

export interface TimingOptions {
  /** A CSS `<time>`, e.g. `"900ms"`. */
  duration?: string | undefined
  /** A CSS `<easing-function>`, e.g. `"cubic-bezier(0.4, 0, 0.2, 1)"`. */
  easing?: string | undefined
}

export interface NumberFlowProps extends LocaleProperties, CommonProperties {
  /**
   * The ids of the elements in the number-flow. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled numeric value to render.
   */
  value?: number | undefined
  /**
   * The initial value to render when uncontrolled.
   * @default 0
   */
  defaultValue?: number | undefined
  /**
   * Callback fired when the value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The options to pass to the `Intl.NumberFormat` constructor.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
   */
  formatOptions?: Intl.NumberFormatOptions | undefined
  /**
   * A static string rendered before the formatted value. Does not animate.
   */
  prefix?: string | undefined
  /**
   * A static string rendered after the formatted value. Does not animate.
   */
  suffix?: string | undefined
  /**
   * Controls the roll direction of each digit.
   * - `false` (default): each digit takes its own shortest path (`9 -> 0` rolls forward one step).
   * - `true`: every digit rolls in the direction of the overall value change.
   * - `1` / `-1`: force every digit to roll up or down, regardless of the value change.
   * @default false
   */
  trend?: Trend | undefined
  /**
   * Whether digits spin through every intermediate value instead of taking the nearest path.
   * @default false
   */
  continuous?: boolean | undefined
  /**
   * The timing of the per-digit roll transition.
   * @default { duration: "900ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
   */
  spinTiming?: TimingOptions | undefined
  /**
   * The timing of layout transitions - segments entering/exiting.
   * @default { duration: "500ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
   */
  transformTiming?: TimingOptions | undefined
  /**
   * A CSS `<time>` delay applied between adjacent digits, e.g. `"25ms"`.
   * @default undefined
   */
  stagger?: string | undefined
  /**
   * Whether to suppress the roll animation when the user prefers reduced motion.
   * @default true
   */
  respectMotionPreference?: boolean | undefined
  /**
   * Whether the value is announced to assistive technology as it changes.
   * When `false`, the rendered value is still readable, but changes are not announced.
   * @default false
   */
  live?: boolean | undefined
  /**
   * Callback fired when a value change starts a roll animation.
   */
  onAnimationStart?: ((details: AnimationDetails) => void) | undefined
  /**
   * Callback fired when the roll animation settles.
   */
  onAnimationComplete?: ((details: AnimationDetails) => void) | undefined
}

type PropsWithDefault =
  | "defaultValue"
  | "locale"
  | "trend"
  | "continuous"
  | "spinTiming"
  | "transformTiming"
  | "respectMotionPreference"
  | "live"

interface PrivateContext {
  /**
   * The resolved value (controlled or uncontrolled).
   */
  value: number
  /**
   * A hash of the current render shape. Changes only when segments enter/exit, or the
   * format shape changes - the only events that require adding/removing DOM nodes.
   */
  structuralKey: string
  /**
   * The text announced by the `live` region. Debounced to the settle event so a fast
   * counter doesn't spam assistive technology with every intermediate value.
   */
  announcedValueText: string
}

interface ComputedContext {
  /**
   * The formatted render parts, structural signature, and value text for the current value.
   */
  result: RenderResult
}

// zag-ignore-export
export interface NumberFlowRefs {
  /** place -> current counter (mutable, non-reactive). */
  counters: Map<number, number>
  /** place -> cached track element, populated on structural changes only. */
  trackEls: Map<number, HTMLElement>
  /** The previous resolved value, used for counter math and trend resolution. */
  prevValue: number
  /** Every place that has moved since the current roll began, cleared on settle. */
  animatingPlaces: number[]
  /** Places whose transition has not reported back yet. The roll settles when this empties. */
  pendingPlaces: Set<number>
  /** Whether `prefers-reduced-motion` currently matches. */
  reducedMotion: boolean
  /** The direction of the most recent value change, exposed as `data-trend`. */
  trend: "up" | "down" | "none"
}

export interface NumberFlowSchema {
  props: NumberFlowProps
  defaultPropKey: PropsWithDefault
  context: PrivateContext
  computed: ComputedContext
  refs: NumberFlowRefs
  state: "idle" | "rolling"
  action: string
  effect: string
  guard: string
  event: EventObject
}

export type NumberFlowService = Service<NumberFlowSchema>

export type NumberFlowMachine = Machine<NumberFlowSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface SymbolProps {
  segment: SymbolSegment
}

export interface DigitProps {
  segment: DigitSegment
}

export interface DigitTrackProps {
  segment: DigitSegment
}

export interface DigitCellProps {
  segment: DigitSegment
  cell: DigitCell
}

export interface NumberFlowApi<T extends PropTypes = PropTypes> {
  /**
   * The current numeric value.
   */
  value: number
  /**
   * The flattened, locale-formatted text (including prefix/suffix). Use for `aria-label`
   * or anywhere a plain string is needed.
   */
  valueText: string
  /**
   * The text to render inside `getValueTextProps()`. Same as `valueText`, except it only
   * updates once the roll animation settles - so a fast counter doesn't spam assistive tech.
   */
  announcedValueText: string
  /**
   * The ordered segments of the formatted value - one per rolling digit, plus the symbols
   * between them (group separators, currency symbols, signs, literals).
   */
  segments: Segment[]
  /**
   * The cells to render inside every digit track, in order. Map over this to build a digit's
   * strip - the same array is shared by every digit, and is stable across renders.
   */
  digitCells: readonly DigitCell[]
  /**
   * The locale digit glyphs `0-9`, in order. An escape hatch for rendering digits outside a
   * digit track - `digitCells` already carries the glyph for each cell.
   */
  digitGlyphs: string[]
  /**
   * Whether a roll animation is currently in progress. Reads a ref - does not subscribe.
   */
  animating: boolean
  /**
   * Sets the value.
   */
  setValue: (value: number) => void

  getRootProps: () => T["element"]
  getValueTextProps: () => T["element"]
  getSymbolProps: (props: SymbolProps) => T["element"]
  getDigitProps: (props: DigitProps) => T["element"]
  getDigitTrackProps: (props: DigitTrackProps) => T["element"]
  getDigitCellProps: (props: DigitCellProps) => T["element"]
}
