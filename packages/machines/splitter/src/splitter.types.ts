import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"
import type { SplitterRegistry } from "./utils/registry"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type ResizeEvent = PointerEvent | KeyboardEvent

export type PanelId = string
export type ResizeTriggerId = `${PanelId}:${PanelId}` | `${PanelId}:` | `:${PanelId}`
export type PanelSize = number | string
export type PanelResizeBehavior = "preserve-relative-size" | "preserve-pixel-size"

export interface PanelData {
  /**
   * The id of the panel.
   */
  id: PanelId
  /**
   * The order of the panel. useful of you intend to conditionally render the panel.
   */
  order?: number | undefined
  /**
   * The minimum size of the panel.
   */
  minSize?: PanelSize | undefined
  /**
   * The maximum size of the panel.
   */
  maxSize?: PanelSize | undefined
  /**
   * Whether the panel is collapsible.
   */
  collapsible?: boolean | undefined
  /**
   * How the panel should behave when the parent group is resized.
   */
  resizeBehavior?: PanelResizeBehavior | undefined
  /**
   * The size of the panel when collapsed.
   */
  collapsedSize?: PanelSize | undefined
  /**
   * How far a drag must go to collapse or expand the panel. Defaults to half the gap between `collapsedSize` and `minSize`.
   */
  collapsedThreshold?: PanelSize | undefined
  /**
   * Whether the panel's size is locked
   */
  disabled?: boolean | undefined
}

// zag-ignore-export
export type NormalizedPanelData = Omit<PanelData, "minSize" | "maxSize" | "collapsedSize" | "collapsedThreshold"> & {
  minSize?: number | undefined
  maxSize?: number | undefined
  collapsedSize?: number | undefined
  collapsedThreshold?: number | undefined
}

export interface CursorState {
  isAtMin: boolean
  isAtMax: boolean
}

export interface ResizeDetails {
  size: number[]
  resizeTriggerId: string | null
  layout: string
  expandToSizes: Record<string, number>
}

export interface ResizeEndDetails {
  size: number[]
  resizeTriggerId: string | null
}

export interface ExpandCollapseDetails {
  panelId: string
  size: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ElementIds {
  root?: string | undefined
  resizeTrigger?: ((id: string) => string) | undefined
  label?: ((id: string) => string) | undefined
  panel?: ((id: string | number) => string) | undefined
}

export interface SplitterProps extends DirectionProperty, CommonProperties {
  /**
   * Whether resizing is disabled for the whole splitter
   */
  disabled?: boolean | undefined
  /**
   * The orientation of the splitter. Can be `horizontal` or `vertical`
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
  /**
   * The controlled size data of the panels
   */
  size?: PanelSize[] | undefined
  /**
   * The initial size of the panels when rendered.
   * Use when you don't need to control the size of the panels.
   */
  defaultSize?: PanelSize[] | undefined
  /**
   * The size constraints of the panels.
   */
  panels: PanelData[]
  /**
   * Function called when the splitter is resized.
   */
  onResize?: ((details: ResizeDetails) => void) | undefined
  /**
   * Function called when the splitter resize starts.
   */
  onResizeStart?: (() => void) | undefined
  /**
   * Function called when the splitter resize ends.
   */
  onResizeEnd?: ((details: ResizeEndDetails) => void) | undefined
  /**
   * The ids of the elements in the splitter. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The percentage to resize the panel by when an arrow key is pressed.
   * @default 1
   */
  keyboardResizeBy?: number | null | undefined
  /**
   * The nonce for the injected splitter cursor stylesheet.
   */
  nonce?: string | undefined
  /**
   * Function called when a panel is collapsed.
   */
  onCollapse?: ((details: ExpandCollapseDetails) => void) | undefined
  /**
   * Function called when a panel is expanded.
   */
  onExpand?: ((details: ExpandCollapseDetails) => void) | undefined
  /**
   * The splitter registry to use for multi-drag support.
   * When provided, enables dragging at the intersection of multiple splitters.
   */
  registry?: SplitterRegistry | undefined
}

type PropsWithDefault = "orientation" | "panels"

export interface DragState {
  resizeTriggerId: string
  resolvedResizeTriggerId: `${PanelId}:${PanelId}`
  resizeTriggerRect: DOMRect
  initialCursorPosition: number
  initialSize: number[]
}

export interface KeyboardState {
  resizeTriggerId: string
  resolvedResizeTriggerId: `${PanelId}:${PanelId}` | null
}

interface Context {
  dragState: DragState | null
  keyboardState: KeyboardState | null
  size: number[]
  panels: NormalizedPanelData[]
}

interface RequestedLayout {
  size: number[]
  groupSize: number
}

interface Refs {
  panelSizeBeforeCollapse: Map<string, number>
  panelIdToLastNotifiedSizeMap: Map<string, number>
  prevDelta: number
  initialSize: number[] | null
  prevInitialLayout: string | null
  prevPanelIds: string | null
  prevSizeProps: string | null
  requestedLayout: RequestedLayout | null
  layoutCache: Map<string, RequestedLayout>
  suppressOnResize: boolean
}

export interface SplitterSchema {
  state: "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tag: "focus"
  props: SplitterProps
  defaultPropKey: PropsWithDefault
  context: Context
  computed: {
    horizontal: boolean
  }
  refs: Refs
  action: string
  event: EventObject
  effect: string
  guard: string
}

export type SplitterService = Service<SplitterSchema>

export type SplitterMachine = Machine<SplitterSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface PanelProps {
  id: PanelId
}

export interface ResizeTriggerProps {
  id: ResizeTriggerId
  disabled?: boolean | undefined
}

export interface RootState {
  /**
   * Whether any resize trigger is being dragged
   */
  dragging: boolean
  /**
   * The orientation of the splitter
   */
  orientation: "horizontal" | "vertical"
}

export interface ResizeTriggerState {
  /**
   * Whether this resize trigger is being dragged
   */
  dragging: boolean
  /**
   * Whether this resize trigger is focused or being dragged
   */
  focused: boolean
  /**
   * Whether this resize trigger is disabled, including when the splitter or an adjacent panel is disabled
   */
  disabled: boolean
}

export interface PanelItem {
  type: "panel"
  id: PanelId
}

export interface ResizeTriggerItem {
  type: "handle"
  id: ResizeTriggerId
}

export type SplitterItem = PanelItem | ResizeTriggerItem

export interface SplitterApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the splitter is currently being resized.
   */
  dragging: boolean
  /**
   * The orientation of the splitter.
   */
  orientation: "horizontal" | "vertical"
  /**
   * Returns the current sizes of the panels.
   */
  getSizes: () => number[]
  /**
   * Sets the sizes of the panels.
   */
  setSizes: (size: PanelSize[]) => void
  /**
   * Returns the items of the splitter.
   */
  getItems: () => SplitterItem[]
  /**
   * Returns the panels of the splitter.
   */
  getPanels: () => PanelData[]
  /**
   * Returns the panel with the specified id.
   */
  getPanelById: (id: PanelId) => PanelData
  /**
   * Returns the size of the specified panel.
   */
  getPanelSize: (id: PanelId) => number
  /**
   * Returns whether the specified panel is collapsed.
   */
  isPanelCollapsed: (id: PanelId) => boolean
  /**
   * Returns whether the specified panel is expanded.
   */
  isPanelExpanded: (id: PanelId) => boolean
  /**
   * Collapses the specified panel.
   */
  collapsePanel: (id: PanelId) => void
  /**
   * Expands the specified panel.
   */
  expandPanel: (id: PanelId, minSize?: number) => void
  /**
   * Resizes the specified panel. Takes a percentage, or a size with a unit such as `"200px"`.
   */
  resizePanel: (id: PanelId, size: PanelSize) => void
  /**
   * Returns the layout of the splitter.
   */
  getLayout: () => string
  /**
   * Resets the splitter to its initial state.
   */
  resetSizes: VoidFunction
  /**
   * Returns the state of the resize trigger.
   */
  getResizeTriggerState: (props: ResizeTriggerProps) => ResizeTriggerState
  /**
   * Returns the state of the root. The panels share it.
   */
  getRootState: () => RootState
  getRootProps: () => T["element"]
  getPanelProps: (props: PanelProps) => T["element"]
  getResizeTriggerProps: (props: ResizeTriggerProps) => T["element"]
  getResizeTriggerIndicator: (props: ResizeTriggerProps) => T["element"]
}
