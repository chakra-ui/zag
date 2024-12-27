import type { ContextRef, Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, OrientationProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface PageChangeDetails {
  page: number
  pageSnapPoint: number
}

export interface DragStatusDetails {
  type: "dragging.start" | "dragging" | "dragging.end"
  page: number
  isDragging: boolean
}

export interface AutoplayStatusDetails {
  type: "autoplay.start" | "autoplay" | "autoplay.stop"
  page: number
  isPlaying: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  nextTrigger: string
  prevTrigger: string
  indicator: (index: number) => string
  item: (index: number, count: number) => string
  autoplayStart: string
  autoplayStop: string
}

export type ElementIds = Partial<{
  root: string
  item(index: number): string
  itemGroup: string
  nextTrigger: string
  prevTrigger: string
  indicatorGroup: string
  indicator(index: number): string
}>

interface PublicContext extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the carousel. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The localized messages to use.
   */
  translations: IntlTranslations
  /**
   * The number of slides to show at a time.
   * @default 1
   */
  slidesPerPage: number
  /**
   * The number of slides to scroll at a time.
   *
   * When set to `auto`, the number of slides to scroll is determined by the
   * `slidesPerPage` property.
   *
   * @default "auto"
   */
  slidesPerMove: number | "auto"
  /**
   * Whether to scroll automatically. The default delay is 4000ms.
   * @default false
   */
  autoplay?: boolean | { delay: number } | undefined
  /**
   * Whether to allow scrolling via dragging with mouse
   * @default false
   */
  allowMouseDrag: boolean
  /**
   * Whether the carousel should loop around.
   * @default false
   */
  loop: boolean
  /**
   * The index of the active page.
   */
  page: number
  /**
   * The amount of space between items.
   * @default "0px"
   */
  spacing: string
  /**
   * Defines the extra space added around the scrollable area,
   * enabling nearby items to remain partially in view.
   */
  padding?: string
  /**
   * Function called when the page changes.
   */
  onPageChange?: ((details: PageChangeDetails) => void) | undefined
  /**
   * The threshold for determining if an item is in view.
   * @default 0.6
   */
  inViewThreshold: number | number[]
  /**
   * The snap type of the item.
   * @default "mandatory"
   */
  snapType: "proximity" | "mandatory"
  /**
   * The total number of slides.
   * Useful for SSR to render the initial ating the snap points.
   */
  slideCount?: number | undefined
  /**
   * Function called when the drag status changes.
   */
  onDragStatusChange?: ((details: DragStatusDetails) => void) | undefined
  /**
   * Function called when the autoplay status changes.
   */
  onAutoplayStatusChange?: ((details: AutoplayStatusDetails) => void) | undefined
}

interface PrivateContext {
  pageSnapPoints: number[]
  slidesInView: number[]
  timeoutRef: ContextRef<ReturnType<typeof setTimeout>>
}

type ComputedContext = Readonly<{
  isRtl: boolean
  isHorizontal: boolean
  canScrollNext: boolean
  canScrollPrev: boolean
  autoplayInterval: number
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "dragging" | "autoplay"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The index of the item.
   */
  index: number
  /**
   * The snap alignment of the item.
   * @default "start"
   */
  snapAlign?: "start" | "end" | "center" | undefined
}

export interface IndicatorProps {
  /**
   * The index of the indicator.
   */
  index: number
  /**
   * Whether the indicator is read only.
   * @default false
   */
  readOnly?: boolean | undefined
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current index of the carousel
   */
  page: number
  /**
   * The current snap points of the carousel
   */
  pageSnapPoints: number[]
  /**
   * Whether the carousel is auto playing
   */
  isPlaying: boolean
  /**
   * Whether the carousel is being dragged. This only works when `draggable` is true.
   */
  isDragging: boolean
  /**
   * Whether the carousel is can scroll to the next view
   */
  canScrollNext: boolean
  /**
   * Whether the carousel is can scroll to the previous view
   */
  canScrollPrev: boolean
  /**
   * Function to scroll to a specific item index
   */
  scrollToIndex(index: number, instant?: boolean): void
  /**
   * Function to scroll to a specific page
   */
  scrollTo(page: number, instant?: boolean): void
  /**
   * Function to scroll to the next page
   */
  scrollNext(instant?: boolean): void
  /**
   * Function to scroll to the previous page
   */
  scrollPrev(instant?: boolean): void
  /**
   * Returns the current scroll progress as a percentage
   */
  getProgress(): number
  /**
   * Function to start/resume autoplay
   */
  play(): void
  /**
   * Function to pause autoplay
   */
  pause(): void
  /**
   * Whether the item is in view
   */
  isInView(index: number): boolean
  /**
   * Function to re-compute the snap points
   * and clamp the page
   */
  refresh(): void

  getRootProps(): T["element"]
  getControlProps(): T["element"]
  getItemGroupProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getPrevTriggerProps(): T["button"]
  getNextTriggerProps(): T["button"]
  getAutoplayTriggerProps(): T["button"]
  getIndicatorGroupProps(): T["element"]
  getIndicatorProps(props: IndicatorProps): T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation } from "@zag-js/types"
