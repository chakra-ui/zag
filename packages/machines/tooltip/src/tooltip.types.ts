import type { EventObject, Machine, Service } from "@zag-js/core"
import type { Placement, PlacementSide, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PopupActivationDirection, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

/**
 * What opened or closed the tooltip:
 * - `trigger-hover`: the pointer entered, or left, the trigger or content
 * - `trigger-focus`: the trigger received keyboard focus
 * - `trigger-blur`: the trigger lost focus
 * - `trigger-click`: the trigger was pressed
 * - `escape-key`: Escape was pressed
 * - `scroll`: an ancestor of the trigger scrolled
 * - `sibling-open`: another tooltip opened
 * - `interact-outside`: the pointer was locked
 * - `disabled`: the tooltip was disabled while open
 * - `script`: `setOpen` was called
 */
export type OpenChangeReason =
  | "trigger-hover"
  | "trigger-focus"
  | "trigger-blur"
  | "trigger-click"
  | "escape-key"
  | "scroll"
  | "sibling-open"
  | "interact-outside"
  | "disabled"
  | "script"

export interface OpenChangeDetails {
  open: boolean
  /**
   * What opened or closed the tooltip
   */
  reason?: OpenChangeReason | undefined
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

export interface ElementIds {
  trigger?: (string | ((value?: string) => string)) | undefined
  content?: string | undefined
  arrow?: string | undefined
  positioner?: string | undefined
}

export interface TooltipProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the tooltip. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The open delay of the tooltip.
   * @default 400
   */
  openDelay?: number | undefined
  /**
   * The close delay of the tooltip.
   * @default 150
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
  props: TooltipProps
  defaultPropKey: PropsWithDefault
  context: {
    currentPlacement: Placement | undefined
    hasPointerMoveOpened: string | null
    isPointer: boolean
    triggerValue: string | null
    /**
     * Where the current trigger sits relative to the previous one, after switching triggers while open
     */
    activationDirection: PopupActivationDirection | null
    /** The trigger value before the last switch, kept until the switch ends */
    previousTriggerValue: string | null
    /**
     * Whether the tooltip is moving between triggers
     */
    transitioning: boolean
    /**
     * Whether a viewport is rendered, with one content per trigger
     */
    viewportRendered: boolean
    /**
     * The size of the current content, when the viewport is rendered
     */
    viewportSize: ViewportSize | null
  }
  refs: {
    cancelTriggerSwitch: VoidFunction | null
    awaitingViewportSize: boolean
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type TooltipService = Service<TooltipSchema>

export type TooltipMachine = Machine<TooltipSchema>

/* -----------------------------------------------------------------------------
 * Component props
 * -----------------------------------------------------------------------------*/

export interface TriggerProps {
  /**
   * The value that identifies this specific trigger
   */
  value?: string
}

export interface TriggerState {
  /**
   * The value that identifies this specific trigger
   */
  value: string | undefined
  /**
   * Whether this trigger is the one that opened the tooltip
   */
  current: boolean
  /**
   * Whether the tooltip is open
   */
  open: boolean
}

export interface ViewportSize {
  width: number
  height: number
}

export interface ContentProps {
  /**
   * The trigger value this content belongs to. Use one content per trigger inside the viewport.
   */
  value?: string | undefined
}

export interface ContentState {
  /**
   * Whether the content is shown. For a content with a `value`, whether its trigger is the current one.
   */
  open: boolean
  /**
   * Whether the tooltip should skip its enter animation, following a rapid switch between triggers
   */
  instant: boolean
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
   * `null` until the tooltip switches triggers while open.
   */
  activationDirection: PopupActivationDirection | null
}

export interface ViewportState {
  /**
   * Whether the tooltip is open
   */
  open: boolean
  /**
   * Whether the tooltip should skip its enter animation, following a rapid switch between tooltips
   */
  instant: boolean
  /**
   * The side of the trigger the viewport is placed on
   */
  side: PlacementSide | undefined
  /**
   * Where the current trigger sits relative to the previous one, e.g. `"right"` or `"left down"`.
   * `null` until the tooltip switches triggers while open.
   */
  activationDirection: PopupActivationDirection | null
  /**
   * Whether the tooltip is moving between triggers
   */
  transitioning: boolean
}

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
  setOpen: (open: boolean, reason?: OpenChangeReason) => void
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

  /**
   * Returns the state of a specific trigger, including whether it's the currently active one
   */
  getTriggerState: (props?: TriggerProps) => TriggerState
  getTriggerProps: (props?: TriggerProps) => T["button"]
  getArrowProps: () => T["element"]
  getArrowTipProps: () => T["element"]
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
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
