import type { StateMachine as S } from "@zag-js/core"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy, RootProperties } from "@zag-js/types"

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
   */
  openDelay: number
  /**
   * The close delay of the tooltip.
   */
  closeDelay: number
  /**
   * Whether to close the tooltip on pointerdown.
   */
  closeOnPointerDown: boolean
  /**
   * Whether to close the tooltip when the Escape key is pressed.
   */
  closeOnEsc?: boolean
  /**
   * Whether the tooltip's content is interactive.
   * In this mode, the tooltip will remain open when user hovers over the content.
   * @see https://www.w3.org/TR/WCAG21/#content-on-hover-or-focus
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
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed Whether an `aria-label` is set.
   */
  hasAriaLabel: boolean
}>

type PrivateContext = RootProperties & {
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

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the tooltip is open.
   */
  isOpen: boolean
  /**
   * Function to open the tooltip.
   */
  open(): void
  /**
   * Function to close the tooltip.
   */
  close(): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void

  triggerProps: T["button"]
  arrowProps: T["element"]
  arrowTipProps: T["element"]
  positionerProps: T["element"]
  contentProps: T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
