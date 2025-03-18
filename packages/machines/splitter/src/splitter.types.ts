import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type ResizeEvent = PointerEvent | KeyboardEvent

export type PanelId = string

export interface PanelData {
  id: PanelId
  order?: number | undefined
  minSize?: number | undefined
  maxSize?: number | undefined
  collapsible?: boolean | undefined
  collapsedSize?: number | undefined
}

export interface CursorState {
  isAtMin: boolean
  isAtMax: boolean
}

export interface ResizeDetails {
  size: number[]
  dragHandleId: string | null
  layout: string
  expandToSizes: Record<string, number>
}

export interface ResizeEndDetails {
  size: number[]
  dragHandleId: string | null
}

export interface ExpandCollapseDetails {
  panelId: string
  size: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

type ElementIds = Partial<{
  root: string
  resizeTrigger(id: string): string
  label(id: string): string
  panel(id: string | number): string
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
  keyboardResizeBy?: number | null
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
}

export type PropWithDefault = "orientation" | "panels"

export interface DragState {
  dragHandleId: string
  dragHandleRect: DOMRect
  initialCursorPosition: number
  initialSize: number[]
}

export interface KeyboardState {
  dragHandleId: string
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
  props: RequiredBy<SplitterProps, PropWithDefault>
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

export type DragHandleId = `${PanelId}:${PanelId}`

export interface ResizeTriggerProps {
  id: DragHandleId
  disabled?: boolean | undefined
}

export interface ResizeTriggerState {
  disabled: boolean
  focused: boolean
  panelIds: string[]
  min: number | undefined
  max: number | undefined
  value: number
}

export interface PanelBounds {
  min: number
  max: number
}

export interface PanelItem {
  type: "panel"
  id: PanelId
}

export interface ResizeTriggerItem {
  type: "handle"
  id: DragHandleId
}

export interface SplitterApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the splitter is currently being resized.
   */
  dragging: boolean
  /**
   * The current sizes of the panels.
   */
  getSizes(): number[]
  /**
   * Set the sizes of the panels.
   */
  setSizes(size: number[]): void
  /**
   * Get the items of the splitter.
   */
  getItems(): Array<PanelItem | ResizeTriggerItem>
  /**
   * Get the size of a panel.
   */
  getPanelSize(id: PanelId): number
  /**
   * Whether a panel is collapsed.
   */
  isPanelCollapsed(id: PanelId): boolean
  /**
   * Whether a panel is expanded.
   */
  isPanelExpanded(id: PanelId): boolean
  /**
   * Collapse a panel.
   */
  collapsePanel(id: PanelId): void
  /**
   * Expand a panel.
   */
  expandPanel(id: PanelId, minSize?: number): void
  /**
   * Resize a panel.
   */
  resizePanel(id: PanelId, unsafePanelSize: number): void
  /**
   * Get the layout of the splitter.
   */
  getLayout(panels?: PanelData[]): string

  getRootProps(): T["element"]
  getPanelProps(props: PanelProps): T["element"]
  getResizeTriggerProps(props: ResizeTriggerProps): T["element"]
}
