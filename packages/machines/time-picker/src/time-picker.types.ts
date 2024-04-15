import type { StateMachine as S } from "@zag-js/core"
import { Time } from "@internationalized/date"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { Placement, PositioningOptions } from "@zag-js/popper"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type TimePeriod = "am" | "pm" | null

export interface OpenChangeDetails {
  open: boolean
}

export interface ValueChangeDetails {
  value?: Time
}

export interface FocusChangeDetails extends ValueChangeDetails {}

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
   * The selected time.
   */
  value?: Time
  /**
   * Whether the timepicker is open
   */
  open?: boolean
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
  period: TimePeriod
  currentPlacement?: Placement
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface MachineApi<T extends PropTypes = PropTypes> {
  isOpen: boolean
  triggerProps: T["element"]
  positionerProps: T["element"]
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Time }
