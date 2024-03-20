import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, RequiredBy } from "@zag-js/types"

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Position, Size {}

export interface DragDetails {
  position: Position
}

export interface ResizeDetails {
  size: Size
}

export interface OpenChangeDetails {
  open: boolean
}

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * Whether the panel is open
   */
  open?: boolean
  /**
   * Whether the panel is draggable
   */
  draggable?: boolean
  /**
   * Whether the panel is resizable
   */
  resizable?: boolean
  /**
   * The size of the panel
   */
  size: Size
  /**
   * The position of the panel
   */
  position: Position
  /**
   * Whether the panel is locked to its aspect ratio
   */
  lockAspectRatio?: boolean
  /**
   * Whether the panel should close when the escape key is pressed
   */
  closeOnEscape?: boolean
  /**
   * The boundary of the panel. Defaults to the window
   */
  getBoundaryEl?(): { getBoundingClientRect(): DOMRect }
  /**
   *  Whether the panel is disabled
   */
  disabled?: boolean
  /**
   * Function called when the position of the panel changes via dragging
   */
  onDrag?(details: DragDetails): void
  /**
   * Function called when the position of the panel changes via dragging ends
   */
  onDragEnd?(details: DragDetails): void
  /**
   * Function called when the panel is opened or closed
   */
  onOpenChange?(details: OpenChangeDetails): void
  /**
   * Function called when the size of the panel changes via resizing
   */
  onResize?(details: ResizeDetails): void
  /**
   * Function called when the size of the panel changes via resizing ends
   */
  onResizeEnd?(details: ResizeDetails): void
}

interface PrivateContext {
  lastEventPosition: Position | null
  prevPosition: Position | null
  prevSize: Size | null
}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "open" | "closed"
  value: "open" | "open.dragging" | "open.resizing" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ResizeTriggerAxis = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne"

export interface ResizeTriggerProps {
  axis: ResizeTriggerAxis
}

export interface DockProps {
  id: string
}
