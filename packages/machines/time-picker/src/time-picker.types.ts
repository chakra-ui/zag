import { Time } from "@internationalized/date"
import type { Machine, StateMachine as S } from "@zag-js/core"
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

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The locale (BCP 47 language tag) to use when formatting the time.
   */
  locale: string
  /**
   * The selected time.
   */
  value: Time | null
  /**
   * Whether the timepicker is open
   */
  open?: boolean
  /**
   * Whether the timepicker open state is controlled by the user
   */
  "open.controlled"?: boolean
  /**
   * The ids of the elements in the date picker. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The `name` attribute of the input element.
   */
  name?: string
  /**
   * The user provided options used to position the time picker content
   */
  positioning: PositioningOptions
  /**
   * The placeholder text of the input.
   */
  placeholder?: string
  /**
   * Whether the time picker is disabled.
   */
  disabled?: boolean
  /**
   * Whether the time picker is read-only.
   */
  readOnly?: boolean
  /**
   * The minimum time that can be selected.
   */
  min?: Time
  /**
   * The maximum time that can be selected.
   */
  max?: Time
  /**
   * The steps of each time unit.
   */
  steps?: { hour?: number; minute?: number; second?: number }
  /**
   * Whether to show the seconds.
   */
  allowSeconds?: boolean
  /**
   * Function called when the value changes.
   */
  onValueChange?: (value: ValueChangeDetails) => void
  /**
   * Function called when the time picker opens or closes.
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * Function called when the focused date changes.
   */
  onFocusChange?: (details: FocusChangeDetails) => void
  /**
   * Whether to disable the interaction outside logic
   */
  disableLayer?: boolean
}

interface PrivateContext {
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * @internal
   * Whether the calendar should restore focus to the input when it closes.
   */
  restoreFocus?: boolean
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
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * The selected time as a string
   */
  valueAsString: string
  /**
   * @computed
   * Whether the time picker is in 12-hour format (based on the locale)
   */
  hour12: boolean
  /**
   * @computed
   * The period of the time (AM/PM)
   */
  period: TimePeriod | null
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

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

export interface MachineApi<T extends PropTypes = PropTypes> {
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
