import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

export interface Time<T = number> {
  days: T
  hours: T
  minutes: T
  seconds: T
  milliseconds: T
}

export type TimePart = keyof Time

export type TimerAction = "start" | "pause" | "resume" | "reset" | "restart"

export type ElementIds = Partial<{
  root: string
  area: string
}>

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

export interface TimerProps extends CommonProperties {
  /**
   * The ids of the timer parts
   */
  ids?: ElementIds | undefined
  /**
   * Whether the timer should countdown, decrementing the timer on each tick.
   */
  countdown?: boolean | undefined
  /**
   * The total duration of the timer in milliseconds.
   */
  startMs?: number | undefined
  /**
   * The minimum count of the timer in milliseconds.
   */
  targetMs?: number | undefined
  /**
   * Whether the timer should start automatically
   */
  autoStart?: boolean | undefined
  /**
   * The interval in milliseconds to update the timer count.
   * @default 1000
   */
  interval?: number | undefined
  /**
   * Function invoked when the timer ticks
   */
  onTick?: ((details: TickDetails) => void) | undefined
  /**
   * Function invoked when the timer is completed
   */
  onComplete?: (() => void) | undefined
}

type PropsWithDefault = "interval" | "startMs"

interface Context {
  /**
   * The timer count in milliseconds.
   */
  currentMs: number
}

interface Computed {
  /**
   * The time parts of the timer count.
   */
  time: Time
  /**
   * The formatted time parts of the timer count.
   */
  formattedTime: Time<string>
  /**
   * The progress percentage of the timer.
   */
  progressPercent: number
}

export interface TimerSchema {
  state: "idle" | "running" | "paused" | "running:temp"
  props: RequiredBy<TimerProps, PropsWithDefault>
  context: Context
  computed: Computed
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type TimerService = Service<TimerSchema>

export type TimerMachine = Machine<TimerSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  type: TimePart
}

export interface ActionTriggerProps {
  action: TimerAction
}

export interface TimerApi<T extends PropTypes = PropTypes> {
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
  start: VoidFunction
  /**
   * Function to pause the timer.
   */
  pause: VoidFunction
  /**
   * Function to resume the timer.
   */
  resume: VoidFunction
  /**
   * Function to reset the timer.
   */
  reset: VoidFunction
  /**
   * Function to restart the timer.
   */
  restart: VoidFunction
  /**
   * The progress percentage of the timer.
   */
  progressPercent: number

  getRootProps: () => T["element"]
  getAreaProps: () => T["element"]
  getControlProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getItemValueProps: (props: ItemProps) => T["element"]
  getItemLabelProps: (props: ItemProps) => T["element"]
  getSeparatorProps: () => T["element"]
  getActionTriggerProps: (props: ActionTriggerProps) => T["button"]
}
