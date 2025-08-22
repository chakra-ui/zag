import type { EventObject, Machine, Service } from "@zag-js/core"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  trigger: string
  content: string
  arrow: string
  positioner: string
}>

export interface TooltipProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the tooltip. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The open delay of the tooltip.
   * @default 1000
   */
  openDelay?: number | undefined
  /**
   * The close delay of the tooltip.
   * @default 500
   */
  closeDelay?: number | undefined
  /**
   * Whether to close the tooltip on pointerdown.
   * @default true
   */
  closeOnPointerDown?: boolean | undefined
  /**
   * Whether to close the tooltip when the Escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * Whether the tooltip should close on scroll
   * @default true
   */
  closeOnScroll?: boolean | undefined
  /**
   * Whether the tooltip should close on click
   * @default true
   */
  closeOnClick?: boolean | undefined
  /**
   * Whether the tooltip's content is interactive.
   * In this mode, the tooltip will remain open when user hovers over the content.
   * @see https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus
   *
   * @default false
   */
  interactive?: boolean | undefined
  /**
   * Function called when the tooltip is opened.
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Custom label for the tooltip.
   */
  "aria-label"?: string | undefined
  /**
   * The user provided options used to position the popover content
   */
  positioning?: PositioningOptions | undefined
  /**
   * Whether the tooltip is disabled
   */
  disabled?: boolean | undefined
  /**
   * The controlled open state of the tooltip
   */
  open?: boolean | undefined
  /**
   * The initial open state of the tooltip when rendered.
   * Use when you don't need to control the open state of the tooltip.
   */
  defaultOpen?: boolean | undefined
}

type PropsWithDefault =
  | "openDelay"
  | "closeDelay"
  | "closeOnPointerDown"
  | "closeOnEscape"
  | "closeOnScroll"
  | "closeOnClick"
  | "interactive"
  | "id"
  | "positioning"

export interface TooltipSchema {
  state: "open" | "closed" | "opening" | "closing"
  props: RequiredBy<TooltipProps, PropsWithDefault>
  context: {
    currentPlacement: Placement | undefined
    hasPointerMoveOpened: boolean
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type TooltipService = Service<TooltipSchema>

export type TooltipMachine = Machine<TooltipSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface TooltipApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the tooltip is open.
   */
  open: boolean
  /**
   * Function to open the tooltip.
   */
  setOpen: (open: boolean) => void
  /**
   * Function to reposition the popover
   */
  reposition: (options?: Partial<PositioningOptions>) => void

  getTriggerProps: () => T["button"]
  getArrowProps: () => T["element"]
  getArrowTipProps: () => T["element"]
  getPositionerProps: () => T["element"]
  getContentProps: () => T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
