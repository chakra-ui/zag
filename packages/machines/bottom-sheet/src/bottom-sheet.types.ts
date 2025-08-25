import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, MaybeElement, Point, PropTypes, RequiredBy } from "@zag-js/types"

export type SnapPoint = number | `${number}%`

export interface OpenChangeDetails {
  open: boolean
}

export type ElementIds = Partial<{
  backdrop: string
  content: string
  trigger: string
  grabber: string
  grabberIndicator: string
  closeTrigger: string
}>

export interface BottomSheetProps extends DirectionProperty, CommonProperties, DismissableElementHandlers {
  /**
   * The ids of the elements in the bottom sheet. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether to trap focus inside the sheet when it's opened.
   * @default true
   */
  trapFocus?: boolean | undefined
  /**
   * Whether to prevent scrolling behind the sheet when it's opened
   * @default true
   */
  preventScroll?: boolean | undefined
  /**
   * Whether to prevent pointer interaction outside the element and hide all content below it.
   * @default true
   */
  modal?: boolean | undefined
  /**
   * Element to receive focus when the sheet is opened.
   */
  initialFocusEl?: (() => MaybeElement) | undefined
  /**
   * Element to receive focus when the sheet is closed.
   */
  finalFocusEl?: (() => MaybeElement) | undefined
  /**
   * Whether to restore focus to the element that had focus before the sheet was opened.
   */
  restoreFocus?: boolean | undefined
  /**
   * The sheet's role
   * @default "dialog"
   */
  role?: "dialog" | "alertdialog" | undefined
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
   * Whether to close the bottom sheet when the outside is clicked.
   * @default true
   */
  closeOnInteractOutside?: boolean | undefined
  /**
   * Whether to close the bottom sheet when the escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * The snap points of the bottom sheet.
   * @default ['100%']
   */
  snapPoints?: SnapPoint[]
  /**
   * The threshold velocity (in pixels/ms) for closing the bottom sheet.
   * @default 0.5
   */
  closeThreshold?: number
  /**
   * Whether the bottom sheet should only be draggable by the grabber.
   * @default false
   */
  grabberOnly?: boolean
  /**
   * Whether to handle scrollable elements within the bottom sheet.
   * When enabled, the sheet will not start dragging if the pointer is over a scrollable element.
   * @default true
   */
  handleScrollableElements?: boolean
}

type PropsWithDefault =
  | "closeOnInteractOutside"
  | "closeOnEscape"
  | "modal"
  | "trapFocus"
  | "grabberOnly"
  | "restoreFocus"
  | "preventScroll"
  | "initialFocusEl"
  | "snapPoints"
  | "closeThreshold"
  | "handleScrollableElements"

export interface BottomSheetSchema {
  props: RequiredBy<BottomSheetProps, PropsWithDefault>
  state: "open" | "closed" | "panning"
  tag: "open" | "closed"
  context: {
    pointerStartPoint: Point | null
    dragOffset: number | null
    snapPointOffset: number | null
    contentHeight: number
    lastPoint: Point | null
    lastTimestamp: number | null
    velocity: number
  }
  computed: {
    resolvedSnapPoints: number[]
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type BottomSheetService = Service<BottomSheetSchema>

export type BottomSheetMachine = Machine<BottomSheetSchema>

export interface BottomSheetApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the bottom sheet is open.
   */
  open: boolean
  /**
   * Function to open or close the menu.
   */
  setOpen: (open: boolean) => void

  getContentProps: () => T["element"]
  getTriggerProps: () => T["element"]
  getBackdropProps: () => T["element"]
  getGrabberProps: () => T["element"]
  getGrabberIndicatorProps: () => T["element"]
  getCloseTriggerProps: () => T["element"]
}
