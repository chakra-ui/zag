import type { EventObject, Machine, Service } from "@zag-js/core"
import type { RequiredBy } from "@zag-js/types"
import type { CommonProperties, DirectionProperty, OrientationProperty, PropTypes } from "@zag-js/types"

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
  item: (index: number) => string
  itemGroup: string
  nextTrigger: string
  prevTrigger: string
  indicatorGroup: string
  indicator: (index: number) => string
}>

export interface CarouselProps extends DirectionProperty, CommonProperties, OrientationProperty {
  /**
   * The ids of the elements in the carousel. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations | undefined
  /**
   * The number of slides to show at a time.
   * @default 1
   */
  slidesPerPage?: number | undefined
  /**
   * The number of slides to scroll at a time.
   *
   * When set to `auto`, the number of slides to scroll is determined by the
   * `slidesPerPage` property.
   *
   * @default "auto"
   */
  slidesPerMove?: number | "auto" | undefined
  /**
   * Whether to scroll automatically. The default delay is 4000ms.
   * @default false
   */
  autoplay?: boolean | { delay: number } | undefined
  /**
   * Whether to allow scrolling via dragging with mouse
   * @default false
   */
  allowMouseDrag?: boolean | undefined
  /**
   * Whether the carousel should loop around.
   * @default false
   */
  loop?: boolean | undefined
  /**
   * The controlled page of the carousel.
   */
  page?: number | undefined
  /**
   * The initial page to scroll to when rendered.
   * Use when you don't need to control the page of the carousel.
   * @default 0
   */
  defaultPage?: number | undefined
  /**
   * The amount of space between items.
   * @default "0px"
   */
  spacing?: string | undefined
  /**
   * Defines the extra space added around the scrollable area,
   * enabling nearby items to remain partially in view.
   */
  padding?: string | undefined
  /**
   * Function called when the page changes.
   */
  onPageChange?: ((details: PageChangeDetails) => void) | undefined
  /**
   * The threshold for determining if an item is in view.
   * @default 0.6
   */
  inViewThreshold?: number | number[] | undefined
  /**
   * The snap type of the item.
   * @default "mandatory"
   */
  snapType?: "proximity" | "mandatory" | undefined
  /**
   * The total number of slides.
   * Useful for SSR to render the initial ating the snap points.
   */
  slideCount: number
  /**
   * Function called when the drag status changes.
   */
  onDragStatusChange?: ((details: DragStatusDetails) => void) | undefined
  /**
   * Function called when the autoplay status changes.
   */
  onAutoplayStatusChange?: ((details: AutoplayStatusDetails) => void) | undefined
}

type PropsWithDefault =
  | "dir"
  | "defaultPage"
  | "orientation"
  | "snapType"
  | "loop"
  | "slidesPerPage"
  | "slidesPerMove"
  | "spacing"
  | "autoplay"
  | "allowMouseDrag"
  | "inViewThreshold"
  | "translations"
  | "slideCount"

interface PrivateContext {
  pageSnapPoints: number[]
  slidesInView: number[]
  page: number
}

interface ComputedContext {
  isRtl: boolean
  isHorizontal: boolean
  canScrollNext: boolean
  canScrollPrev: boolean
  autoplayInterval: number
}

export type CarouselService = Service<CarouselSchema>

export type CarouselMachine = Machine<CarouselSchema>

export interface CarouselSchema {
  props: RequiredBy<CarouselProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  refs: {
    timeoutRef: any
  }
  state: "idle" | "dragging" | "autoplay" | "userScroll" | "focus"
  effect: string
  action: string
  guard: string
  event: EventObject
}

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

export interface CarouselApi<T extends PropTypes = PropTypes> {
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
  scrollToIndex: (index: number, instant?: boolean) => void
  /**
   * Function to scroll to a specific page
   */
  scrollTo: (page: number, instant?: boolean) => void
  /**
   * Function to scroll to the next page
   */
  scrollNext: (instant?: boolean) => void
  /**
   * Function to scroll to the previous page
   */
  scrollPrev: (instant?: boolean) => void
  /**
   * Returns the current scroll progress as a percentage
   */
  getProgress: () => number
  /**
   * Function to start/resume autoplay
   */
  play: VoidFunction
  /**
   * Function to pause autoplay
   */
  pause: VoidFunction
  /**
   * Whether the item is in view
   */
  isInView: (index: number) => boolean
  /**
   * Function to re-compute the snap points
   * and clamp the page
   */
  refresh: VoidFunction

  getRootProps: () => T["element"]
  getControlProps: () => T["element"]
  getItemGroupProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getPrevTriggerProps: () => T["button"]
  getNextTriggerProps: () => T["button"]
  getAutoplayTriggerProps: () => T["button"]
  getIndicatorGroupProps: () => T["element"]
  getIndicatorProps: (props: IndicatorProps) => T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation } from "@zag-js/types"
