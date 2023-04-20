import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

export type PanelId = string | number

type PanelSizeData = {
  id: PanelId
  size?: number
  minSize?: number
  maxSize?: number
}

type ResizeDetails = {
  size: PanelSizeData[]
  activeHandleId: string | null
}

type ElementIds = Partial<{
  root: string
  resizeTrigger(id: string): string
  toggleTrigger(id: string): string
  label(id: string): string
  panel(id: string | number): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
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
    onResize?: (details: ResizeDetails) => void
    /**
     * Function called when the splitter resize starts.
     */
    onResizeStart?: (details: ResizeDetails) => void
    /**
     * Function called when the splitter resize ends.
     */
    onResizeEnd?: (details: ResizeDetails) => void
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

type PrivateContext = Context<{
  activeResizeId: string | null
  previousPanels: NormalizedPanelData
  activeResizeState: { isAtMin: boolean; isAtMax: boolean }
  initialSize: Array<Required<Pick<PanelSizeData, "id" | "size">>>
}>

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "idle" | "hover:temp" | "hover" | "dragging" | "focused"
  tags: "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type PanelProps = {
  id: PanelId
  snapSize?: number
}

export type ResizeTriggerProps = {
  id: `${PanelId}:${PanelId}`
  step?: number
  disabled?: boolean
}
