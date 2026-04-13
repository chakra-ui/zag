import type { EventObject, Machine, Service } from "@zag-js/core"
import type { LiveRegion } from "@zag-js/live-region"
import type { Point, Rect } from "@zag-js/rect-utils"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Drop placement
 * -----------------------------------------------------------------------------*/

export type DropPlacement = "before" | "after" | "on"

/* -----------------------------------------------------------------------------
 * Collision detection
 * -----------------------------------------------------------------------------*/

export interface DropEntry {
  value: string
  rect: Rect
}

export interface CollisionOptions {
  edgeThreshold: number
  allowDropOn: boolean
  orientation: "vertical" | "horizontal"
}

export interface CollisionResult {
  value: string
  placement: DropPlacement
}

export type CollisionStrategy = (
  pointer: Point,
  entries: DropEntry[],
  options: CollisionOptions,
) => CollisionResult | null

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface DragStartDetails {
  source: string
  values: string[]
}

export interface DragOverDetails {
  source: string
  values: string[]
  target: string
  placement: DropPlacement
}

export interface DropDetails {
  source: string
  values: string[]
  target: string
  placement: DropPlacement
}

export interface DragEndDetails {
  source: string
  values: string[]
  target: string | null
  placement: DropPlacement | null
  dropped: boolean
}

/* -----------------------------------------------------------------------------
 * Translations
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  pickup: (source: string) => string
  dragOver: (source: string, target: string, placement: DropPlacement) => string
  drop: (source: string, target: string, placement: DropPlacement) => string
  cancel: (source: string) => string
  instructions: string
}

/* -----------------------------------------------------------------------------
 * Element IDs
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  draggable: (value: string) => string
  dropTarget: (value: string) => string
  dropIndicator: (value: string, placement: DropPlacement) => string
}>

/* -----------------------------------------------------------------------------
 * Component props for connect
 * -----------------------------------------------------------------------------*/

export interface DraggableProps {
  value: string
  disabled?: boolean | undefined
}

export interface DropTargetProps {
  value: string
  disabled?: boolean | undefined
}

export interface DropIndicatorProps {
  value: string
  placement: DropPlacement
}

export interface DragHandleProps {
  value: string
  disabled?: boolean | undefined
}

export interface ItemState {
  isDragging: boolean
  isOver: boolean
  dropPlacement: DropPlacement | null
  isDisabled: boolean
}

/* -----------------------------------------------------------------------------
 * Machine props
 * -----------------------------------------------------------------------------*/

export interface DndProps extends DirectionProperty, CommonProperties {
  /**
   * The supported drop placements.
   * @default ["before", "after"]
   */
  dropPlacements?: DropPlacement[] | undefined
  /**
   * The collision detection strategy.
   * @default closestEdge
   */
  collisionStrategy?: CollisionStrategy | undefined
  /**
   * The orientation of the list.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | undefined
  /**
   * Pixel threshold from edges for before/after detection when "drop on" is valid.
   * @default 5
   */
  edgeThreshold?: number | undefined
  /**
   * Milliseconds to keep a drop target active after the pointer leaves
   * (prevents flicker on gaps between items).
   * @default 150
   */
  stickyDelay?: number | undefined
  /**
   * Debounce delay in milliseconds for live region announcements and onDragOver callbacks
   * during pointer drag. Prevents overwhelming screen readers and excessive callback invocations.
   * @default 500
   */
  dragOverDelay?: number | undefined
  /**
   * Pixel margin from the scrollable container edges that triggers auto-scrolling.
   * Set to 0 to disable auto-scroll.
   * @default 20
   */
  scrollThreshold?: number | undefined
  /**
   * Number of columns in a grid layout. When set, enables grid-mode collision
   * detection and 4-directional keyboard navigation.
   */
  columnCount?: number | undefined
  /**
   * The values of items currently selected. When the user drags one of the
   * selected items, all selected items are included in the drag operation.
   */
  selectedValues?: string[] | undefined
  /**
   * Activation constraint for pointer drag. Prevents accidental drags.
   */
  activationConstraint?: { distance?: number | undefined; delay?: number | undefined } | undefined
  /**
   * Whether the given item value can be dragged.
   */
  canDrag?: ((value: string) => boolean) | undefined
  /**
   * Whether a drop is allowed at the given target and placement.
   * Use this to prevent dropping on self, descendants, etc.
   */
  canDrop?: ((source: string, target: string, placement: DropPlacement) => boolean) | undefined
  /**
   * Resolve a human-readable label for a value. Used for live region announcements.
   * If not provided, falls back to the element's textContent.
   */
  getValueText?: ((value: string) => string) | undefined
  /**
   * Called when a drag starts.
   */
  onDragStart?: ((details: DragStartDetails) => void) | undefined
  /**
   * Called when the drag moves over a new target.
   */
  onDragOver?: ((details: DragOverDetails) => void) | undefined
  /**
   * Called when the item is dropped on a valid target.
   */
  onDrop?: ((details: DropDetails) => void) | undefined
  /**
   * Called when the drag ends (either by dropping or cancelling).
   */
  onDragEnd?: ((details: DragEndDetails) => void) | undefined
  /**
   * The ids of the elements in the dnd. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Translations for live region announcements.
   */
  translations?: Partial<IntlTranslations> | undefined
}

type PropsWithDefault =
  | "orientation"
  | "dropPlacements"
  | "edgeThreshold"
  | "stickyDelay"
  | "dragOverDelay"
  | "scrollThreshold"

/* -----------------------------------------------------------------------------
 * Schema
 * -----------------------------------------------------------------------------*/

interface Context {
  dragSource: string | null
  dropTarget: string | null
  dropPlacement: DropPlacement | null
  pointerPosition: Point | null
}

interface Refs {
  liveRegion: LiveRegion | null
  ariaHideCleanup: VoidFunction | null
  pointerOrigin: Point | null
  announceTimer: ReturnType<typeof setTimeout> | null
  stickyTimer: ReturnType<typeof setTimeout> | null
  dragOverTimer: ReturnType<typeof setTimeout> | null
  activationTimer: ReturnType<typeof setTimeout> | null
  pendingValue: string | undefined
  didDrop: boolean
  autoScrollMove: ((x: number, y: number) => void) | null
  dropTargetSequence: string[]
  dropTargetIndex: number
}

export interface DndSchema {
  state: "idle" | "pointer:pending" | "pointer:dragging" | "keyboard:session"
  props: RequiredBy<DndProps, PropsWithDefault>
  context: Context
  refs: Refs
  action: string
  effect: string
  event: EventObject
  guard: string
}

export type DndService = Service<DndSchema>

export type DndMachine = Machine<DndSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface DndApi<T extends PropTypes = PropTypes> {
  /**
   * Whether a drag is in progress.
   */
  isDragging: boolean
  /**
   * Whether a keyboard drag session is active.
   */
  isKeyboardDragging: boolean
  /**
   * The value of the item being dragged (the one the user grabbed).
   */
  dragSource: string | null
  /**
   * All values being dragged. Includes selected items when multi-item drag is active.
   */
  dragValues: string[]
  /**
   * The value of the current drop target.
   */
  dropTarget: string | null
  /**
   * The current drop placement relative to the target.
   */
  dropPlacement: DropPlacement | null
  /**
   * Get the drag/drop state for a specific item.
   */
  getItemState(value: string): ItemState
  /**
   * Programmatically cancel the current drag.
   */
  cancelDrag(): void

  /**
   * The current pointer position during drag. Null when not dragging.
   */
  pointerPosition: Point | null
  /**
   * Keyboard instructions text for screen readers.
   * Automatically set as `aria-description` on draggable and drag handle elements.
   */
  instructions: string

  getRootProps(): T["element"]
  getDraggableProps(props: DraggableProps): T["element"]
  getDragHandleProps(props: DragHandleProps): T["element"]
  getDropTargetProps(props: DropTargetProps): T["element"]
  getDropIndicatorProps(props: DropIndicatorProps): T["element"]
  getDragPreviewProps(): T["element"]
}
