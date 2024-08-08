import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type PanelId = string | number

export interface PanelSizeData {
  id: PanelId
  size?: number
  minSize?: number
  maxSize?: number
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

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The orientation of the splitter. Can be `horizontal` or `vertical`
   */
  orientation: "horizontal" | "vertical"
  /**
   * The size data of the panels
   */
  size: PanelSizeData[]
  /**
   * Function called when the splitter is resized.
   */
  onSizeChange?: (details: SizeChangeDetails) => void
  /**
   * Function called when the splitter resize ends.
   */
  onSizeChangeEnd?: (details: SizeChangeDetails) => void
  /**
   * The ids of the elements in the splitter. Useful for composition.
   */
  ids?: ElementIds
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

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
  activeResizeBounds?: { min: number; max: number }
  activeResizePanels?: { before: PanelSizeData; after: PanelSizeData }
}>

interface PrivateContext {
  activeResizeId: string | null
  previousPanels: NormalizedPanelData
  activeResizeState: { isAtMin: boolean; isAtMax: boolean }
  initialSize: Array<Required<Pick<PanelSizeData, "id" | "size">>>
}

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tags: "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface PanelProps {
  id: PanelId
  snapSize?: number
}

export interface ResizeTriggerProps {
  id: `${PanelId}:${PanelId}`
  step?: number
  disabled?: boolean
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

export interface MachineApi<T extends PropTypes = PropTypes> {
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
