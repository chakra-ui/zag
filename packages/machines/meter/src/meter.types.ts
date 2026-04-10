import type { EventObject, Machine, Service } from "@zag-js/core"
import type {
  CommonProperties,
  DirectionProperty,
  Orientation,
  OrientationProperty,
  PropTypes,
  RequiredBy,
} from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type MeterState = "optimal" | "normal" | "high" | "low"

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
  value: (details: ValueTranslationDetails) => string
}

export type ElementIds = Partial<{
  root: string
  track: string
  label: string
  indicator: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface MeterProps extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the meter. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the meter.
   */
  value?: number | undefined
  /**
   * The initial value of the meter when rendered.
   * Use when you don't need to control the value of the meter.
   * @default 50
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
   * The lower bound of the normal range.
   */
  low?: number | undefined
  /**
   * The upper bound of the normal range.
   */
  high?: number | undefined
  /**
   * The optimum value of the meter.
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
   * @default "en-US"
   */
  locale?: string | undefined
}

type PropsWithDefault = "orientation" | "translations" | "min" | "max" | "formatOptions"

type Computed = Readonly<{
  percent: number
  isHorizontal: boolean
  formatter: Intl.NumberFormat
  valueState: MeterState
}>

export interface MeterSchema {
  props: RequiredBy<MeterProps, PropsWithDefault>
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
   * The current value of the meter as a string.
   */
  valueAsString: string
  /**
   * Sets the current value of the meter.
   */
  setValue: (value: number) => void
  /**
   * The percentage of the meter's value.
   */
  percent: number
  /**
   * The percentage of the meter's value as a string.
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
   * The lower bound of the normal range.
   */
  low: number | undefined
  /**
   * The upper bound of the normal range.
   */
  high: number | undefined
  /**
   * The optimum value of the meter.
   */
  optimum: number | undefined
  /**
   * The state of the meter's value.
   */
  valueState: MeterState

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
