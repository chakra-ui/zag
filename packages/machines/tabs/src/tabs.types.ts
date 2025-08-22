import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string
}

export interface FocusChangeDetails {
  focusedValue: string
}

export interface NavigateDetails {
  value: string
  node: HTMLAnchorElement
  href: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  listLabel?: string | undefined
}

export type ElementIds = Partial<{
  root: string
  trigger: string
  list: string
  content: string
  indicator: string
}>

export interface TabsProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the tabs. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
  /**
   * Whether the keyboard navigation will loop from last tab to first, and vice versa.
   * @default true
   */
  loopFocus?: boolean | undefined
  /**
   * The controlled selected tab value
   */
  value?: string | null | undefined
  /**
   * The initial selected tab value when rendered.
   * Use when you don't need to control the selected tab value.
   */
  defaultValue?: string | null | undefined
  /**
   * The orientation of the tabs. Can be `horizontal` or `vertical`
   * - `horizontal`: only left and right arrow key navigation will work.
   * - `vertical`: only up and down arrow key navigation will work.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical" | undefined
  /**
   * The activation mode of the tabs. Can be `manual` or `automatic`
   * - `manual`: Tabs are activated when clicked or press `enter` key.
   * - `automatic`: Tabs are activated when receiving focus
   *
   * @default "automatic"
   */
  activationMode?: "manual" | "automatic" | undefined
  /**
   * Callback to be called when the selected/active tab changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Callback to be called when the focused tab changes
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   * Whether the tab is composite
   */
  composite?: boolean | undefined
  /**
   * Whether the active tab can be deselected when clicking on it.
   */
  deselectable?: boolean | undefined
  /**
   * Function to navigate to the selected tab when clicking on it.
   * Useful if tab triggers are anchor elements.
   */
  navigate?: ((details: NavigateDetails) => void) | null | undefined
}

type PropsWithDefault = "orientation" | "activationMode" | "loopFocus"

export type TabsSchema = {
  state: "idle" | "focused"
  props: RequiredBy<TabsProps, PropsWithDefault>
  context: {
    ssr: boolean
    value: string | null
    focusedValue: string | null
    indicatorTransition: boolean
    indicatorRect: { left: string; top: string; width: string; height: string }
  }
  refs: {
    indicatorCleanup: VoidFunction | null | undefined
  }
  computed: {
    focused: boolean
  }
  action: string
  guard: string
  effect: string
  event: EventObject
}

export type TabsService = Service<TabsSchema>

export type TabsMachine = Machine<TabsSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface TriggerProps {
  /**
   * The value of the tab
   */
  value: string
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean | undefined
}

export interface TriggerState {
  /**
   * Whether the tab is selected
   */
  selected: boolean
  /**
   * Whether the tab is focused
   */
  focused: boolean
  /**
   * Whether the tab is disabled
   */
  disabled: boolean
}

export interface ContentProps {
  /**
   * The value of the tab
   */
  value: string
}

export interface TabsApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the tabs.
   */
  value: string | null
  /**
   * The value of the tab that is currently focused.
   */
  focusedValue: string | null
  /**
   * Sets the value of the tabs.
   */
  setValue: (value: string) => void
  /**
   * Clears the value of the tabs.
   */
  clearValue: VoidFunction
  /**
   * Sets the indicator rect to the tab with the given value
   */
  setIndicatorRect: (value: string) => void
  /**
   * Synchronizes the tab index of the content element.
   * Useful when rendering tabs within a select or combobox
   */
  syncTabIndex: VoidFunction
  /**
   * Set focus on the selected tab trigger
   */
  focus: VoidFunction
  /**
   * Selects the next tab
   */
  selectNext: (fromValue?: string) => void
  /**
   * Selects the previous tab
   */
  selectPrev: (fromValue?: string) => void
  /**
   * Returns the state of the trigger with the given props
   */
  getTriggerState: (props: TriggerProps) => TriggerState

  getRootProps: () => T["element"]
  getListProps: () => T["element"]
  getTriggerProps: (props: TriggerProps) => T["button"]
  getContentProps: (props: ContentProps) => T["element"]
  getIndicatorProps: () => T["element"]
}
