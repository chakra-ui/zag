import type { EventObject, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, Required, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type PanelId = string | number

export interface PanelSizeData {
  id: PanelId
  size?: number | undefined
  minSize?: number | undefined
  maxSize?: number | undefined
}

export interface SizeChangeDetails {
  size: PanelSizeData[]
  activeHandleId: string | null
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
  size?: PanelSizeData[] | undefined
  /**
   * The initial size of the panels when rendered.
   * Use when you don't need to control the size of the panels.
   */
  defaultSize?: PanelSizeData[] | undefined
  /**
   * Function called when the splitter is resized.
   */
  onSizeChange?: ((details: SizeChangeDetails) => void) | undefined
  /**
   * Function called when the splitter resize ends.
   */
  onSizeChangeEnd?: ((details: SizeChangeDetails) => void) | undefined
  /**
   * The ids of the elements in the splitter. Useful for composition.
   */
  ids?: ElementIds | undefined
}

export type PropWithDefault = "orientation"

export type NormalizedPanelData = Array<
  Required<PanelSizeData> & {
    remainingSize: number
    minSize: number
    maxSize: number
    start: number
    end: number
  }
>

type ComputedContext = Readonly<{
  isHorizontal: boolean
  panels: NormalizedPanelData
  activeResizeBounds?: { min: number; max: number } | undefined
  activeResizePanels?: { before: PanelSizeData; after: PanelSizeData } | undefined
}>

export interface ResizeState {
  isAtMin: boolean
  isAtMax: boolean
}

interface PrivateContext {
  activeResizeId: string | null
  activeResizeState: ResizeState
  size: PanelSizeData[]
}

interface Refs {
  previousPanels: NormalizedPanelData
}

export interface SplitterSchema {
  state: "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tag: "focus"
  props: RequiredBy<SplitterProps, PropWithDefault>
  context: PrivateContext
  refs: Refs
  computed: ComputedContext
  action: string
  event: EventObject
  effect: string
  guard: string
}

export type SplitterService = Service<SplitterSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface PanelProps {
  id: PanelId
  snapSize?: number | undefined
}

export interface ResizeTriggerProps {
  id: `${PanelId}:${PanelId}`
  step?: number | undefined
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

export interface SplitterApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the splitter is focused.
   */
  focused: boolean
  /**
   * Whether the splitter is being dragged.
   */
  dragging: boolean
  /**
   *  The bounds of the currently dragged splitter handle.
   */
  bounds: PanelBounds | undefined
  /**
   * Function to set a panel to its minimum size.
   */
  setToMinSize(id: PanelId): void
  /**
   * Function to set a panel to its maximum size.
   */
  setToMaxSize(id: PanelId): void
  /**
   * Function to set the size of a panel.
   */
  setSize(id: PanelId, size: number): void
  /**
   * Returns the state details for a resize trigger.
   */
  getResizeTriggerState(props: ResizeTriggerProps): ResizeTriggerState
  getRootProps(): T["element"]
  getPanelProps(props: PanelProps): T["element"]
  getResizeTriggerProps(props: ResizeTriggerProps): T["element"]
}
