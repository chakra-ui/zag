import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, RequiredBy } from "@zag-js/types"

type PublicContext = CommonProperties & {
  delayMs?: number
  onLoad?: () => void
  onError?: () => void
}

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "loading" | "error" | "loaded"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
