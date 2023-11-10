import type { StateMachine as S } from "@zag-js/core"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

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
  positioner: string
  arrow: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Function called when the hover card opens or closes.
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * The duration from when the mouse enters the trigger until the hover card opens.
   */
  openDelay: number
  /**
   * The duration from when the mouse leaves the trigger or content until the hover card closes.
   */
  closeDelay: number
  /**
   * Whether the hover card is open
   */
  open?: boolean
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
}

type PrivateContext = Context<{
  /**
   * @internal
   * The computed placement of the tooltip.
   */
  currentPlacement?: Placement
  /**
   * @internal
   * Whether the hover card is open by pointer
   */
  isPointer?: boolean
}>

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

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
   * Whether the hover card is open
   */
  isOpen: boolean
  /**
   * Function to open the hover card
   */
  open(): void
  /**
   * Function to close the hover card
   */
  close(): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void
  arrowProps: T["element"]
  arrowTipProps: T["element"]
  triggerProps: T["element"]
  positionerProps: T["element"]
  contentProps: T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
