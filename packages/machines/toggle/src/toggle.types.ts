import type { StateMachine as S } from "@ui-machines/core"
import { Context } from "@ui-machines/types"

export type ToggleMachineContext = Context<{
  disabled?: boolean
  onChange?: (pressed: boolean) => void
}>

export type ToggleMachineState = {
  value: "unknown" | "pressed" | "unpressed"
}

export type ToggleState = S.State<ToggleMachineContext, ToggleMachineState>

export type ToggleSend = S.Send<S.AnyEventObject>
