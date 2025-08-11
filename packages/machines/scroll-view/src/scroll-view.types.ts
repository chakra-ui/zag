import type { EventObject, Service, Machine } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Orientation, RequiredBy, Size } from "@zag-js/types"
import type { Timeout } from "./utils/timeout"

export type ScrollRecord<T> = Record<"top" | "right" | "bottom" | "left", T>

export interface ScrollViewProps extends DirectionProperty, CommonProperties {
  /**
   * Called when scrolling starts
   */
  onScrollStart?: (e: Event) => void
  /**
   * Called when scrolling ends
   */
  onScrollEnd?: (e: Event) => void
  /**
   * Called during scrolling
   */
  onScroll?: (e: Event) => void
  /**
   * Called when scrolling state changes
   */
  onScrollChange?: (scrolling: boolean) => void
  /**
   * Called when any side of the scroll area is reached
   */
  onSideReached?: (sides: ScrollRecord<boolean>) => void
  /**
   * Offset values for detecting when sides are reached
   */
  offset?: ScrollRecord<number>
  /**
   * The delay in milliseconds before hiding the scrollbar
   * @default 600
   */
  scrollHideDelay?: number
}

type PropsWithDefault = "scrollHideDelay"

export interface ScrollbarProps {
  orientation?: Orientation
}

export interface ScrollbarHiddenState {
  scrollbarYHidden: boolean
  scrollbarXHidden: boolean
  cornerHidden: boolean
}

export interface ScrollViewContext {
  cornerSize: Size
  thumbSize: Size
  scrollingX: boolean
  scrollingY: boolean
  hiddenState: ScrollbarHiddenState
  hovering: boolean
  touchModality: boolean
}

export interface ScrollViewRefs {
  orientation: Orientation | null
  scrollPosition: { x: number; y: number }

  scrollYTimeout: Timeout
  scrollXTimeout: Timeout
  scrollEndTimeout: Timeout

  startX: number
  startY: number

  startScrollTop: number
  startScrollLeft: number

  programmaticScroll: boolean
}

export interface ScrollViewSchema {
  state: "idle" | "dragging"
  props: RequiredBy<ScrollViewProps, PropsWithDefault>
  context: ScrollViewContext
  event: EventObject
  action: string
  guard: string
  effect: string
  refs: ScrollViewRefs
}

export type ScrollViewService = Service<ScrollViewSchema>

export type ScrollViewMachine = Machine<ScrollViewSchema>
