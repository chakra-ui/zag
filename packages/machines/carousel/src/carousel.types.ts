import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface SlideChangeDetails {
  index: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

type RectEdge = "top" | "right" | "bottom" | "left"

export type ElementIds = Partial<{
  root: string
  viewport: string
  item(index: number): string
  itemGroup: string
  nextTrigger: string
  prevTrigger: string
  indicatorGroup: string
  indicator(index: number): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The orientation of the carousel.
   * @default "horizontal"
   */
  orientation: "horizontal" | "vertical"
  /**
   * The alignment of the slides in the carousel.
   * @default "start"
   */
  align: "start" | "center" | "end"
  /**
   * The number of slides to show at a time.
   * @default 1
   */
  slidesPerView: number | "auto"
  /**
   * Whether the carousel should loop around.
   * @default false
   */
  loop: boolean
  /**
   * The current slide index.
   */
  index: number
  /**
   * The amount of space between slides.
   * @default "0px"
   */
  spacing: string
  /**
   * Function called when the slide changes.
   */
  onIndexChange?: (details: SlideChangeDetails) => void
  /**
   * The ids of the elements in the carousel. Useful for composition.
   */
  ids?: ElementIds
}

interface PrivateContext {
  slideRects: DOMRect[]
  containerRect?: DOMRect
  containerSize: number
  scrollSnaps: number[]
  scrollProgress: number
}

type ComputedContext = Readonly<{
  isRtl: boolean
  isHorizontal: boolean
  isVertical: boolean
  startEdge: RectEdge
  endEdge: RectEdge
  translateValue: string
  canScrollNext: boolean
  canScrollPrev: boolean
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
}

export interface ItemState {
  /**
   * The text value of the item. Used for accessibility.
   */
  valueText: string
  /**
   * Whether the item is the current item in the carousel
   */
  current: boolean
  /**
   * Whether the item is the next item in the carousel
   */
  next: boolean
  /**
   * Whether the item is the previous item in the carousel
   */
  previous: boolean
  /**
   * Whether the item is in view
   */
  inView: boolean
}

export interface IndicatorProps {
  index: number
  readOnly?: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current index of the carousel
   */
  index: number
  /**
   * The current scroll progress of the carousel
   */
  scrollProgress: number
  /**
   * Whether the carousel is auto playing
   */
  autoPlaying: boolean
  /**
   * Whether the carousel is can scroll to the next slide
   */
  canScrollNext: boolean
  /**
   * Whether the carousel is can scroll to the previous slide
   */
  canScrollPrev: boolean
  /**
   * Function to scroll to a specific slide index
   */
  scrollTo(index: number, jump?: boolean): void
  /**
   * Function to scroll to the next slide
   */
  scrollToNext(): void
  /**
   * Function to scroll to the previous slide
   */
  scrollToPrevious(): void
  /**
   *  Returns the state of a specific slide
   */
  getItemState(props: ItemProps): ItemState
  /**
   * Function to start/resume autoplay
   */
  play(): void
  /**
   * Function to pause autoplay
   */
  pause(): void

  getRootProps(): T["element"]
  getViewportProps(): T["element"]
  getItemGroupProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getPrevTriggerProps(): T["button"]
  getNextTriggerProps(): T["button"]
  getIndicatorGroupProps(): T["element"]
  getIndicatorProps(props: IndicatorProps): T["button"]
}
