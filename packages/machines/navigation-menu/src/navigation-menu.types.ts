import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, OrientationProperty, RequiredBy } from "@zag-js/types"

interface ValueChangeDetails {
  value: string
}

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  value: string | null
  previousValue: string | null
  onValueChange?: (details: ValueChangeDetails) => void
  openDelay: number
  closeDelay: number
}

interface PrivateContext {
  viewportRect: Record<"width" | "height" | "top" | "left", number> | null
  activeTriggerRect: Record<"width" | "height" | "top" | "left", number> | null
  isViewportRendered: boolean
}

type ComputedContext = Readonly<{
  activeContentValue: string | null
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "opening" | "open" | "closing" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
