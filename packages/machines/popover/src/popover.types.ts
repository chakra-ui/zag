import type { EventObject, Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers, LayerSnapshot, PersistentElementOptions } from "@zag-js/dismissable"
import type { AnimationFrame } from "@zag-js/dom-query"
import type { ViewportSize } from "./popover.style"
import type { Placement, PlacementSide, PositioningOptions } from "@zag-js/popper"
import type {
  CommonProperties,
  DirectionProperty,
  MaybeElement,
  PopupActivationDirection,
  PropTypes,
} from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

/**
 * Why the next animation should be skipped:
 * - `click`: opened or closed from the keyboard on the trigger
 * - `dismiss`: closed with Escape
 * - `focus`: closed because focus left
 * - `trigger-change`: moved between triggers, so repositioning snaps
 */
export type InstantType = "click" | "dismiss" | "focus" | "trigger-change" | null

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

export interface IntlTranslations {
  closeTriggerLabel?: string | undefined
}

export interface ElementIds {
  anchor?: string | undefined
  trigger?: (string | ((value?: string) => string)) | undefined
  content?: string | undefined
  title?: string | undefined
  description?: string | undefined
  closeTrigger?: string | undefined
  positioner?: string | undefined
  arrow?: string | undefined
}

export interface PopoverProps
  extends CommonProperties, DirectionProperty, DismissableElementHandlers, PersistentElementOptions {
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
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
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   *
   * @default true
   */
  autoFocus?: boolean | undefined
  /**
   * The element to focus on when the popover is opened.
   * Return `false` to skip moving focus, or `null` to use the default.
   */
  initialFocusEl?: (() => HTMLElement | null | false) | null | undefined
  /**
   * Element to receive focus when the popover is closed.
   */
  finalFocusEl?: (() => MaybeElement) | undefined
  /**
   * Whether to restore focus to the element that had focus before the popover was opened.
   *
   * @default true
   */
  restoreFocus?: boolean | undefined
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

type PropsWithDefault =
  | "closeOnInteractOutside"
  | "closeOnEscape"
  | "modal"
  | "autoFocus"
  | "restoreFocus"
  | "positioning"

interface PrivateContext {
  /**
   * The computed layer stack state used for declarative styles and attributes.
   */
  layer: LayerSnapshot | null
  /**
   * The elements that are rendered on mount
   */
  renderedElements: {
    title: boolean
    description: boolean
    viewport: boolean
  }
  /**
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement | undefined
  /**
   * The trigger value
   */
  triggerValue: string | null
  /**
   * Where the current trigger sits relative to the previous one, after switching triggers while open
   */
  activationDirection: PopupActivationDirection | null
  /** The trigger value before the last switch, kept until the switch ends */
  previousTriggerValue: string | null
  /**
   * Why the next animation should be skipped
   */
  instant: InstantType
  /**
   * Whether the content is animating between triggers
   */
  transitioning: boolean
  /**
   * The size of the current content, when the viewport is rendered
   */
  viewportSize: ViewportSize | null
}

export interface PopoverSchema {
  props: PopoverProps
  defaultPropKey: PropsWithDefault
  state: "open" | "closed"
  context: PrivateContext
  computed: {}
  refs: {
    renderedFrame: AnimationFrame
    initialFocusFrame: AnimationFrame
    cancelTriggerSwitch: VoidFunction | null
    awaitingViewportSize: boolean
  }
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
  value?: string | undefined
}

export interface TriggerState {
  /**
   * The value that identifies this specific trigger
   */
  value: string | undefined
  /**
   * Whether this trigger is the one that opened the popover
   */
  current: boolean
  /**
   * Whether the popover is open
   */
  open: boolean
}

export interface PositionerState {
  /**
   * Whether the popover is nested within another layered element
   */
  nested: boolean
  /**
   * Whether the popover is moving from one trigger to another
   */
  transitioning: boolean
  /**
   * Why the next animation should be skipped
   */
  instant: InstantType
  /**
   * Whether the popover has nested layered elements within it
   */
  hasNested: boolean
}

export interface ContentProps {
  /**
   * The trigger value this content belongs to. Use one content per trigger inside the viewport.
   */
  value?: string | undefined
}

export interface ContentState {
  /**
   * Why the next animation should be skipped
   */
  instant: InstantType
  /**
   * Whether the content is shown. For a content with a `value`, whether its trigger is the current one.
   */
  open: boolean
  /**
   * Whether the popover is modal
   */
  modal: boolean
  /**
   * Whether the popover is nested within another layered element
   */
  nested: boolean
  /**
   * Whether the popover has nested layered elements within it
   */
  hasNested: boolean
  /**
   * The current placement of the content relative to the trigger
   */
  placement: Placement | undefined
  /**
   * The side of the trigger the content is placed on
   */
  side: PlacementSide | undefined
  /**
   * Where the current trigger sits relative to the previous one, e.g. `"right"` or `"left down"`.
   * `null` until the popover switches triggers while open.
   */
  activationDirection: PopupActivationDirection | null
}

export interface ViewportState {
  /**
   * Whether the popover is open
   */
  open: boolean
  /**
   * Why the next animation should be skipped
   */
  instant: InstantType
  /**
   * The side of the trigger the viewport is placed on
   */
  side: PlacementSide | undefined
  /**
   * Where the current trigger sits relative to the previous one, e.g. `"right"` or `"left down"`.
   * `null` until the popover switches triggers while open.
   */
  activationDirection: PopupActivationDirection | null
  /**
   * Whether the popover is moving between triggers
   */
  transitioning: boolean
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface PopoverApi<T extends PropTypes = PropTypes> {
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
   * Where the current trigger sits relative to the previous one, after switching triggers while open
   */
  activationDirection: PopupActivationDirection | null
  /**
   * Returns the trigger values whose content to render: the current one, plus the previous one while
   * it animates out after a switch. Oldest first.
   */
  getContentValues: () => string[]
  /**
   * Function to reposition the popover
   */
  reposition: (options?: Partial<PositioningOptions>) => void

  getArrowProps: () => T["element"]
  getArrowTipProps: () => T["element"]
  getAnchorProps: () => T["element"]
  /**
   * Returns the state of a specific trigger, including whether it's the currently active one
   */
  getTriggerState: (props?: TriggerProps) => TriggerState
  getTriggerProps: (props?: TriggerProps) => T["button"]
  getIndicatorProps: () => T["element"]
  /**
   * Returns the state of the positioner
   */
  getPositionerState: () => PositionerState
  getPositionerProps: () => T["element"]
  /**
   * Returns the state of the content
   */
  getContentState: (props?: ContentProps) => ContentState
  getContentProps: (props?: ContentProps) => T["element"]
  /**
   * Returns the state of the viewport
   */
  getViewportState: () => ViewportState
  getViewportProps: () => T["element"]
  /**
   * Pass the content's `value` when there's one content per trigger
   */
  getTitleProps: (props?: ContentProps) => T["element"]
  /**
   * Pass the content's `value` when there's one content per trigger
   */
  getDescriptionProps: (props?: ContentProps) => T["element"]
  getCloseTriggerProps: () => T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
