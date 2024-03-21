import type { StateMachine as S } from "@zag-js/core"
import type { Point, RectInit, Size } from "@zag-js/rect-utils"
import type { CommonProperties, DirectionProperty, RequiredBy } from "@zag-js/types"

export interface DragDetails {
  position: Point
}

export interface ResizeDetails {
  size: Size
}

export interface OpenChangeDetails {
  open: boolean
}

export type Stage = "minimized" | "maximized"

export interface StageChangeDetails {
  stage: Stage
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
   * The minimum size of the panel
   */
  minSize?: Size
  /**
   * The maximum size of the panel
   */
  maxSize?: Size
  /**
   * The position of the panel
   */
  position: Point
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
  getBoundaryEl?(): HTMLElement
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
  /**
   * Whether the panel size and position should be preserved when it is closed
   */
  preserveOnClose?: boolean
  /**
   * The snap grid for the panel
   */
  gridSize: number
  /**
   * Function called when the stage of the panel changes
   */
  onStageChange?(details: StageChangeDetails): void
}

interface PrivateContext {
  /**
   * The rect of the boundary
   */
  boundaryRect: RectInit | null
  /**
   * The last position of the mouse event
   */
  lastEventPosition: Point | null
  /**
   * The previous position of the panel before dragging
   */
  prevPosition: Point | null
  /**
   * The previous size of the panel before resizing
   */
  prevSize: Size | null
  /**
   * The stage of the panel
   */
  stage?: Stage
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
