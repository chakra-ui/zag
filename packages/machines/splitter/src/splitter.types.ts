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

type PublicContext = DirectionProperty &
  CommonProperties & {
    // pushSiblings?: boolean
    orientation: "horizontal" | "vertical"
    size: PanelSizeData[]
    onResize?: (details: ResizeDetails) => void
    onResizeStart?: (details: ResizeDetails) => void
    onResizeEnd?: (details: ResizeDetails) => void
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
  value: "unknown" | "idle" | "hover:temp" | "hover" | "dragging" | "focused"
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
