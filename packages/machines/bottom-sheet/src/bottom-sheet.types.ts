import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Point, RequiredBy } from "@zag-js/types"

export type SnapPoint = number | `${number}%`

export interface SnapPointChangeDetails {
  snapPoint: SnapPoint
  snapIndex: number
}

export interface OpenChangeDetails {
  open: boolean
}

export interface BottomSheetProps extends DirectionProperty, CommonProperties {
  /**
   * The snap points of the bottom sheet.
   */
  snapPoints?: SnapPoint[]
  /**
   * The index of the snap point to use.
   */
  snapIndex?: number
  /**
   * The default index of the snap point to use.
   */
  defaultSnapIndex?: number
  /**
   * Function called when the snap point changes.
   */
  onSnapPointChange?: (details: SnapPointChangeDetails) => void
  /**
   * Whether the bottom sheet is modal.
   */
  modal?: boolean
  /**
   * Whether the bottom sheet is resizable.
   */
  open?: boolean
  /**
   * The initial open state of the bottom sheet.
   */
  defaultOpen?: boolean
  /**
   * Whether the bottom sheet is resizable.
   */
  resizable?: boolean
  /**
   * Function called when the open state changes.
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * The threshold at which the bottom sheet will close.
   */
  closeThreshold?: number
}

export type UserDefinedContext = RequiredBy<BottomSheetProps, "id">

type PropsWithDefault = "modal" | "resizable" | "snapPoints" | "defaultSnapIndex"

export interface BottomSheetSchema {
  props: RequiredBy<BottomSheetProps, PropsWithDefault>
  state: "closed" | "open" | "panning" | "closing"
  tag: "open" | "closed"
  context: {
    viewportHeight: number | null
    pointerStartPoint: Point | null
    visible: boolean
    dragOffset: number | null
    snapIndex: number
  }
  computed: Readonly<{
    snapPoint: SnapPoint
    snapPointOffsets: number[]
    snapPointOffset: number | null
    lastSnapPointOffset: number | null
  }>
  event: EventObject
  action: string
  effect: string
  guard: string
  active: string
}

export type BottomSheetService = Service<BottomSheetSchema>

export type BottomSheetMachine = Machine<BottomSheetSchema>
