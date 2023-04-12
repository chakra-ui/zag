import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type RGB = "red" | "green" | "blue"

type HSL = "hue" | "saturation" | "lightness"

type Alpha = "alpha"

export type ChannelProps = {
  channel: RGB | HSL | Alpha
}

type PublicContext = DirectionProperty &
  CommonProperties & {
    disabled?: boolean
    orientation: "horizontal" | "vertical"
  }

type PrivateContext = Context<{}>

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
