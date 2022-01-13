import type { PlacementOptions } from "@ui-machines/dom-utils"
import type { Context } from "@ui-machines/types"

export type MachineContext = Context<{
  /**
   * Whether the popover should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only popover content will be visible to screen readers
   * - focus is trapped within the popover
   * - scrolling is blocked
   *
   * @default false
   */
  modal?: boolean
  /**
   * Whether the popover is rendered in a portal
   */
  portalled?: boolean
  readonly __portalled: boolean
  /**
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   */
  autoFocus?: boolean
  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusEl?: HTMLElement | (() => HTMLElement)
  /**
   * Whether to close the popover when the user clicks outside of the popover.
   */
  closeOnBlur?: boolean
  /**
   * Whether to close the popover when the escape key is pressed.
   */
  closeOnEsc?: boolean
  /**
   * Function invoked when the popover is opened.
   */
  onOpen?: () => void
  /**
   * Function invoked when the popover is closed.
   */
  onClose?: () => void
  /**
   * Whether the reference element is rendered to be used as the
   * positioning reference
   */
  isAnchorRendered: boolean
  /**
   * The options used to position the popover content
   */
  placementOptions: PlacementOptions
}>

export type MachineState = {
  value: "unknown" | "open" | "closed"
}
