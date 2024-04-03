import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, RequiredBy } from "@zag-js/types"
import type { StrokeOptions } from "perfect-freehand"

interface Point {
  x: number
  y: number
  pressure: number
}

export interface ValueChangeDetails {
  paths: string[]
}

export interface ValueChangeEndDetails {
  paths: string[]
  dataUrl(type: string, quality?: number): string
}

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * Callback when the signature pad is drawing.
   */
  onValueChange?(details: ValueChangeDetails): void
  /**
   * Callback when the signature pad is done drawing.
   */
  onValueChangeEnd?(details: ValueChangeEndDetails): void
  /**
   * The options object for the underlying `getStroke` or `getStrokePoints`.
   */
  strokeOptions: StrokeOptions
  /**
   * Whether the signature pad is disabled.
   */
  disabled?: boolean
  /**
   * Whether the signature pad is read-only.
   */
  readOnly?: boolean
}

interface PrivateContext {
  /**
   * The layers of the signature pad. A layer is a snapshot of a single stroke interaction.
   */
  paths: string[]
  /**
   * The current layer points.
   */
  currentPoints: Point[]
  /**
   * The current stroke path
   */
  currentPath: string | null
}

type ComputedContext = Readonly<{
  isInteractive: boolean
  isEmpty: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "drawing"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface LayerProps {
  path: string
}
