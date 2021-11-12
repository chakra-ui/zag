import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type ToastMachineContext = Context<{}>

export type ToastMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type ToastState = S.State<ToastMachineContext, ToastMachineState>

export type ToastSend = S.Send<S.AnyEventObject>

export type ToastItemProps = {
  value: string
  disabled?: boolean
}
