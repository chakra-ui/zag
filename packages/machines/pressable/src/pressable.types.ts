import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type PressableMachineContext = Context<{}>

export type PressableMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type PressableState = S.State<PressableMachineContext, PressableMachineState>

export type PressableSend = S.Send<S.AnyEventObject>

export type PressableItemProps = {
  value: string
  disabled?: boolean
}
