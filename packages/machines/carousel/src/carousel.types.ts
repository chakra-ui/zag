import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

export type SlideProps = {
  index: number
}

type PublicContext = DirectionProperty &
  CommonProperties & {
    orientation: "horizontal" | "vertical"
    align: "start" | "center" | "end"
    slidesPerView: number
    loop: boolean
    index: number
    spacing: string
    onSlideChange?: (details: { index: number }) => void
  }

type PrivateContext = Context<{
  inViewThreshold: number
  slideRects: DOMRect[]
  containerRect?: DOMRect
  containerSize: number
  scrollSnap: number
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
