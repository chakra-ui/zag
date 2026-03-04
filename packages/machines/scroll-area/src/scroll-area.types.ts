import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Orientation, Point, PropTypes, Size } from "@zag-js/types"
import type { Timeout } from "./utils/timeout"

export type ScrollToEdge = "top" | "right" | "bottom" | "left"

export type ScrollRecord<T> = Record<ScrollToEdge, T>

export type ElementIds = Partial<{
  root: string
  viewport: string
  content: string
  scrollbar: string
  thumb: string
}>

export interface ScrollAreaProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the scroll area elements
   */
  ids?: ElementIds
}

export interface ScrollbarProps {
  orientation?: Orientation
}

export interface ThumbProps {
  orientation?: Orientation
}

export interface ScrollbarHiddenState {
  scrollbarYHidden: boolean
  scrollbarXHidden: boolean
  cornerHidden: boolean
}

// zag-ignore-export
export interface ScrollAreaContext {
  cornerSize: Size
  thumbSize: Size
  scrollingX: boolean
  scrollingY: boolean
  hiddenState: ScrollbarHiddenState
  hovering: boolean
  touchModality: boolean
  atSides: ScrollRecord<boolean>
}

// zag-ignore-export
export interface ScrollAreaRefs {
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

export interface ScrollAreaSchema {
  state: "idle" | "dragging"
  props: ScrollAreaProps
  context: ScrollAreaContext
  event: EventObject
  action: string
  guard: string
  effect: string
  refs: ScrollAreaRefs
}

export type ScrollAreaService = Service<ScrollAreaSchema>

export type ScrollAreaMachine = Machine<ScrollAreaSchema>

export interface ScrollbarState {
  hovering: boolean
  scrolling: boolean
  hidden: boolean
}

export type ScrollEasingFunction = (t: number) => number

export interface ScrollbarEasing {
  easing?: ScrollEasingFunction | undefined
  duration?: number | undefined
}

export interface ScrollToDetails extends ScrollbarEasing {
  top?: number | undefined
  left?: number | undefined
  behavior?: ScrollBehavior | undefined
}

export interface ScrollToEdgeDetails extends ScrollbarEasing {
  edge: ScrollToEdge
  behavior?: ScrollBehavior | undefined
}

export interface ScrollAreaApi<T extends PropTypes> {
  /**
   * Whether the scroll area is at the top
   */
  isAtTop: boolean
  /**
   * Whether the scroll area is at the bottom
   */
  isAtBottom: boolean
  /**
   * Whether the scroll area is at the left
   */
  isAtLeft: boolean
  /**
   * Whether the scroll area is at the right
   */
  isAtRight: boolean
  /**
   * Whether the scroll area has horizontal overflow
   */
  hasOverflowX: boolean
  /**
   * Whether the scroll area has vertical overflow
   */
  hasOverflowY: boolean
  /**
   * Get the scroll progress as values between 0 and 1
   */
  getScrollProgress: () => Point
  /**
   * Scroll to the edge of the scroll area
   */
  scrollToEdge: (details: ScrollToEdgeDetails) => void
  /**
   * Scroll to specific coordinates
   */
  scrollTo: (details: ScrollToDetails) => void
  /**
   * Returns the state of the scrollbar
   */
  getScrollbarState: (props: ScrollbarProps) => ScrollbarState

  getRootProps: () => T["element"]
  getViewportProps: () => T["element"]
  getContentProps: () => T["element"]
  getScrollbarProps: (props?: ScrollbarProps) => T["element"]
  getThumbProps: (props?: ThumbProps) => T["element"]
  getCornerProps: () => T["element"]
}
