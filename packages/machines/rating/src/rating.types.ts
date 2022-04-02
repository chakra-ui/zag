import { Context } from "@ui-machines/types"

type IntlMessages = {
  /**
   * Returns a human readable value for the rating.
   */
  ratingValueText(index: number): string
}

export type MachineContext = Context<{
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
  /**
   * The maximum rating value.
   */
  max: number
  /**
   * The name attribute of the rating element (used in forms).
   */
  name?: string
  /**
   * The current rating value.
   */
  value: number
  /**
   * @internal The value of the hovered rating.
   */
  hoveredValue: number
  /**
   * Whether the rating is readonly.
   */
  readonly?: boolean
  /**
   * Whether the rating is disabled.
   */
  disabled?: boolean
  /**
   * Whether to allow half stars.
   */
  allowHalf?: boolean
  /**
   * Whether to autofocus the rating.
   */
  autoFocus?: boolean
  /**
   * Function to be called when the rating value changes.
   */
  onChange?: (value: number) => void
  /**
   * Function to be called when the rating value is hovered.
   */
  onHighlightChange?: (value: number) => void
  /**
   * @computed Whether the rating is interactive
   */
  readonly isInteractive: boolean
  /**
   * @computed Whether the pointer is hovering over the rating
   */
  readonly isHovering: boolean
}>

export type MachineState = {
  value: "unknown" | "idle" | "hover" | "focus"
}
