import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

export interface Time<T = number> {
  days: T
  hours: T
  minutes: T
  seconds: T
  milliseconds: T
}

export type TimePart = keyof Time

export type TimerAction = "start" | "pause" | "resume" | "reset"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface TickDetails {
  value: number
  time: Time
  formattedTime: Time<string>
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends CommonProperties {
  /**
   * Whether the timer should countdown, decrementing the timer on each tick.
   */
  countdown?: boolean
  /**
   * The total duration of the timer in milliseconds.
   */
  startMs?: number
  /**
   * The minimum count of the timer in milliseconds.
   */
  targetMs?: number
  /**
   * Whether the timer should start automatically
   */
  autoStart?: boolean
  /**
   * The interval in milliseconds to update the timer count.
   * @default 250
   */
  interval: number
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
  currentMs: number
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * The time parts of the timer count.
   */
  time: Time
  /**
   * @computed
   * The formatted time parts of the timer count.
   */
  formattedTime: Time<string>
  /**
   * @computed
   * The progress percentage of the timer.
   */
  progressPercent: number
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "running" | "paused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  type: TimePart
}

export interface ActionTriggerProps {
  action: TimerAction
}

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
   * The formatted timer count value.
   */
  time: Time
  /**
   * The formatted time parts of the timer count.
   */
  formattedTime: Time<string>
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
  /**
   * The progress percentage of the timer.
   */
  progressPercent: number

  getRootProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemValueProps(props: ItemProps): T["element"]
  getItemLabelProps(props: ItemProps): T["element"]
  getSeparatorProps(): T["element"]
  getActionTriggerProps(props: ActionTriggerProps): T["button"]
}
