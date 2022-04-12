import type { StateMachine as S } from "@zag-js/core"
import { Context } from "@zag-js/types"

type IdMap = Partial<{
  root: string
  button: string
}>

export type MachineContext = Context<{
  /**
   * The ids of the elements in the toggle. Useful for composition.
   */
  ids?: IdMap
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
}>

export type MachineState = {
  value: "unknown" | "pressed" | "unpressed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
