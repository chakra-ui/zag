import type { CollectionItem, GridCollection, ListCollection, Selection, SelectionMode } from "@zag-js/collection"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, OrientationProperty, PropTypes, RequiredBy } from "@zag-js/types"

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

export interface SelectionDetails {
  value: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  content: string
  label: string
  item(id: string | number): string
  itemGroup(id: string | number): string
  itemGroupLabel(id: string | number): string
}>

export interface ListboxProps<T extends CollectionItem = CollectionItem>
  extends DirectionProperty,
    CommonProperties,
    OrientationProperty {
  /**
   * The item collection
   */
  collection: ListCollection<T> | GridCollection<T>
  /**
   * The ids of the elements in the listbox. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the listbox is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether to disallow selecting all items when `meta+a` is pressed
   */
  disallowSelectAll?: boolean | undefined
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
   * The initial default value of the listbox when rendered.
   * Use when you don't need to control the value of the listbox.
   *
   * @default []
   */
  defaultValue?: string[] | undefined
  /**
   * The controlled key of the highlighted item
   */
  highlightedValue?: string | null | undefined
  /**
   * The initial value of the highlighted item when opened.
   * Use when you don't need to control the highlighted value of the listbox.
   */
  defaultHighlightedValue?: string | null | undefined
  /**
   * Whether to loop the keyboard navigation through the options
   * @default false
   */
  loopFocus?: boolean | undefined
  /**
   * How multiple selection should behave in the listbox.
   *
   * - `single`: The user can select a single item.
   * - `multiple`: The user can select multiple items without using modifier keys.
   * - `extended`: The user can select multiple items by using modifier keys.
   *
   * @default "single"
   */
  selectionMode?: SelectionMode | undefined
  /**
   * Function to scroll to a specific index
   */
  scrollToIndexFn?: ((details: ScrollToIndexDetails) => void) | undefined
  /**
   * Whether to select the item when it is highlighted
   */
  selectOnHighlight?: boolean | undefined
  /**
   * Whether to disallow empty selection
   */
  deselectable?: boolean | undefined
  /**
   * Whether to enable typeahead on the listbox
   */
  typeahead?: boolean | undefined
  /**
   * Function called when an item is selected
   */
  onSelect?: ((details: SelectionDetails) => void) | undefined
}

type PropsWithDefault = "collection" | "selectionMode"

export interface ListboxSchema<T extends CollectionItem = CollectionItem> {
  state: "idle"
  props: RequiredBy<ListboxProps<T>, PropsWithDefault>
  context: {
    value: string[]
    highlightedValue: string | null
    highlightedItem: T | null
    selectedItems: T[]
    focused: boolean
  }
  computed: {
    hasSelectedItems: boolean
    isTypingAhead: boolean
    isInteractive: boolean
    selection: Selection
    multiple: boolean
    valueAsString: string
  }
  refs: {
    typeahead: TypeaheadState
    prevCollection: ListCollection<T> | null
  }
  action: string
  guard: string
  effect: string
  event: EventObject
}

export type ListboxService<T extends CollectionItem = CollectionItem> = Service<ListboxSchema<T>>

export type ListboxMachine<T extends CollectionItem = CollectionItem> = Machine<ListboxSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps<T extends CollectionItem = CollectionItem> {
  /**
   * The item to render
   */
  item: T
  /**
   * Whether to highlight the item on hover
   */
  highlightOnHover?: boolean | undefined
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

export interface InputProps {
  /**
   * Whether to automatically highlight the item when typing
   * @default false
   */
  autoHighlight?: boolean | undefined
}

export interface ListboxApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
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
   * Function to clear the highlighted value
   */
  clearHighlightedValue(): void
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
   * Function to select all values.
   *
   * **Note**: This should only be called when the selectionMode is `multiple` or `extended`.
   * Otherwise, an exception will be thrown.
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
   * Returns the state of a select item
   */
  getItemState(props: ItemProps): ItemState
  /**
   * Function to toggle the select
   */
  collection: ListCollection<V>
  /**
   * Whether the select is disabled
   */
  disabled: boolean

  getInputProps(props?: InputProps): T["input"]
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
