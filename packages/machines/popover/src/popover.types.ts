import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers, PersistentElementOptions } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
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
  anchor: string
  trigger: string | ((value?: string) => string)
  content: string
  title: string
  description: string
  closeTrigger: string
  positioner: string
  arrow: string
}>

export interface PopoverProps
  extends CommonProperties, DirectionProperty, DismissableElementHandlers, PersistentElementOptions {
  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the popover should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only popover content will be visible to screen readers
   * - scrolling is blocked
   * - focus is trapped within the popover
   *
   * @default false
   */
  modal?: boolean | undefined
  /**
   * Whether the popover is portalled. This will proxy the tabbing behavior regardless of the DOM position
   * of the popover content.
   *
   * @default true
   */
  portalled?: boolean | undefined
  /**
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   *
   * @default true
   */
  autoFocus?: boolean | undefined
  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusEl?: (() => HTMLElement | null) | undefined
  /**
   * Whether to close the popover when the user clicks outside of the popover.
   * @default true
   */
  closeOnInteractOutside?: boolean | undefined
  /**
   * Whether to close the popover when the escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * Function invoked when the popover opens or closes
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The user provided options used to position the popover content
   */
  positioning?: PositioningOptions | undefined
  /**
   * The controlled open state of the popover
   */
  open?: boolean | undefined
  /**
   * The initial open state of the popover when rendered.
   * Use when you don't need to control the open state of the popover.
   */
  defaultOpen?: boolean | undefined
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

type PropsWithDefault = "closeOnInteractOutside" | "closeOnEscape" | "modal" | "portalled" | "autoFocus" | "positioning"

type ComputedContext = Readonly<{
  /**
   * The computed value of `portalled`
   */
  currentPortalled: boolean
}>

interface PrivateContext {
  /**
   * The elements that are rendered on mount
   */
  renderedElements: {
    title: boolean
    description: boolean
  }
  /**
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement | undefined
  /**
   * The trigger value
   */
  triggerValue: string | null
}

export interface PopoverSchema {
  props: RequiredBy<PopoverProps, PropsWithDefault>
  state: "open" | "closed"
  context: PrivateContext
  computed: ComputedContext
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type PopoverService = Service<PopoverSchema>

export type PopoverMachine = Machine<PopoverSchema>

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

export interface PopoverApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the popover is portalled.
   */
  portalled: boolean
  /**
   * Whether the popover is open
   */
  open: boolean
  /**
   * Function to open or close the popover
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
  getAnchorProps: () => T["element"]
  getTriggerProps: (props?: TriggerProps) => T["button"]
  getIndicatorProps: () => T["element"]
  getPositionerProps: () => T["element"]
  getContentProps: () => T["element"]
  getTitleProps: () => T["element"]
  getDescriptionProps: () => T["element"]
  getCloseTriggerProps: () => T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
