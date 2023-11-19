import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

interface ScrollChangeDetails {
  scrollTop: number
}

interface PublicContext extends DirectionProperty, CommonProperties {
  scrollBehavior: "auto" | "smooth"
  scrollMode: "top" | "bottom"
  onScrollChange?: (details: ScrollChangeDetails) => void
}

type PrivateContext = Context<{
  animateFrom: number
  animateTo: number | null | "100%"
  offsetHeight: number
  scrollHeight: number
  scrollTop: number
  canceledAt: number | null
  ignoreScrollEventBefore: number
  splineCleanup?: () => void
}>

type ComputedContext = Readonly<{
  atBottom: boolean
  atTop: boolean
  atStart: boolean
  atEnd: boolean
  isAnimating: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export type MachineState = {
  value: "idle" | "sticky" | "scrolling"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
