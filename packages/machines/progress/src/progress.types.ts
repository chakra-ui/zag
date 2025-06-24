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

export type ProgressState = "indeterminate" | "loading" | "complete"

export interface ValueTranslationDetails {
  value: number | null
  max: number
  min: number
  percent: number
}

export interface ValueChangeDetails {
  value: number | null
}

export interface IntlTranslations {
  value(details: ValueTranslationDetails): string
}

export type ElementIds = Partial<{
  root: string
  track: string
  label: string
  circle: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ProgressProps extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the progress bar. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the progress bar.
   */
  value?: number | null | undefined
  /**
   * The initial value of the progress bar when rendered.
   * Use when you don't need to control the value of the progress bar.
   * @default 50
   */
  defaultValue?: number | null | undefined
  /**
   * The minimum allowed value of the progress bar.
   * @default 0
   */
  min?: number | undefined
  /**
   * The maximum allowed value of the progress bar.
   * @default 100
   */
  max?: number | undefined
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
  isIndeterminate: boolean
  percent: number
  isHorizontal: boolean
  formatter: Intl.NumberFormat
}>

export interface ProgressSchema {
  props: RequiredBy<ProgressProps, PropsWithDefault>
  computed: Computed
  context: {
    value: number | null
  }
  state: "idle"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type ProgressService = Service<ProgressSchema>

export type ProgressMachine = Machine<ProgressSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ViewProps {
  state: ProgressState
}

export interface ProgressApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the progress bar.
   */
  value: number | null
  /**
   * The current value of the progress bar as a string.
   */
  valueAsString: string
  /**
   * Sets the current value of the progress bar.
   */
  setValue(value: number | null): void
  /**
   * Sets the current value of the progress bar to the max value.
   */
  setToMax(): void
  /**
   * Sets the current value of the progress bar to the min value.
   */
  setToMin(): void
  /**
   * The percentage of the progress bar's value.
   */
  percent: number
  /**
   * The percentage of the progress bar's value as a string.
   */
  percentAsString: string
  /**
   * The minimum allowed value of the progress bar.
   */
  min: number
  /**
   * The maximum allowed value of the progress bar.
   */
  max: number
  /**
   * Whether the progress bar is indeterminate.
   */
  indeterminate: boolean

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getTrackProps(): T["element"]
  getValueTextProps(): T["element"]
  getRangeProps(): T["element"]
  getViewProps(props: ViewProps): T["element"]
  getCircleProps(): T["svg"]
  getCircleTrackProps(): T["circle"]
  getCircleRangeProps(): T["circle"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
