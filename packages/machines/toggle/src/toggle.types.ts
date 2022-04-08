import type { StateMachine as S } from "@zag-js/core"
import { Context } from "@zag-js/types"

type IntlMessages = {
  buttonLabel: string
}

export type ToggleMachineContext = Context<{
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
  /**
   * Whether the toggle is disabled.
   */
  disabled?: boolean
  /**
   * Function to call when the toggle is clicked.
   */
  onChange?: (details: { pressed: boolean }) => void
}>

export type ToggleMachineState = {
  value: "unknown" | "pressed" | "unpressed"
}

export type ToggleState = S.State<ToggleMachineContext, ToggleMachineState>

export type ToggleSend = S.Send<S.AnyEventObject>
