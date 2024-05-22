import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

export interface TimeSegments {
  day: number
  hour: number
  minute: number
  second: number
  millisecond: number
}

export type SegmentType = keyof TimeSegments

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface TickDetails {
  value: number
  segments: TimeSegments
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
  segments: TimeSegments
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

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface SegmentProps {
  type: SegmentType
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
  segments: TimeSegments
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

  rootProps: T["element"]
  getSegmentProps(props: SegmentProps): T["element"]
  separatorProps: T["element"]
}
