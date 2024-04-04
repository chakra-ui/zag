import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { StrokeOptions } from "perfect-freehand"

interface Point {
  x: number
  y: number
  pressure: number
}

export interface DrawDetails {
  paths: string[]
}

export interface DrawingOptions extends StrokeOptions {
  /**
   * The color of the stroke.
   * Note: Must be a valid CSS color string, not a css variable.
   */
  fill?: string
}

export type DataUrlType = "image/png" | "image/jpeg" | "image/svg+xml"

export interface DrawEndDetails {
  paths: string[]
  getDataUrl(type: DataUrlType, quality?: number): Promise<string>
}

export interface DataUrlOptions {
  type: DataUrlType
  quality?: number
}

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * Callback when the signature pad is drawing.
   */
  onDraw?(details: DrawDetails): void
  /**
   * Callback when the signature pad is done drawing.
   */
  onDrawEnd?(details: DrawEndDetails): void
  /**
   * The drawing options.
   */
  drawing: DrawingOptions
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

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface LayerProps {
  path: string
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the signature pad is empty.
   */
  isEmpty: boolean
  /**
   * Whether the user is currently drawing.
   */
  isDrawing: boolean
  /**
   * The current path being drawn.
   */
  currentPath: string | null
  /**
   * The paths of the signature pad.
   */
  paths: string[]
  /**
   * Returns the data URL of the signature pad.
   */
  getDataUrl(type: DataUrlType, quality?: number): Promise<string>
  /**
   * Clears the signature pad.
   */
  clear(): void

  labelProps: T["element"]
  rootProps: T["element"]
  controlProps: T["element"]
  layerProps: T["svg"]
  getLayerPathProps(props: LayerProps): T["path"]
  lineProps: T["element"]
  clearTriggerProps: T["element"]
}
