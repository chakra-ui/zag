import type { StateMachine as S } from "@zag-js/core"
import type { Point, Size } from "@zag-js/rect-utils"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface PositionChangeDetails {
  position: Point
}

export interface SizeChangeDetails {
  size: Size
}

export interface OpenChangeDetails {
  open: boolean
}

export type Stage = "minimized" | "maximized"

export interface StageChangeDetails {
  stage: Stage | undefined
}

export interface AnchorPositionDetails {
  triggerRect: DOMRect | null
  boundaryRect: DOMRect | null
}

export type ElementIds = Partial<{
  trigger: string
  positioner: string
  content: string
  title: string
  header: string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the floating panel. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The strategy to use for positioning
   * @default "absolute"
   */
  strategy: "absolute" | "fixed"
  /**
   * Whether the panel should be strictly contained within the boundary when dragging
   */
  allowOverflow: boolean
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
   * Function that returns the initial position of the panel when it is opened.
   * If provided, will be used instead of the default position.
   */
  getAnchorPosition?(details: AnchorPositionDetails): Point
  /**
   * Whether the panel is locked to its aspect ratio
   */
  lockAspectRatio?: boolean
  /**
   * Whether the panel should close when the escape key is pressed
   */
  closeOnEscape?: boolean
  /**
   * The boundary of the panel. Useful for recalculating the boundary rect when
   * the it is resized.
   */
  getBoundaryEl?(): HTMLElement | null
  /**
   *  Whether the panel is disabled
   */
  disabled?: boolean
  /**
   * Function called when the position of the panel changes via dragging
   */
  onPositionChange?(details: PositionChangeDetails): void
  /**
   * Function called when the position of the panel changes via dragging ends
   */
  onPositionChangeEnd?(details: PositionChangeDetails): void
  /**
   * Function called when the panel is opened or closed
   */
  onOpenChange?(details: OpenChangeDetails): void
  /**
   * Function called when the size of the panel changes via resizing
   */
  onSizeChange?(details: SizeChangeDetails): void
  /**
   * Function called when the size of the panel changes via resizing ends
   */
  onSizeChangeEnd?(details: SizeChangeDetails): void
  /**
   * Whether the panel size and position should be preserved when it is closed
   */
  persistRect?: boolean
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
  /**
   * Whether the panel is topmost in the panel stack
   */
  isTopmost?: boolean
}

type ComputedContext = Readonly<{
  isMaximized: boolean
  isMinimized: boolean
  isStaged: boolean
  canResize: boolean
  canDrag: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  tags: "open" | "closed"
  value: "open" | "open.dragging" | "open.resizing" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component props
 * -----------------------------------------------------------------------------*/

export type ResizeTriggerAxis = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne"

export interface ResizeTriggerProps {
  axis: ResizeTriggerAxis
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the panel is open
   */
  open: boolean
  /**
   * Function to open or close the panel
   */
  setOpen(open: boolean): void
  /**
   * Whether the panel is being dragged
   */
  dragging: boolean
  /**
   * Whether the panel is being resized
   */
  resizing: boolean

  dragTriggerProps: T["element"]
  getResizeTriggerProps(props: ResizeTriggerProps): T["element"]
  triggerProps: T["button"]
  positionerProps: T["element"]
  contentProps: T["element"]
  titleProps: T["element"]
  headerProps: T["element"]
  bodyProps: T["element"]
  closeTriggerProps: T["button"]
  minimizeTriggerProps: T["button"]
  maximizeTriggerProps: T["button"]
  restoreTriggerProps: T["button"]
}
