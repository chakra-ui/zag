import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, Point, PropTypes, RequiredBy } from "@zag-js/types"

export type SnapPoint = number | `${number}%`

export interface OpenChangeDetails {
  open: boolean
}

export interface BottomSheetProps extends DirectionProperty, CommonProperties, DismissableElementHandlers {
  /**
   * Whether the bottom sheet is resizable.
   */
  open?: boolean | undefined
  /**
   * The initial open state of the bottom sheet.
   */
  defaultOpen?: boolean | undefined
  /**
   * Function called when the open state changes.
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Whether to close the bottom sheet when the outside is clicked
   * @default true
   */
  closeOnInteractOutside?: boolean | undefined
  /**
   * Whether to close the bottom sheet when the escape key is pressed
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * The snap points of the bottom sheet.
   */
  snapPoints?: SnapPoint[]
}

type PropsWithDefault = "closeOnInteractOutside" | "closeOnEscape" | "snapPoints"

export interface BottomSheetSchema {
  props: RequiredBy<BottomSheetProps, PropsWithDefault>
  state: "open" | "closed" | "panning"
  tag: "open" | "closed"
  context: {
    pointerStartPoint: Point | null
    dragOffset: number | null
  }
  computed: {
    resolvedSnapPoints: number[] | null
  }
  // computed: Readonly<{
  //   snapPoint: SnapPoint
  //   snapPointOffsets: number[]
  //   snapPointOffset: number | null
  //   lastSnapPointOffset: number | null
  // }>
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type BottomSheetService = Service<BottomSheetSchema>

export type BottomSheetMachine = Machine<BottomSheetSchema>

export interface BottomSheetApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the bottom sheet is open
   */
  open: boolean
  /**
   * Function to open or close the menu
   */
  setOpen: (open: boolean) => void

  getContentProps: () => T["element"]
  getTriggerProps: () => T["element"]
  getBackdropProps: () => T["element"]
  getGrabberProps: () => T["element"]
  getGrabberIndicatorProps: () => T["element"]
  getCloseTriggerProps: () => T["element"]
}
