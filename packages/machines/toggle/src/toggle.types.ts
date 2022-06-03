import type { StateMachine as S } from "@zag-js/core"
import type { Context, DirectionProperty } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  button: string
}>

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the toggle. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  label: string
  /**
   * Whether the toggle is disabled.
   */
  disabled?: boolean
  /**
   * Function to call when the toggle is clicked.
   */
  onChange?: (details: { pressed: boolean }) => void
}

export type UserDefinedContext = Partial<PublicContext>

type ComputedContext = Readonly<{}>

type PrivateContext = Context<{}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "unknown" | "pressed" | "unpressed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
