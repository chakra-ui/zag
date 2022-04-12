import { Placement, PositioningOptions } from "@zag-js/popper"

type IdMap = Partial<{
  trigger: string
  content: string
}>

export type MachineContext = {
  /**
   * The ids of the elements in the tooltip. Useful for composition.
   */
  ids?: IdMap
  /**
   * @internal The owner document of the tooltip.
   */
  doc?: Document
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
  onOpen?: VoidFunction
  /**
   * Function called when the tooltip is closed.
   */
  onClose?: VoidFunction
  /**
   * Custom label for the tooltip.
   */
  "aria-label"?: string
  /**
   * @computed Whether an `aria-label` is set.
   */
  readonly hasAriaLabel: boolean
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
  /**
   * @internal The computed placement of the tooltip.
   */
  currentPlacement?: Placement
  /**
   * @computed Whether the dynamic placement has been computed
   */
  isPlacementComplete?: boolean
}

export type MachineState = {
  value: "unknown" | "opening" | "open" | "closing" | "closed"
  tags: "open" | "closed"
}
