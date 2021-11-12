import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type PopoverMachineContext = Context<{}>

export type PopoverMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type PopoverState = S.State<PopoverMachineContext, PopoverMachineState>

export type PopoverSend = S.Send<S.AnyEventObject>

export type PopoverItemProps = {
  value: string
  disabled?: boolean
}
