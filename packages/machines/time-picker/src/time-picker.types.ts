import { Time } from "@internationalized/date"
import type { EventObject, Service } from "@zag-js/core"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type TimePeriod = "am" | "pm"

export type TimeUnit = "hour" | "minute" | "second" | "period"

export interface OpenChangeDetails {
  open: boolean
}

export interface ValueChangeDetails {
  value: Time | null
  valueAsString: string
}

export interface FocusChangeDetails extends ValueChangeDetails {
  focusedUnit: TimeUnit
  focusedValue: any
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  trigger: string
  input: string
  positioner: string
  content: string
  clearTrigger: string
  control: string
  column(unit: TimeUnit): string
}>

export interface TimePickerProps extends DirectionProperty, CommonProperties {
  /**
   * The locale (BCP 47 language tag) to use when formatting the time.
   */
  locale?: string | undefined
  /**
   * The selected time.
   */
  value?: Time | null | undefined
  /**
   * The default selected time.
   */
  defaultValue?: Time | null | undefined
  /**
   * Whether the timepicker is open
   */
  open?: boolean | undefined
  /**
   * Whether the timepicker open state is controlled by the user
   */
  defaultOpen?: boolean | undefined
  /**
   * The ids of the elements in the date picker. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The `name` attribute of the input element.
   */
  name?: string | undefined
  /**
   * The user provided options used to position the time picker content
   */
  positioning: PositioningOptions
  /**
   * The placeholder text of the input.
   */
  placeholder?: string | undefined
  /**
   * Whether the time picker is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the time picker is read-only.
   */
  readOnly?: boolean | undefined
  /**
   * The minimum time that can be selected.
   */
  min?: Time | undefined
  /**
   * The maximum time that can be selected.
   */
  max?: Time | undefined
  /**
   * The steps of each time unit.
   */
  steps?: { hour?: number; minute?: number; second?: number } | undefined
  /**
   * Whether to show the seconds.
   */
  allowSeconds?: boolean | undefined
  /**
   * Function called when the value changes.
   */
  onValueChange?: ((value: ValueChangeDetails) => void) | undefined
  /**
   * Function called when the time picker opens or closes.
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Function called when the focused date changes.
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   * Whether to disable the interaction outside logic
   */
  disableLayer?: boolean | undefined
}

type PropsWithDefault = "positioning" | "locale"

interface PrivateContext {
  /**
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement | undefined
  /**
   * Whether the calendar should restore focus to the input when it closes.
   */
  restoreFocus?: boolean | undefined
  /**
   * The focused unit column
   */
  focusedColumn: TimeUnit
  /**
   * The focused cell value
   */
  focusedValue: any
  /**
   * The current time
   */
  currentTime: Time | null
  /**
   * The selected time
   */
  value: Time | null
}

type ComputedContext = Readonly<{
  /**
   * The selected time as a string
   */
  valueAsString: string
  /**
   * Whether the time picker is in 12-hour format (based on the locale)
   */
  hour12: boolean
  /**
   * The period of the time (AM/PM)
   */
  period: TimePeriod | null
}>

export interface TimePickerSchema {
  state: "idle" | "focused" | "open"
  context: PrivateContext
  props: RequiredBy<TimePickerProps, PropsWithDefault>
  computed: ComputedContext
  private: PrivateContext
  action: string
  event: EventObject
  effect: string
  guard: string
}

export type TimePickerService = Service<TimePickerSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ColumnProps {
  unit: TimeUnit
}

export interface CellProps {
  value: number
}

export interface PeriodCellProps {
  value: TimePeriod
}

export interface Cell {
  label: string
  value: number
}

export interface TimePickerApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the input is focused
   */
  focused: boolean
  /**
   * Whether the time picker is open
   */
  open: boolean
  /**
   * The selected time
   */
  value: Time | null
  /**
   * The selected time as a string
   */
  valueAsString: string | undefined
  /**
   * Whether the time picker is in 12-hour format (based on the locale prop)
   */
  hour12: boolean
  /**
   * Function to reposition the time picker content
   */
  reposition(options?: PositioningOptions): void
  /**
   * Function to open the time picker
   */
  setOpen(nextOpen: boolean): void
  /**
   * Function to clear the selected time
   */
  clearValue(): void
  /**
   * Function to set the selected time
   */
  setValue(value: string | Time): void
  /**
   * Function to set the focused time unit
   */
  setUnitValue(unit: "period", value: TimePeriod): void
  /**
   * Function to set the focused time unit
   */
  setUnitValue(unit: TimeUnit, value: number): void
  /**
   * Get the available hours that will be displayed in the time picker
   */
  getHours(): Cell[]
  /**
   * Get the available minutes that will be displayed in the time picker
   */
  getMinutes(): Cell[]
  /**
   * Get the available seconds that will be displayed in the time picker
   */
  getSeconds(): Cell[]

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getControlProps(): T["element"]
  getInputProps(): T["element"]
  getTriggerProps(): T["element"]
  getSpacerProps(): T["element"]
  getClearTriggerProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getColumnProps(options: ColumnProps): T["element"]
  getHourCellProps(options: CellProps): T["element"]
  getMinuteCellProps(options: CellProps): T["element"]
  getSecondCellProps(options: CellProps): T["element"]
  getPeriodCellProps(options: PeriodCellProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Time, PositioningOptions }
