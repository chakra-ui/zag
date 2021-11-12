import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type TagsinputMachineContext = Context<{}>

export type TagsinputMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type TagsinputState = S.State<TagsinputMachineContext, TagsinputMachineState>

export type TagsinputSend = S.Send<S.AnyEventObject>

export type TagsinputItemProps = {
  value: string
  disabled?: boolean
}
