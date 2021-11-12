import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type SplitviewMachineContext = Context<{}>

export type SplitviewMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type SplitviewState = S.State<SplitviewMachineContext, SplitviewMachineState>

export type SplitviewSend = S.Send<S.AnyEventObject>

export type SplitviewItemProps = {
  value: string
  disabled?: boolean
}
