import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

export type SlideProps = {
  index: number
}

type ElementIds = Partial<{
  root: string
  viewport: string
  slide(index: number): string
  slideGroup: string
  nextTrigger: string
  prevTrigger: string
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
    slidesPerView: number
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
    /**
     * The number of slides to scroll at a time.
     */
    slidesToScroll: "auto" | number
  }

type PrivateContext = Context<{
  inViewThreshold: number
  slideRects: DOMRect[]
  containerRect?: DOMRect
  containerSize: number
  scrollSnaps: number[]
}>

type Edge = "top" | "right" | "bottom" | "left"

type ComputedContext = Readonly<{
  isRtl: boolean
  isHorizontal: boolean
  isVertical: boolean
  startEdge: Edge
  endEdge: Edge
  translateValue: string
  canScrollNext: boolean
  canScrollPrevious: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "pointerdown" | "autoplay"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
