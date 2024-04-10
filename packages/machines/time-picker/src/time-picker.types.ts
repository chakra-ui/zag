import type { StateMachine as S } from "@zag-js/core"
import { Time } from "@internationalized/date"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { Placement, PositioningOptions } from "@zag-js/popper"

export type ElementIds = Partial<{
  trigger: string
  input: string
  positioner: string
}>

export interface OpenChangeDetails {
  open: boolean
}

export interface ValueChangeDetails {
  value: Time
}

interface PublicContext extends DirectionProperty, CommonProperties {
  value: Time
  open?: boolean
  ids?: ElementIds
  onOpenChange?: (details: OpenChangeDetails) => void
  onValueChange?: (value: ValueChangeDetails) => void
  positioning: PositioningOptions
}

interface PrivateContext {
  period: "am" | "pm" | null
  currentPlacement?: Placement
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface MachineApi<T extends PropTypes = PropTypes> {
  isOpen: boolean
  triggerProps: T["element"]
  positionerProps: T["element"]
}
