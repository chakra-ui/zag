import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { SplitterRegistry } from "./utils/registry"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type ResizeEvent = PointerEvent | KeyboardEvent

export type PanelId = string
export type ResizeTriggerId = `${PanelId}:${PanelId}`

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
  minSize?: number | undefined
  /**
   * The maximum size of the panel.
   */
  maxSize?: number | undefined
  /**
   * Whether the panel is collapsible.
   */
  collapsible?: boolean | undefined
  /**
   * The size of the panel when collapsed.
   */
  collapsedSize?: number | undefined
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

export type ElementIds = Partial<{
  root: string
  resizeTrigger: (id: string) => string
  label: (id: string) => string
  panel: (id: string | number) => string
}>

export interface SplitterProps extends DirectionProperty, CommonProperties {
  /**
   * The orientation of the splitter. Can be `horizontal` or `vertical`
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
  /**
   * The controlled size data of the panels
   */
  size?: number[] | undefined
  /**
   * The initial size of the panels when rendered.
   * Use when you don't need to control the size of the panels.
   */
  defaultSize?: number[] | undefined
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
   * The number of pixels to resize the panel by when the keyboard is used.
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
  resizeTriggerRect: DOMRect
  initialCursorPosition: number
  initialSize: number[]
}

export interface KeyboardState {
  resizeTriggerId: string
}

interface Context {
  dragState: DragState | null
  keyboardState: KeyboardState | null
  size: number[]
}

interface Refs {
  panelSizeBeforeCollapse: Map<string, number>
  panelIdToLastNotifiedSizeMap: Map<string, number>
  prevDelta: number
}

export interface SplitterSchema {
  state: "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tag: "focus"
  props: RequiredBy<SplitterProps, PropsWithDefault>
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
   * Returns the current sizes of the panels.
   */
  getSizes: () => number[]
  /**
   * Sets the sizes of the panels.
   */
  setSizes: (size: number[]) => void
  /**
   * Returns the items of the splitter.
   */
  getItems: () => SplitterItem[]
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
   * Resizes the specified panel.
   */
  resizePanel: (id: PanelId, unsafePanelSize: number) => void
  /**
   * Returns the layout of the splitter.
   */
  getLayout: () => string
  /**
   * Resets the splitter to its initial state.
   */
  resetSizes: VoidFunction

  getRootProps: () => T["element"]
  getPanelProps: (props: PanelProps) => T["element"]
  getResizeTriggerProps: (props: ResizeTriggerProps) => T["element"]
}
