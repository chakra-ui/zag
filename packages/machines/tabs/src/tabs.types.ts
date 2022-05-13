import { StateMachine as S } from "@zag-js/core"
import { Context, DirectionProperty } from "@zag-js/types"

//

type IntlMessages = {
  tablistLabel?: string
  deleteLabel?(value: string): string
}

//

type ElementIds = Partial<{
  root: string
  trigger: string
  triggerGroup: string
  contentGroup: string
  content: string
}>

//

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the tabs. Useful for composition.
   */
  ids?: ElementIds
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
   * The activation mode of the tabs. Can be `manual` or `automatic`
   * - `manual`: Tabs are activated when clicked or press `enter` key.
   * - `automatic`: Tabs are activated when receiving focus
   * @default "automatic"
   */
  activationMode?: "manual" | "automatic"
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
}

export type UserDefinedContext = Partial<PublicContext>

//

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the tab is in the horizontal orientation
   */
  isHorizontal: boolean
  /**
   * @computed
   * Whether the tab is in the vertical orientation
   */
  isVertical: boolean
}>

//

type PrivateContext = Context<{
  /**
   * @internal
   * The focused tab id
   */
  focusedValue: string | null
  /**
   * @internal
   * The active tab indicator's dom rect
   */
  indicatorRect?: Partial<{ left: string; top: string; width: string; height: string }>
  /**
   * @internal
   * Whether the active tab indicator's rect has been measured
   */
  hasMeasuredRect?: boolean
  /**
   * @internal
   * The previously selected tab ids. This is useful for performance optimization
   */
  previousValues: string[]
}>

//

export type MachineContext = PublicContext & ComputedContext & PrivateContext

//

export type MachineState = {
  value: "unknown" | "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

//

export type Send = S.Send<S.AnyEventObject>

//

export type TabProps = {
  value: string
  disabled?: boolean
}
