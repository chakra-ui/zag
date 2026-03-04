import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface PauseStatusDetails {
  paused: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type Side = "start" | "end" | "top" | "bottom"

export type ElementIds = Partial<{
  root: string
  viewport: string
  content: (index: number) => string
}>

export interface IntlTranslations {
  /**
   * The label for the marquee, used for accessibility.
   * Should describe the content being scrolled (e.g., "Partner logos", "Latest news").
   */
  root: string
}

export interface DimensionSnapshot {
  rootSize: number
  contentSize: number
}

export interface MarqueeProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the marquee. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations | undefined
  /**
   * The side/direction the marquee scrolls towards.
   * @default "start"
   */
  side?: Side | undefined
  /**
   * The speed of the marquee animation in pixels per second.
   * @default 50
   */
  speed?: number | undefined
  /**
   * The delay before the animation starts (in seconds).
   * @default 0
   */
  delay?: number | undefined
  /**
   * The number of times to loop the animation (0 = infinite).
   * @default 0
   */
  loopCount?: number | undefined
  /**
   * The spacing between marquee items.
   * @default "1rem"
   */
  spacing?: string | undefined
  /**
   * Whether to automatically duplicate content to fill the container.
   * @default false
   */
  autoFill?: boolean | undefined
  /**
   * Whether to pause the marquee on user interaction (hover, focus).
   * @default false
   */
  pauseOnInteraction?: boolean | undefined
  /**
   * Whether to reverse the animation direction.
   * @default false
   */
  reverse?: boolean | undefined
  /**
   * Whether the marquee is paused.
   */
  paused?: boolean | undefined
  /**
   * Whether the marquee is paused by default.
   * @default false
   */
  defaultPaused?: boolean | undefined
  /**
   * Function called when the pause status changes.
   */
  onPauseChange?: ((details: PauseStatusDetails) => void) | undefined
  /**
   * Function called when the marquee completes one loop iteration.
   */
  onLoopComplete?: (() => void) | undefined
  /**
   * Function called when the marquee completes all loops and stops.
   * Only fires for finite loops (loopCount > 0).
   */
  onComplete?: (() => void) | undefined
}

type PropsWithDefault =
  | "dir"
  | "side"
  | "speed"
  | "delay"
  | "loopCount"
  | "spacing"
  | "autoFill"
  | "pauseOnInteraction"
  | "reverse"
  | "defaultPaused"
  | "translations"

export type UserDefinedContext = RequiredBy<MarqueeProps, PropsWithDefault>

interface PrivateContext {
  /**
   * Whether the marquee is currently paused.
   */
  paused: boolean
  /**
   * The calculated animation duration in seconds (set once on mount).
   */
  duration: number
}

interface ComputedContext {
  /**
   * The orientation based on the side prop.
   */
  orientation: "horizontal" | "vertical"
  /**
   * Whether the marquee is vertical.
   */
  isVertical: boolean
  /**
   * The multiplier for auto-fill (how many times to duplicate content).
   */
  multiplier: number
}

export type MarqueeService = Service<MarqueeSchema>

export type MarqueeMachine = Machine<MarqueeSchema>

export interface MarqueeSchema {
  props: UserDefinedContext
  context: PrivateContext
  computed: ComputedContext
  refs: {
    dimensions: DimensionSnapshot | undefined
    initialDurationSet: boolean
  }
  state: "idle"
  effect: string
  action: string
  guard: string
  event: EventObject
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ContentProps {
  /**
   * The index of the content instance (0 for original, 1+ for duplicates).
   */
  index: number
}

export interface EdgeProps {
  /**
   * The side where the edge gradient should appear.
   */
  side: Side
}

export interface MarqueeApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the marquee is currently paused.
   */
  paused: boolean
  /**
   * The current orientation of the marquee.
   */
  orientation: "horizontal" | "vertical"
  /**
   * The current side/direction of the marquee.
   */
  side: Side
  /**
   * The multiplier for auto-fill. Indicates how many times to duplicate content.
   * When autoFill is enabled and content is smaller than container, this returns
   * the number of additional copies needed. Otherwise returns 1.
   */
  multiplier: number
  /**
   * The total number of content elements to render (original + clones).
   * Use this value when rendering your content in a loop.
   *
   * @example
   * Array.from({ length: api.contentCount }).map((_, index) => (
   *   <div {...api.getContentProps({ index })} />
   * ))
   */
  contentCount: number
  /**
   * Pause the marquee animation.
   */
  pause: VoidFunction
  /**
   * Resume the marquee animation.
   */
  resume: VoidFunction
  /**
   * Toggle the pause state.
   */
  togglePause: VoidFunction
  /**
   * Restart the marquee animation from the beginning.
   */
  restart: VoidFunction

  getRootProps: () => T["element"]
  getViewportProps: () => T["element"]
  getContentProps: (props: ContentProps) => T["element"]
  getEdgeProps: (props: EdgeProps) => T["element"]
  getItemProps: () => T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation } from "@zag-js/types"
