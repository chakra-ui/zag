import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, OrientationProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface SnapChangeDetails {
  snapIndex: number
  snapTarget: HTMLElement
  snapPoint: number
}

export interface DragStatusDetails {
  type: "dragging.start" | "dragging" | "dragging.end"
  dragging: boolean
  snapIndex: number
}

export interface AutoplayStatusDetails {
  type: "autoplay.start" | "autoplay" | "autoplay.stop"
  playing: boolean
  snapIndex: number
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
   * Whether to scroll automatically. The default delay is 4000ms.
   * @default false
   */
  autoplay?: boolean | { delay: number }
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
   * The index of the active snap point.
   */
  snapIndex: number
  /**
   * The amount of space between slides.
   * @default "0px"
   */
  spacing: string
  /**
   * Defines the extra space added around the scrollable area,
   * enabling nearby items to remain partially in view.
   */
  padding?: string
  /**
   * Specifies the scrolling progression mode,
   * whether between advancing per page or individual items.
   * @default 'page'
   */
  scrollBy: "page" | "item"
  /**
   * Function called when the view changes.
   */
  onSnapChange?: ((details: SnapChangeDetails) => void) | undefined
  /**
   * The threshold for determining if an item is in view.
   * @default 0.6
   */
  inViewThreshold: number
  /**
   * The snap type of the item.
   * @default "mandatory"
   */
  snapType: "proximity" | "mandatory"
  /**
   * The total number of slides.
   * Useful for SSR to render the initial ating the snap points.
   */
  slideCount?: number
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
  snapPoints: number[]
  slidesInView: number[]
  scrollEndTimeout?: ReturnType<typeof setTimeout>
}

type ComputedContext = Readonly<{
  isRtl: boolean
  isHorizontal: boolean
  isVertical: boolean
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
  index: number
  readOnly?: boolean | undefined
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current index of the carousel
   */
  snapIndex: number
  /**
   * The current snap points of the carousel
   */
  snapPoints: number[]
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
   * Function to scroll to a specific snap index
   */
  scrollTo(index: number, instant?: boolean): void
  /**
   * Function to scroll to a specific item index
   */
  scrollToIndex(index: number, instant?: boolean): void
  /**
   * Function to scroll to the next snap index
   */
  scrollNext(instant?: boolean): void
  /**
   * Function to scroll to the previous snap index
   */
  scrollPrev(instant?: boolean): void
  /**
   * Returns the current scroll progress as a percentage
   */
  getScrollProgress(): number
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
   * and clamp the snap index
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
