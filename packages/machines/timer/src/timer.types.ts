import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

export type TimeUnits = {
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type TickDetails = TimeUnits

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends CommonProperties {
  /**
   * The mode of the timer.
   * @default "stopwatch"
   */
  mode: "countdown" | "stopwatch"
  /**
   * The total duration of the timer in milliseconds.
   */
  duration: number
  /**
   * The minimum count of the timer in milliseconds.
   */
  min: number
  /**
   * Whether the timer should start automatically
   */
  autostart?: boolean
  /**
   * Whether the timer should pause when webpage is idle, or user switches to another tab
   */
  // pauseOnPageIdle?: boolean;
  /**
   * Function invoked when the timer ticks
   */
  onTick?: (details: TickDetails) => void
  /**
   * Function invoked when the timer is completed
   */
  onComplete?: () => void
}

interface PrivateContext {
  /**
   * @internal
   * The timer count in milliseconds.
   */
  count: number
}

type ComputedContext = Readonly<{
  countTimeUnits: TimeUnits
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "running" | "paused" | "completed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the timer is running.
   */
  running: boolean
  /**
   * Whether the timer is paused.
   */
  paused: boolean
  /**
   * Whether the timer is completed.
   */
  completed: boolean
  /**
   * The total duration of the timer in milliseconds.
   */
  duration: number
  /**
   * The timer count in milliseconds.
   */
  count: number
  /**
   * The formatted timer count value.
   */
  countTimeUnits: TimeUnits
  /**
   * Function to start the timer.
   */
  start(): void
  /**
   * Function to pause the timer.
   */
  pause(): void
  /**
   * Function to resume the timer.
   */
  resume(): void
  /**
   * Function to reset the timer.
   */
  reset(): void
  /**
   * Function to restart the timer.
   */
  restart(): void
}
