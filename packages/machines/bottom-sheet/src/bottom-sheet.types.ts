import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type SnapPoint = number | `${number}%`

export interface SnapPointChangeDetails {
  snapPoint: SnapPoint
  snapIndex: number
}

export interface OpenChangeDetails {
  open: boolean
}

interface PublicContext extends DirectionProperty, CommonProperties {
  snapPoints: SnapPoint[]
  snapIndex: number
  onSnapPointChange?: (details: SnapPointChangeDetails) => void
  modal?: boolean
  open?: boolean
  resizable?: boolean
  // resizeOnScroll?: boolean
  onOpenChange?: (details: OpenChangeDetails) => void
  closeThreshold?: number
}

interface PrivateContext {
  viewportHeight: number | null
  pointerStartPoint: { x: number; y: number; timestamp: number } | null
  visible: boolean
  dragOffset: number | null
}

type ComputedContext = Readonly<{
  snapPoint: SnapPoint
  snapPointOffsets: number[]
  snapPointOffset: number | null
  lastSnapPointOffset: number | null
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "closed" | "open" | "panning" | "closing"
  tags: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface MachineApi<T extends PropTypes = PropTypes> {
  triggerProps: T["button"]
}
