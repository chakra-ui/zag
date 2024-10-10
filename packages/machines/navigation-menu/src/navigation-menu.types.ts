import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, OrientationProperty, RequiredBy } from "@zag-js/types"

interface ValueChangeDetails {
  value: string | null
}

interface Size {
  width: number
  height: number
}

interface Rect extends Size {
  y: number
  x: number
}

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  value: string | null
  previousValue: string | null
  onValueChange?: (details: ValueChangeDetails) => void
  openDelay: number
  closeDelay: number
}

interface PrivateContext {
  viewportSize: Size | null
  isViewportRendered: boolean
  wasClickCloseRef: string | null
  hasPointerMoveOpenedRef: string | null

  activeContentNode: HTMLElement | null
  activeContentCleanup: VoidFunction | null

  activeTriggerRect: Rect | null
  activeTriggerNode: HTMLElement | null
  activeTriggerCleanup: VoidFunction | null
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "opening" | "open" | "closing" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState>

export interface ItemProps {
  value: string
  disabled?: boolean | undefined
}

export interface LinkProps {
  value: string
  current?: boolean | undefined
  onSelect?: (event: CustomEvent) => void
}
