import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type DialogMachineContext = Context<{}>

export type DialogMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type DialogState = S.State<DialogMachineContext, DialogMachineState>

export type DialogSend = S.Send<S.AnyEventObject>

export type DialogItemProps = {
  value: string
  disabled?: boolean
}
