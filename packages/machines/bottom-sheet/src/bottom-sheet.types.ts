import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, MaybeElement, PropTypes, RequiredBy } from "@zag-js/types"
import type { DragManager } from "./utils/drag-manager"

export interface OpenChangeDetails {
  open: boolean
}

export interface ResolvedSnapPoint {
  value: number | string
  offset: number
}

export interface SnapPointChangeDetails {
  snapPoint: number | string
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
   * @default true
   */
  restoreFocus?: boolean | undefined
  /**
   * The sheet's role
   * @default "dialog"
   */
  role?: "dialog" | "alertdialog" | undefined
  /**
   * Whether the bottom sheet is open.
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
   * Array of numbers or strings representing the snap points.
   * @default [1]
   */
  snapPoints?: (number | string)[] | undefined
  /**
   * The threshold velocity (in pixels/s) for closing the bottom sheet.
   * @default 700
   */
  swipeVelocityThreshold?: number
  /**
   * The threshold distance for dismissing the bottom sheet.
   * @default 0.25
   */
  closeThreshold?: number
  /**
   * Whether to prevent dragging on scrollable elements.
   * When enabled, the sheet will not start dragging if the user is interacting with a scrollable element.
   * @default true
   */
  preventDragOnScroll?: boolean
  /**
   * The currently active snap point.
   */
  activeSnapPoint?: number | string | undefined
  /**
   * The default active snap point of the bottom sheet.
   * @default 1
   */
  defaultActiveSnapPoint?: number | string | undefined
  /**
   * Callback fired when the active snap point changes.
   */
  onActiveSnapPointChange?: ((details: SnapPointChangeDetails) => void) | undefined
}

type PropsWithDefault =
  | "closeOnInteractOutside"
  | "closeOnEscape"
  | "modal"
  | "trapFocus"
  | "restoreFocus"
  | "preventScroll"
  | "initialFocusEl"
  | "snapPoints"
  | "swipeVelocityThreshold"
  | "closeThreshold"
  | "preventDragOnScroll"
  | "defaultActiveSnapPoint"

export interface BottomSheetSchema {
  props: RequiredBy<BottomSheetProps, PropsWithDefault>
  state: "open" | "closed" | "closing"
  tag: "open" | "closed"
  context: {
    dragOffset: number | null
    activeSnapPoint: number | string
    resolvedActiveSnapPoint: ResolvedSnapPoint | null
    contentHeight: number | null
  }
  refs: {
    dragManager: DragManager
  }
  computed: {
    resolvedSnapPoints: ResolvedSnapPoint[]
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type BottomSheetService = Service<BottomSheetSchema>

export type BottomSheetMachine = Machine<BottomSheetSchema>

export interface ContentProps {
  /**
   * Whether the bottom sheet content is draggable.
   * If false, the bottom sheet can only be dragged by the grabber.
   * @default true
   */
  draggable?: boolean | undefined
}

export interface BottomSheetApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the bottom sheet is open.
   */
  open: boolean
  /**
   * Whether the bottom sheet is currently being dragged.
   */
  dragging: boolean
  /**
   * Function to open or close the menu.
   */
  setOpen: (open: boolean) => void
  /**
   * The snap points of the bottom sheet.
   */
  snapPoints: (number | string)[]
  /**
   * The currently active snap point.
   */
  activeSnapPoint: number | string
  /**
   * Function to set the active snap point.
   */
  setActiveSnapPoint: (snapPoint: number | string) => void
  /**
   * Get the current open percentage of the bottom sheet.
   * @returns A value between 0-1 where:
   * - 0 = fully closed
   * - 1 = fully open at current snap point
   */
  getOpenPercentage: () => number
  /**
   * Get the index of the currently active snap point.
   * @returns The index in the snapPoints array, or -1 if not found
   */
  getActiveSnapIndex: () => number
  /**
   * Get the current height of the bottom sheet content.
   * @returns Height in pixels, or null if not measured yet
   */
  getContentHeight: () => number | null

  getContentProps: (props?: ContentProps) => T["element"]
  getTitleProps: () => T["element"]
  getTriggerProps: () => T["element"]
  getBackdropProps: () => T["element"]
  getGrabberProps: () => T["element"]
  getGrabberIndicatorProps: () => T["element"]
  getCloseTriggerProps: () => T["element"]
}
