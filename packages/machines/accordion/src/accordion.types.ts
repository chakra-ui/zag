import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { EventObject, Service } from "@zag-js/core"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[]
}

export interface FocusChangeDetails {
  value: string | null
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  item(value: string): string
  itemContent(value: string): string
  itemTrigger(value: string): string
}>

export interface AccordionProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether multiple accordion items can be expanded at the same time.
   * @default false
   */
  multiple?: boolean | undefined
  /**
   * Whether an accordion item can be closed after it has been expanded.
   * @default false
   */
  collapsible?: boolean | undefined
  /**
   * The controlled value of the expanded accordion items.
   */
  value?: string[] | undefined
  /**
   * The initial value of the expanded accordion items.
   * Use when you don't need to control the value of the accordion.
   */
  defaultValue?: string[] | undefined
  /**
   * Whether the accordion items are disabled
   */
  disabled?: boolean | undefined
  /**
   * The callback fired when the state of expanded/collapsed accordion items changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The callback fired when the focused accordion item changes.
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   *  The orientation of the accordion items.
   *  @default "vertical"
   */
  orientation?: "horizontal" | "vertical" | undefined
}

type PropsWithDefault = "multiple" | "collapsible" | "orientation"

export type AccordionSchema = {
  state: "idle" | "focused"
  props: RequiredBy<AccordionProps, PropsWithDefault>
  context: {
    value: string[]
    focusedValue: string | null
  }
  computed: {
    isHorizontal: boolean
  }
  action: string
  guard: string
  effect: string
  event: EventObject
}

export type AccordionService = Service<AccordionSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The value of the accordion item.
   */
  value: string
  /**
   * Whether the accordion item is disabled.
   */
  disabled?: boolean | undefined
}

export interface ItemState {
  /**
   * Whether the accordion item is expanded.
   */
  expanded: boolean
  /**
   * Whether the accordion item is focused.
   */
  focused: boolean
  /**
   * Whether the accordion item is disabled.
   */
  disabled: boolean
}

export interface AccordionApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the focused accordion item.
   */
  focusedValue: string | null
  /**
   * The value of the accordion
   */
  value: string[]
  /**
   * Sets the value of the accordion.
   */
  setValue: (value: string[]) => void
  /**
   * Gets the state of an accordion item.
   */
  getItemState(props: ItemProps): ItemState

  getRootProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemContentProps(props: ItemProps): T["element"]
  getItemTriggerProps(props: ItemProps): T["button"]
  getItemIndicatorProps(props: ItemProps): T["element"]
}
