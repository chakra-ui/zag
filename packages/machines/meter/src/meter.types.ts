import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Orientation, OrientationProperty, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

/**
 * How good the current value is after `low` / `high` / `optimum` cut the range.
 * @see https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element
 */
export type MeterValueState = "optimal" | "suboptimal" | "least-optimal"

export interface ValueTranslationDetails {
  value: number
  max: number
  min: number
  percent: number
  formatter: Intl.NumberFormat
}

export interface ValueChangeDetails {
  value: number
}

export interface IntlTranslations {
  value?: ((details: ValueTranslationDetails) => string) | undefined
}

export type ElementIds = Partial<{
  label: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface MeterProps extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the meter. Useful when the label lives outside
   * the machine and you need to control `aria-labelledby`.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the meter.
   */
  value?: number | undefined
  /**
   * The initial value of the meter when rendered.
   * Use when you don't need to control the value of the meter.
   */
  defaultValue?: number | undefined
  /**
   * The minimum allowed value of the meter.
   * @default 0
   */
  min?: number | undefined
  /**
   * The maximum allowed value of the meter.
   * @default 100
   */
  max?: number | undefined
  /**
   * The upper numeric bound of the low end of the measured range.
   * Defaults to `min`.
   */
  low?: number | undefined
  /**
   * The lower numeric bound of the high end of the measured range.
   * Defaults to `max`.
   */
  high?: number | undefined
  /**
   * The optimal numeric value. Combined with `low` and `high`, this decides
   * which region is preferred (HTML `<meter>` algorithm).
   * Defaults to the midpoint of `min` and `max`.
   */
  optimum?: number | undefined
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations | undefined
  /**
   * Callback fired when the value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The options to use for formatting the value.
   * @default { style: "percent" }
   */
  formatOptions?: Intl.NumberFormatOptions | undefined
  /**
   * The locale to use for formatting the value.
   */
  locale?: string | undefined
}

type PropsWithDefault = "orientation" | "min" | "max" | "low" | "high" | "optimum" | "formatOptions"

type Computed = Readonly<{
  percent: number
  isHorizontal: boolean
  formatter: Intl.NumberFormat
  valueState: MeterValueState
}>

export interface MeterSchema {
  props: MeterProps
  defaultPropKey: PropsWithDefault
  computed: Computed
  context: {
    value: number
  }
  state: "idle"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type MeterService = Service<MeterSchema>

export type MeterMachine = Machine<MeterSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MeterApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the meter.
   */
  value: number
  /**
   * The current value of the meter as a formatted string.
   */
  valueAsString: string
  /**
   * Sets the current value of the meter.
   */
  setValue: (value: number) => void
  /**
   * Sets the current value of the meter to the max value.
   */
  setToMax: VoidFunction
  /**
   * Sets the current value of the meter to the min value.
   */
  setToMin: VoidFunction
  /**
   * The percentage of the meter's value (0–100).
   */
  percent: number
  /**
   * The percentage of the meter's value as a formatted string.
   */
  percentAsString: string
  /**
   * The minimum allowed value of the meter.
   */
  min: number
  /**
   * The maximum allowed value of the meter.
   */
  max: number
  /**
   * The resolved low boundary.
   */
  low: number
  /**
   * The resolved high boundary.
   */
  high: number
  /**
   * The resolved optimum point.
   */
  optimum: number
  /**
   * How good the current value is: `optimal`, `suboptimal`, or `least-optimal`.
   */
  valueState: MeterValueState

  getRootProps: () => T["element"]
  getLabelProps: () => T["element"]
  getTrackProps: () => T["element"]
  getValueTextProps: () => T["element"]
  getIndicatorProps: () => T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
