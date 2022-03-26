import type { PositioningOptions, Placement } from "@ui-machines/popper"
import type { Context, MaybeElement } from "@ui-machines/types"

export type MachineContext = Context<{
  /**
   * @internal Whether the dialog title is rendered
   */
  isTitleRendered: boolean
  /**
   * @internal Whether the dialog description is rendered
   */
  isDescriptionRendered: boolean
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
  /**
   * @computed The computed value of `portalled`
   */
  readonly currentPortalled: boolean
  /**
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   */
  autoFocus?: boolean
  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusEl?: MaybeElement | (() => MaybeElement)
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
   *
   * @internal Whether the reference element is rendered to be used as the
   * positioning reference
   */
  isAnchorRendered: boolean
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
  /**
   * @internal The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * @computed Whether the dynamic placement has been computed
   */
  readonly isPlacementComplete?: boolean
}>

export type MachineState = {
  value: "unknown" | "open" | "closed"
}
