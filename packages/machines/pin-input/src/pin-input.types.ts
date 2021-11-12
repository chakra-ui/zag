import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type PininputMachineContext = Context<{}>

export type PininputMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type PininputState = S.State<PininputMachineContext, PininputMachineState>

export type PininputSend = S.Send<S.AnyEventObject>

export type PininputItemProps = {
  value: string
  disabled?: boolean
}
