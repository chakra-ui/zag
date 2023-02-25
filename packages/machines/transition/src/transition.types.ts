import type { StateMachine as S } from "@zag-js/core"
import type { Context } from "@zag-js/types"

type PublicContext = {
  /**
   * Whether the transition is mounted.
   */
  mounted?: boolean
  /**
   * The duration of the transition.
   */
  duration: number | { enter: number; exit: number }
  /**
   * Whether to listen to reduce motion preferences
   */
  reduceMotion?: boolean
  /**
   * Function called when the transition enters.
   */
  onEnter?: VoidFunction
  /**
   *  Function called when the transition exits.
   */
  onExit?: VoidFunction
  /**
   * Function called when the transition has entered.
   */
  onEntered?: VoidFunction
  /**
   * Function called when the transition has exited.
   */
  onExited?: VoidFunction
}

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{
  enterDuration: number
  exitDuration: number
}>

export type UserDefinedContext = Partial<PublicContext>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  tags: "enter" | "exit"
  value: "entered" | "exited" | "entering" | "exiting" | "pre-entering" | "pre-exiting"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type TransitionConfig = {
  base?: Record<string, any>
  variants: {
    enter: Record<string, any>
    exit: Record<string, any>
  }
}
