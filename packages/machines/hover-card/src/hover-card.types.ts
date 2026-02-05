import type { EventObject, Machine, Service } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
  /**
   * The value of the trigger that activated the hover card
   */
  triggerValue: string | null
}

export interface TriggerValueChangeDetails {
  /**
   * The value of the trigger
   */
  value: string | null
  /**
   * The trigger element
   */
  triggerElement: HTMLElement | null
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  trigger: string | ((value?: string) => string)
  content: string
  positioner: string
  arrow: string
}>

export interface HoverCardProps extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
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
   * @default 600
   */
  openDelay?: number | undefined
  /**
   * The duration from when the mouse leaves the trigger or content until the hover card closes.
   * @default 300
   */
  closeDelay?: number | undefined
  /**
   * Whether the hover card is disabled
   */
  disabled?: boolean | undefined
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
  /**
   * The controlled trigger value
   */
  triggerValue?: string | null | undefined
  /**
   * The initial trigger value when rendered.
   * Use when you don't need to control the trigger value.
   */
  defaultTriggerValue?: string | null | undefined
  /**
   * Function called when the trigger value changes.
   */
  onTriggerValueChange?: ((details: TriggerValueChangeDetails) => void) | undefined
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
  /**
   * The trigger value
   */
  triggerValue: string | null
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
 * Component props
 * -----------------------------------------------------------------------------*/

export interface TriggerProps {
  /**
   * The value that identifies this specific trigger
   */
  value?: string
}

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
  setOpen: (open: boolean) => void
  /**
   * The trigger value
   */
  triggerValue: string | null
  /**
   * Function to set the trigger value
   */
  setTriggerValue: (value: string | null) => void
  /**
   * Function to reposition the popover
   */
  reposition: (options?: Partial<PositioningOptions>) => void

  getArrowProps: () => T["element"]
  getArrowTipProps: () => T["element"]
  getTriggerProps: (props?: TriggerProps) => T["element"]
  getPositionerProps: () => T["element"]
  getContentProps: () => T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
