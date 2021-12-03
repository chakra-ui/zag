export type TooltipMachineContext = {
  /**
   * The owner document of the tooltip.
   */
  doc?: Document
  /**
   * The `id` of the tooltip.
   */
  id: string
  /**
   * Whether the tooltip is disabled.
   */
  disabled?: boolean
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
  readonly hasAriaLabel: boolean
}

export type TooltipMachineState = {
  value: "unknown" | "opening" | "open" | "closing" | "closed"
}
