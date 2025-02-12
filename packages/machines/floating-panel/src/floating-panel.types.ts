import type { EventObject, Service } from "@zag-js/core"
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

export interface FloatingPanelProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the floating panel. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The strategy to use for positioning
   * @default "absolute"
   */
  strategy: "absolute" | "fixed"
  /**
   * Whether the panel should be strictly contained within the boundary when dragging
   * @default true
   */
  allowOverflow: boolean
  /**
   * Whether the panel is open
   */
  open?: boolean | undefined
  /**
   * The default open state of the panel
   * @default false
   */
  defaultOpen?: boolean | undefined
  /**
   * Whether the panel is draggable
   * @default true
   */
  draggable?: boolean | undefined
  /**
   * Whether the panel is resizable
   * @default true
   */
  resizable?: boolean | undefined
  /**
   * The size of the panel
   */
  size?: Size | undefined
  /**
   * The default size of the panel
   */
  defaultSize?: Size | undefined
  /**
   * The minimum size of the panel
   */
  minSize?: Size | undefined
  /**
   * The maximum size of the panel
   */
  maxSize?: Size | undefined
  /**
   * The position of the panel
   */
  position?: Point | undefined
  /**
   * The default position of the panel
   */
  defaultPosition?: Point | undefined
  /**
   * Function that returns the initial position of the panel when it is opened.
   * If provided, will be used instead of the default position.
   */
  getAnchorPosition?: ((details: AnchorPositionDetails) => Point) | undefined
  /**
   * Whether the panel is locked to its aspect ratio
   */
  lockAspectRatio?: boolean | undefined
  /**
   * Whether the panel should close when the escape key is pressed
   */
  closeOnEscape?: boolean | undefined
  /**
   * The boundary of the panel. Useful for recalculating the boundary rect when
   * the it is resized.
   */
  getBoundaryEl?: (() => HTMLElement | null) | undefined
  /**
   *  Whether the panel is disabled
   */
  disabled?: boolean | undefined
  /**
   * Function called when the position of the panel changes via dragging
   */
  onPositionChange?: ((details: PositionChangeDetails) => void) | undefined
  /**
   * Function called when the position of the panel changes via dragging ends
   */
  onPositionChangeEnd?: ((details: PositionChangeDetails) => void) | undefined
  /**
   * Function called when the panel is opened or closed
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Function called when the size of the panel changes via resizing
   */
  onSizeChange?: ((details: SizeChangeDetails) => void) | undefined
  /**
   * Function called when the size of the panel changes via resizing ends
   */
  onSizeChangeEnd?: ((details: SizeChangeDetails) => void) | undefined
  /**
   * Whether the panel size and position should be preserved when it is closed
   */
  persistRect?: boolean | undefined
  /**
   * The snap grid for the panel
   * @default 1
   */
  gridSize: number
  /**
   * Function called when the stage of the panel changes
   */
  onStageChange?: ((details: StageChangeDetails) => void) | undefined
}

type PropWithDefault =
  | "strategy"
  | "gridSize"
  | "defaultSize"
  | "defaultPosition"
  | "allowOverflow"
  | "draggable"
  | "resizable"

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
  stage?: Stage | undefined
  /**
   * Whether the panel is topmost in the panel stack
   */
  isTopmost?: boolean | undefined
  /**
   * The size of the panel
   */
  size: Size
  /**
   * The position of the panel
   */
  position: Point
}

type ComputedContext = Readonly<{
  isMaximized: boolean
  isMinimized: boolean
  isStaged: boolean
  canResize: boolean
  canDrag: boolean
}>

export interface FloatingPanelSchema {
  props: RequiredBy<FloatingPanelProps, PropWithDefault>
  context: PrivateContext
  computed: ComputedContext
  tag: "open" | "closed"
  state: "open" | "open.dragging" | "open.resizing" | "closed"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type FloatingPanelService = Service<FloatingPanelSchema>

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

export interface FloatingPanelApi<T extends PropTypes = PropTypes> {
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

  getDragTriggerProps(): T["element"]
  getResizeTriggerProps(props: ResizeTriggerProps): T["element"]
  getTriggerProps(): T["button"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getTitleProps(): T["element"]
  getHeaderProps(): T["element"]
  getBodyProps(): T["element"]
  getCloseTriggerProps(): T["button"]
  getMinimizeTriggerProps(): T["button"]
  getMaximizeTriggerProps(): T["button"]
  getRestoreTriggerProps(): T["button"]
}
