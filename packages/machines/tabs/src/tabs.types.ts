import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type TabsMachineContext = Context<{}>

export type TabsMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type TabsState = S.State<TabsMachineContext, TabsMachineState>

export type TabsSend = S.Send<S.AnyEventObject>

export type TabsItemProps = {
  value: string
  disabled?: boolean
}
