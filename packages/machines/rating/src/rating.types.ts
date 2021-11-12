import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "../utils"

export type RatingMachineContext = Context<{}>

export type RatingMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type RatingState = S.State<RatingMachineContext, RatingMachineState>

export type RatingSend = S.Send<S.AnyEventObject>

export type RatingItemProps = {
  value: string
  disabled?: boolean
}
