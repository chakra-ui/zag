import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type SliderMachineContext = Context<{}>

export type SliderMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type SliderState = S.State<SliderMachineContext, SliderMachineState>

export type SliderSend = S.Send<S.AnyEventObject>

export type SliderItemProps = {
  value: string
  disabled?: boolean
}
