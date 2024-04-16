import type { StateMachine as S } from "@zag-js/core"
import { Time } from "@internationalized/date"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { Placement, PositioningOptions } from "@zag-js/popper"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type TimePeriod = "am" | "pm"

export type TimeUnit = "hour" | "minute" | "second" | "period"

export interface OpenChangeDetails {
  open: boolean
}

export interface ValueChangeDetails {
  value?: Time
  valueAsString?: string
}

export interface FocusChangeDetails extends ValueChangeDetails {
  focusedCell: {
    value: number
    unit: TimeUnit
  }
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
  contentColumn: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The locale (BCP 47 language tag) to use when formatting the time.
   */
  locale: string
  /**
   * The selected time.
   */
  value?: Time
  /**
   * Whether the timepicker is open
   */
  open?: boolean
  /**
   * Whether the datepicker open state is controlled by the user
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
  withSeconds?: boolean
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
}

interface PrivateContext {
  /**
   * @internal
   * The period of the time (AM/PM)
   */
  period: TimePeriod
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
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the input is focused
   */
  isFocused: boolean
  /**
   * Whether the time picker is open
   */
  isOpen: boolean
  /**
   * The selected time
   */
  value: Time | undefined
  /**
   * The selected time as a string
   */
  valueAsString: string | undefined
  /**
   * Whether the time picker is in 12-hour format (based on the locale prop)
   */
  is12HourFormat: boolean
  /**
   * Function to reposition the time picker content
   */
  reposition(options?: PositioningOptions): void
  /**
   * Function to open the time picker
   */
  open(): void
  /**
   * Function to close the time picker
   */
  close(): void
  /**
   * Function to clear the selected time
   */
  clearValue(): void
  /**
   * Get the available hours that will be displayed in the time picker
   */
  getAvailableHours(): number[]
  /**
   * Get the available minutes that will be displayed in the time picker
   */
  getAvailableMinutes(): number[]
  /**
   * Get the available seconds that will be displayed in the time picker
   */
  getAvailableSeconds(): number[]

  rootProps: T["element"]
  labelProps: T["element"]
  controlProps: T["element"]
  inputProps: T["element"]
  triggerProps: T["element"]
  clearTriggerProps: T["element"]
  positionerProps: T["element"]
  contentProps: T["element"]
  getContentColumnProps(options: { type: TimeUnit }): T["element"]

  getHourCellProps(options: { hour: number }): T["element"]
  getMinuteCellProps(options: { minute: number }): T["element"]
  getSecondCellProps(options: { second: number }): T["element"]
  getPeriodCellProps(options: { period: TimePeriod }): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Time }
