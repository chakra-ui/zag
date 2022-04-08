import { Context } from "@zag-js/types"

type IntlMessages = {
  tablistLabel?: string
  deleteLabel?(value: string): string
}

export type MachineContext = Context<{
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
  /**
   * Whether the keyboard navigation will loop from last tab to first, and vice versa.
   * @default true
   */
  loop: boolean
  /**
   * Whether the indicator is rendered.
   */
  isIndicatorRendered: boolean
  /**
   * @internal The focused tab id
   */
  focusedValue: string | null
  /**
   * The selected tab id
   */
  value: string | null
  /**
   * The orientation of the tabs. Can be `horizontal` or `vertical`
   * - `horizontal`: only left and right arrow key navigation will work.
   * - `vertical`: only up and down arrow key navigation will work.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * @computed Whether the tab is in the horizontal orientation
   */
  readonly isHorizontal: boolean
  /**
   * @computed Whether the tab is in the vertical orientation
   */
  readonly isVertical: boolean
  /**
   * The activation mode of the tabs. Can be `manual` or `automatic`
   * - `manual`: Tabs are activated when clicked or press `enter` key.
   * - `automatic`: Tabs are activated when receiving focus
   * @default "automatic"
   */
  activationMode?: "manual" | "automatic"
  /**
   * @internal The active tab indicator's dom rect
   */
  indicatorRect?: Partial<{ left: string; top: string; width: string; height: string }>
  /**
   * @internal Whether the active tab indicator's rect has been measured
   */
  hasMeasuredRect?: boolean
  /**
   * Callback to be called when the selected/active tab changes
   */
  onChange?: (details: { value: string | null }) => void
  /**
   * Callback to be called when the focused tab changes
   */
  onFocus?: (details: { value: string | null }) => void
  /**
   * Callback to be called when a tab's close button is clicked
   */
  onDelete?: (details: { value: string }) => void
  /**
   * @internal The previously selected tab ids. This is useful for performance optimization
   */
  previousValues: string[]
}>

export type MachineState = {
  value: "unknown" | "idle" | "focused"
}

export type TabProps = {
  value: string
  disabled?: boolean
}
