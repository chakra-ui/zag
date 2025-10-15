import type { AutoUpdateOptions, Boundary, ComputePositionReturn, Placement, VirtualElement } from "@floating-ui/dom"
import type { MaybeElement as BaseMaybeElement } from "@zag-js/types"

export type MaybeRectElement = HTMLElement | VirtualElement | null

export type MaybeElement = BaseMaybeElement

export type PlacementSide = "top" | "right" | "bottom" | "left"
export type PlacementAlign = "start" | "center" | "end"

export interface AnchorRect {
  x?: number | undefined
  y?: number | undefined
  width?: number | undefined
  height?: number | undefined
}

export interface PositioningOptions {
  /**
   * Whether the popover should be hidden when the reference element is detached
   */
  hideWhenDetached?: boolean | undefined
  /**
   * The strategy to use for positioning
   */
  strategy?: "absolute" | "fixed" | undefined
  /**
   * The initial placement of the floating element
   */
  placement?: Placement | undefined
  /**
   * The offset of the floating element
   */
  offset?: { mainAxis?: number | undefined; crossAxis?: number | undefined } | undefined
  /**
   * The main axis offset or gap between the reference and floating elements
   */
  gutter?: number | undefined
  /**
   * The secondary axis offset or gap between the reference and floating elements
   */
  shift?: number | undefined
  /**
   * The virtual padding around the viewport edges to check for overflow
   */
  overflowPadding?: number | undefined
  /**
   * The minimum padding between the arrow and the floating element's corner.
   * @default 4
   */
  arrowPadding?: number | undefined
  /**
   * Whether to flip the placement
   */
  flip?: boolean | Placement[] | undefined
  /**
   * Whether the popover should slide when it overflows.
   */
  slide?: boolean | undefined
  /**
   * Whether the floating element can overlap the reference element
   * @default false
   */
  overlap?: boolean | undefined
  /**
   * Whether to make the floating element same width as the reference element
   */
  sameWidth?: boolean | undefined
  /**
   * Whether the popover should fit the viewport.
   */
  fitViewport?: boolean | undefined
  /**
   * The overflow boundary of the reference element
   * Accepts a function returning a Boundary, a Boundary directly,
   * or the shorthand string 'clipping-ancestors' which maps to Floating UI's 'clippingAncestors'.
   */
  boundary?: (() => Boundary) | Boundary | "clipping-ancestors" | undefined
  /**
   * Options to activate auto-update listeners
   */
  listeners?: boolean | AutoUpdateOptions | undefined
  /**
   * Function called when the placement is computed
   */
  onComplete?: ((data: ComputePositionReturn) => void) | undefined
  /**
   * Function called when the floating element is positioned or not
   */
  onPositioned?: ((data: { placed: boolean }) => void) | undefined
  /**
   *  Function that returns the anchor rect
   */
  getAnchorRect?: ((element: HTMLElement | VirtualElement | null) => AnchorRect | null) | undefined
  /**
   * A callback that will be called when the popover needs to calculate its
   * position.
   */
  updatePosition?:
    | ((data: { updatePosition: () => Promise<void>; floatingElement: HTMLElement | null }) => void | Promise<void>)
    | undefined
}

export type { AutoUpdateOptions, Boundary, ComputePositionReturn, Placement }
