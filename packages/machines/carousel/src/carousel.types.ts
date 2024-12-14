import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, OrientationProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ViewChangeDetails {
  index: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  nextTrigger: string
  prevTrigger: string
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
  slidesPerView: number
  /**
   * Whether to scroll automatically. The default delay is 4000ms.
   * @default false
   */
  autoplay?: boolean | { delay: number }
  /**
   * Whether to scroll via dragging
   * @default false
   */
  draggable: boolean
  /**
   * Whether the carousel should loop around.
   * @default false
   */
  loop: boolean
  /**
   * The current view index.
   */
  index: number
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
   * whether between advancing by a full view or individual items.
   * @default 'view'
   */
  scrollBy: "view" | "item"
  /**
   * Function called when the view changes.
   */
  onIndexChange?: ((details: ViewChangeDetails) => void) | undefined
  /**
   * The threshold for determining if an item is in view.
   * @default 0.6
   */
  inViewThreshold: number
}

interface PrivateContext {
  views: number[][]
  intersections: Set<Element>
  _scrollEndTimeout?: NodeJS.Timeout
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
}

export interface ItemState {
  /**
   * The text value of the item. Used for accessibility.
   */
  valueText: string
  /**
   * Whether the item is the current item in the carousel
   * (Only when `slidesPerView` is 1)
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
  readOnly?: boolean | undefined
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current index of the carousel
   */
  index: number
  /**
   * Whether the carousel is auto playing
   */
  autoPlaying: boolean
  /**
   * Whether the carousel is can scroll to the next view
   */
  canScrollNext: boolean
  /**
   * Whether the carousel is can scroll to the previous view
   */
  canScrollPrev: boolean
  /**
   * The views in the carousel
   */
  views: { index: number }[]
  /**
   * Function to scroll to a specific view index
   */
  scrollTo(index: number): void
  /**
   * Function to scroll to the next view
   */
  scrollToNext(): void
  /**
   * Function to scroll to the previous view
   */
  scrollToPrevious(): void
  /**
   *  Returns the state of a specific view
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
  getControlProps(): T["element"]
  getItemGroupProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getPrevTriggerProps(): T["button"]
  getNextTriggerProps(): T["button"]
  getIndicatorGroupProps(): T["element"]
  getIndicatorProps(props: IndicatorProps): T["button"]
}
