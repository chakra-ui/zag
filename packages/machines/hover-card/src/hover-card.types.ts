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
  positioner: string
  arrow: string
}>

export interface HoverCardProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Function called when the hover card opens or closes.
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The duration from when the mouse enters the trigger until the hover card opens.
   * @default 700
   */
  openDelay?: number | undefined
  /**
   * The duration from when the mouse leaves the trigger or content until the hover card closes.
   * @default 300
   */
  closeDelay?: number | undefined
  /**
   * The controlled open state of the hover card
   */
  open?: boolean | undefined
  /**
   * The initial open state of the hover card when rendered.
   * Use when you don't need to control the open state of the hover card.
   */
  defaultOpen?: boolean | undefined
  /**
   * The user provided options used to position the popover content
   */
  positioning?: PositioningOptions | undefined
}

type PropsWithDefault = "openDelay" | "closeDelay" | "positioning"

interface PrivateContext {
  /**
   * The computed placement of the tooltip.
   */
  currentPlacement: Placement | undefined
  /**
   * Whether the hover card is open by pointer
   */
  isPointer: boolean
  /**
   * Whether the hover card is open
   */
  open: boolean
}

export interface HoverCardSchema {
  props: RequiredBy<HoverCardProps, PropsWithDefault>
  context: PrivateContext
  state: "opening" | "open" | "closing" | "closed"
  tag: "open" | "closed"
  action: string
  event: EventObject
  guard: string
  effect: string
}

export type HoverCardService = Service<HoverCardSchema>

export type HoverCardMachine = Machine<HoverCardSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface HoverCardApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the hover card is open
   */
  open: boolean
  /**
   * Function to open the hover card
   */
  setOpen(open: boolean): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void

  getArrowProps(): T["element"]
  getArrowTipProps(): T["element"]
  getTriggerProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
