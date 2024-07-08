import type { Machine, StateMachine as S } from "@zag-js/core"
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

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the tooltip. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The `id` of the tooltip.
   */
  id: string
  /**
   * The open delay of the tooltip.
   * @default 1000
   */
  openDelay: number
  /**
   * The close delay of the tooltip.
   * @default 500
   */
  closeDelay: number
  /**
   * Whether to close the tooltip on pointerdown.
   * @default true
   */
  closeOnPointerDown: boolean
  /**
   * Whether to close the tooltip when the Escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean
  /**
   * Whether the tooltip should close on scroll
   * @default true
   */
  closeOnScroll?: boolean
  /**
   * Whether the tooltip should close on click
   * @default true
   */
  closeOnClick?: boolean
  /**
   * Whether the tooltip's content is interactive.
   * In this mode, the tooltip will remain open when user hovers over the content.
   * @see https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus
   *
   * @default false
   */
  interactive: boolean
  /**
   * Function called when the tooltip is opened.
   */
  onOpenChange?(details: OpenChangeDetails): void
  /**
   * Custom label for the tooltip.
   */
  "aria-label"?: string
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
  /**
   * Whether the tooltip is disabled
   */
  disabled?: boolean
  /**
   * Whether the tooltip is open
   */
  open?: boolean
  /**
   * Whether the tooltip is controlled by the user
   */
  "open.controlled"?: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed Whether an `aria-label` is set.
   */
  hasAriaLabel: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * The computed placement of the tooltip.
   */
  currentPlacement?: Placement
  /**
   * @internal
   * Whether the pointermove already opened the tooltip.
   */
  hasPointerMoveOpened?: boolean
}

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "opening" | "open" | "closing" | "closed"
  tags: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the tooltip is open.
   */
  open: boolean
  /**
   * Function to open the tooltip.
   */
  setOpen(open: boolean): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void

  getTriggerProps(): T["button"]
  getArrowProps(): T["element"]
  getArrowTipProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
