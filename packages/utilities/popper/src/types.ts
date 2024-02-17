import type { AutoUpdateOptions, Boundary, ComputePositionReturn, Placement, VirtualElement } from "@floating-ui/dom"

export type MaybeRectElement = HTMLElement | VirtualElement | null

export type MaybeElement = HTMLElement | null

export type MaybeFn<T> = T | (() => T)

export type PlacementSide = "top" | "right" | "bottom" | "left"
export type PlacementAlign = "start" | "center" | "end"

export interface AnchorRect {
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface PositioningOptions {
  /**
   * The strategy to use for positioning
   */
  strategy?: "absolute" | "fixed"
  /**
   * The initial placement of the floating element
   */
  placement?: Placement
  /**
   * The offset of the floating element
   */
  offset?: { mainAxis?: number; crossAxis?: number }
  /**
   * The main axis offset or gap between the reference and floating elements
   */
  gutter?: number
  /**
   * The secondary axis offset or gap between the reference and floating elements
   */
  shift?: number
  /**
   * The virtual padding around the viewport edges to check for overflow
   */
  overflowPadding?: number
  /**
   * The minimum padding between the arrow and the floating element's corner.
   * @default 4
   */
  arrowPadding?: number
  /**
   * Whether to flip the placement
   */
  flip?: boolean | Placement[]
  /**
   * Whether the popover should slide when it overflows.
   */
  slide?: boolean
  /**
   * Whether the floating element can overlap the reference element
   * @default false
   */
  overlap?: boolean
  /**
   * Whether to make the floating element same width as the reference element
   */
  sameWidth?: boolean
  /**
   * Whether the popover should fit the viewport.
   */
  fitViewport?: boolean
  /**
   * The overflow boundary of the reference element
   */
  boundary?: Boundary | (() => Boundary)
  /**
   * Options to activate auto-update listeners
   */
  listeners?: boolean | AutoUpdateOptions
  /**
   * Function called when the placement is computed
   */
  onComplete?(data: ComputePositionReturn): void
  /**
   * Function called when the floating element is positioned or not
   */
  onPositioned?(data: { placed: boolean }): void
  /**
   *  Function that returns the anchor rect
   */
  getAnchorRect?: (element: HTMLElement | VirtualElement | null) => AnchorRect | null
  /**
   * A callback that will be called when the popover needs to calculate its
   * position.
   */
  updatePosition?: (data: { updatePosition: () => Promise<void> }) => void | Promise<void>
}

export type { AutoUpdateOptions, Boundary, ComputePositionReturn, Placement }
