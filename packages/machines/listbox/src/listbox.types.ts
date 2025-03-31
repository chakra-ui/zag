import type { CollectionItem, CollectionOptions, ListCollection } from "@zag-js/collection"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails<T extends CollectionItem = CollectionItem> {
  value: string[]
  items: T[]
}

export interface HighlightChangeDetails<T extends CollectionItem = CollectionItem> {
  highlightedValue: string | null
  highlightedItem: T | null
  highlightedIndex: number
}

export interface ScrollToIndexDetails {
  index: number
  immediate?: boolean | undefined
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  content: string
  control: string
  trigger: string
  clearTrigger: string
  label: string
  hiddenSelect: string
  positioner: string
  item(id: string | number): string
  itemGroup(id: string | number): string
  itemGroupLabel(id: string | number): string
}>

export interface SelectProps<T extends CollectionItem = CollectionItem> extends DirectionProperty, CommonProperties {
  /**
   * The item collection
   */
  collection: ListCollection<T>
  /**
   * The ids of the elements in the select. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The `name` attribute of the underlying select.
   */
  name?: string | undefined
  /**
   * The associate form of the underlying select.
   */
  form?: string | undefined
  /**
   * Whether the select is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the select is invalid
   */
  invalid?: boolean | undefined
  /**
   * Whether the select is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Whether the select is required
   */
  required?: boolean | undefined
  /**
   * The callback fired when the highlighted item changes.
   */
  onHighlightChange?: ((details: HighlightChangeDetails<T>) => void) | undefined
  /**
   * The callback fired when the selected item changes.
   */
  onValueChange?: ((details: ValueChangeDetails<T>) => void) | undefined
  /**
   * The controlled keys of the selected items
   */
  value?: string[] | undefined
  /**
   * The initial default value of the select when rendered.
   * Use when you don't need to control the value of the select.
   */
  defaultValue?: string[] | undefined
  /**
   * The controlled key of the highlighted item
   */
  highlightedValue?: string | null
  /**
   * The initial value of the highlighted item when opened.
   * Use when you don't need to control the highlighted value of the select.
   */
  defaultHighlightedValue?: string | null | undefined
  /**
   * Whether to loop the keyboard navigation through the options
   * @default false
   */
  loopFocus?: boolean | undefined
  /**
   * Whether to allow multiple selection
   */
  multiple?: boolean | undefined
  /**
   * Function to scroll to a specific index
   */
  scrollToIndexFn?: ((details: ScrollToIndexDetails) => void) | undefined
  /**
   * Whether the value can be cleared by clicking the selected item.
   *
   * **Note:** this is only applicable for single selection
   */
  deselectable?: boolean | undefined
}

type PropsWithDefault = "collection"

export interface SelectSchema<T extends CollectionItem = CollectionItem> {
  state: "idle" | "focused"
  props: RequiredBy<SelectProps<T>, PropsWithDefault>
  context: {
    value: string[]
    highlightedValue: string | null
    fieldsetDisabled: boolean
    highlightedItem: T | null
    selectedItems: T[]
    valueAsString: string
  }
  computed: {
    hasSelectedItems: boolean
    isTypingAhead: boolean
    isInteractive: boolean
    isDisabled: boolean
  }
  refs: {
    typeahead: TypeaheadState
  }
  action: string
  guard: string
  effect: string
  event: EventObject
}

export type SelectService<T extends CollectionItem = CollectionItem> = Service<SelectSchema<T>>

export type SelectMachine<T extends CollectionItem = CollectionItem> = Machine<SelectSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps<T extends CollectionItem = CollectionItem> {
  /**
   * The item to render
   */
  item: T
  /**
   * Whether hovering outside should clear the highlighted state
   */
  persistFocus?: boolean | undefined
}

export interface ItemState {
  /**
   * The underlying value of the item
   */
  value: string
  /**
   * Whether the item is disabled
   */
  disabled: boolean
  /**
   * Whether the item is selected
   */
  selected: boolean
  /**
   * Whether the item is highlighted
   */
  highlighted: boolean
}

export interface ItemGroupProps {
  id: string
}

export interface ItemGroupLabelProps {
  htmlFor: string
}

export interface SelectApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
  /**
   * Whether the select value is empty
   */
  empty: boolean
  /**
   * The value of the highlighted item
   */
  highlightedValue: string | null
  /**
   * The highlighted item
   */
  highlightedItem: V | null
  /**
   * Function to highlight a value
   */
  highlightValue(value: string): void
  /**
   * The selected items
   */
  selectedItems: V[]
  /**
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
  /**
   * The selected item keys
   */
  value: string[]
  /**
   * The string representation of the selected items
   */
  valueAsString: string
  /**
   * Function to select a value
   */
  selectValue(value: string): void
  /**
   * Function to select all values
   */
  selectAll(): void
  /**
   * Function to set the value of the select
   */
  setValue(value: string[]): void
  /**
   * Function to clear the value of the select.
   * If a value is provided, it will only clear that value, otherwise, it will clear all values.
   */
  clearValue(value?: string): void
  /**
   * Function to focus on the select input
   */
  focus(): void
  /**
   * Returns the state of a select item
   */
  getItemState(props: ItemProps): ItemState
  /**
   * Function to toggle the select
   */
  collection: ListCollection<V>
  /**
   * Whether the select allows multiple selections
   */
  multiple: boolean
  /**
   * Whether the select is disabled
   */
  disabled: boolean

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getValueTextProps(): T["element"]
  getContentProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemGroupProps(props: ItemGroupProps): T["element"]
  getItemGroupLabelProps(props: ItemGroupLabelProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { CollectionItem, CollectionOptions }
