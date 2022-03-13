import type { StateMachine as S } from "@ui-machines/core"
import { Context } from "@ui-machines/types"

export type ToggleMachineContext = Context<{
  /**
   * The accessible label for the toggle.
   */
  label: string
  /**
   * Whether the toggle is disabled.
   */
  disabled?: boolean
  /**
   * Function to call when the toggle is clicked.
   */
  onChange?: (pressed: boolean) => void
}>

export type ToggleMachineState = {
  value: "unknown" | "pressed" | "unpressed"
}

export type ToggleState = S.State<ToggleMachineContext, ToggleMachineState>

export type ToggleSend = S.Send<S.AnyEventObject>
