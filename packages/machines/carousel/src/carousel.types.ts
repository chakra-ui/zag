import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type SlideProps = {
  index: number
}

export type SlideIndicatorProps = {
  index: number
  readOnly?: boolean
}

type ElementIds = Partial<{
  root: string
  viewport: string
  slide(index: number): string
  slideGroup: string
  nextSlideTrigger: string
  prevSlideTrigger: string
  indicatorGroup: string
  indicator(index: number): string
}>

type ChangeDetails = { index: number }

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The orientation of the carousel.
     * @default "horizontal"
     */
    orientation: "horizontal" | "vertical"
    /**
     * The alignment of the slides in the carousel.
     */
    align: "start" | "center" | "end"
    /**
     * The number of slides to show at a time.
     */
    slidesPerView: number | "auto"
    /**
     * Whether the carousel should loop around.
     */
    loop: boolean
    /**
     * The current slide index.
     */
    index: number
    /**
     * The amount of space between slides.
     */
    spacing: string
    /**
     * Function called when the slide changes.
     */
    onSlideChange?: (details: ChangeDetails) => void
    /**
     * The ids of the elements in the carousel. Useful for composition.
     */
    ids?: ElementIds
  }

type PrivateContext = Context<{
  slideRects: DOMRect[]
  containerRect?: DOMRect
  containerSize: number
  scrollSnaps: number[]
  scrollProgress: number
}>

type RectEdge = "top" | "right" | "bottom" | "left"

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

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "dragging" | "autoplay"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * The current index of the carousel
   */
  index: number
  /**
   * The current scroll progress of the carousel
   */
  scrollProgress: number
  /**
   * Whether the carousel is currently auto-playing
   */
  isAutoplay: boolean
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
  getSlideState: (props: SlideProps) => {
    valueText: string
    isCurrent: boolean
    isNext: boolean
    isPrevious: boolean
    isInView: boolean
  }
  /**
   * Function to start/resume autoplay
   */
  play(): void
  /**
   * Function to pause autoplay
   */
  pause(): void
  rootProps: T["element"]
  viewportProps: T["element"]
  slideGroupProps: T["element"]
  getSlideProps(props: SlideProps): T["element"]
  prevSlideTriggerProps: T["button"]
  nextSlideTriggerProps: T["button"]
  indicatorGroupProps: T["element"]
  getIndicatorProps(props: SlideIndicatorProps): T["button"]
}
