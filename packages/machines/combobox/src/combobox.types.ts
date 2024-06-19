import type { Collection, CollectionItem, CollectionOptions } from "@zag-js/collection"
import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
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
}

export interface InputValueChangeDetails {
  inputValue: string
}

export interface OpenChangeDetails {
  open: boolean
}

export interface SelectionValueDetails<T extends CollectionItem = CollectionItem> {
  inputValue: string
  selectedItems: T[]
  valueAsString: string
}

export interface ScrollToIndexDetails {
  index: number
  immediate?: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  triggerLabel?: string
  clearTriggerLabel?: string
}

export type ElementIds = Partial<{
  root: string
  label: string
  control: string
  input: string
  content: string
  trigger: string
  clearTrigger: string
  item(id: string, index?: number): string
  positioner: string
  itemGroup(id: string | number): string
  itemGroupLabel(id: string | number): string
}>

interface PublicContext<T extends CollectionItem = CollectionItem>
  extends DirectionProperty,
    CommonProperties,
    InteractOutsideHandlers {
  /**
   * Whether the combobox is open
   */
  open?: boolean
  /**
   * Whether the combobox open state is controlled by the user
   */
  "open.controlled"?: boolean
  /**
   * The ids of the elements in the combobox. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The current value of the combobox's input
   */
  inputValue: string
  /**
   * The `name` attribute of the combobox's input. Useful for form submission
   */
  name?: string
  /**
   * The associate form of the combobox.
   */
  form?: string
  /**
   * Whether the combobox is disabled
   */
  disabled?: boolean
  /**
   * Whether the combobox is readonly. This puts the combobox in a "non-editable" mode
   * but the user can still interact with it
   */
  readOnly?: boolean
  /**
   * Whether the combobox is invalid
   */
  invalid?: boolean
  /**
   * Whether the combobox is required
   */
  required?: boolean
  /**
   * The placeholder text of the combobox's input
   */
  placeholder?: string
  /**
   * The active item's id. Used to set the `aria-activedescendant` attribute
   */
  highlightedValue: string | null
  /**
   * The keys of the selected items
   */
  value: string[]
  /**
   * Defines the auto-completion behavior of the combobox.
   *
   * - `autohighlight`: The first focused item is highlighted as the user types
   * - `autocomplete`: Navigating the listbox with the arrow keys selects the item and the input is updated
   *
   * @default "none"
   */
  inputBehavior: "autohighlight" | "autocomplete" | "none"
  /**
   * The behavior of the combobox input when an item is selected
   *
   * - `replace`: The selected item string is set as the input value
   * - `clear`: The input value is cleared
   * - `preserve`: The input value is preserved
   *
   * @default "replace"
   */
  selectionBehavior: "clear" | "replace" | "preserve"
  /**
   * Whether to autofocus the input on mount
   */
  autoFocus?: boolean
  /**
   * Whether to open the combobox popup on initial click on the input
   * @default false
   */
  openOnClick?: boolean
  /**
   * Whether to show the combobox when the input value changes
   * @default true
   */
  openOnChange?: boolean | ((details: InputValueChangeDetails) => boolean)
  /**
   * Whether to allow typing custom values in the input
   */
  allowCustomValue?: boolean
  /**
   * Whether to loop the keyboard navigation through the items
   * @default true
   */
  loopFocus?: boolean
  /**
   * The positioning options to dynamically position the menu
   */
  positioning: PositioningOptions
  /**
   * Function called when the input's value changes
   */
  onInputValueChange?: (details: InputValueChangeDetails) => void
  /**
   * Function called when a new item is selected
   */
  onValueChange?: (details: ValueChangeDetails<T>) => void
  /**
   * Function called when an item is highlighted using the pointer
   * or keyboard navigation.
   */
  onHighlightChange?: (details: HighlightChangeDetails<T>) => void
  /**
   * Function called when the popup is opened
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations: IntlTranslations
  /**
   * The collection of items
   */
  collection: Collection<any>
  /**
   * Whether to allow multiple selection.
   *
   * **Good to know:** When `multiple` is `true`, the `selectionBehavior` is automatically set to `clear`.
   * It is recommended to render the selected items in a separate container.
   */
  multiple?: boolean
  /**
   * Whether to close the combobox when an item is selected.
   */
  closeOnSelect?: boolean
  /**
   * Function to get the display value of the selected item
   */
  getSelectionValue?: (details: SelectionValueDetails<T>) => string
  /**
   * Whether to open the combobox on arrow key press
   * @default true
   */
  openOnKeyPress: boolean
  /**
   * Function to scroll to a specific index
   */
  scrollToIndexFn?: (details: ScrollToIndexDetails) => void
  /**
   * Whether the combobox is a composed with other composite widgets like tabs
   * @default true
   */
  composite: boolean
  /**
   * Whether to disable registering this a dismissable layer
   */
  disableLayer?: boolean
}

export type UserDefinedContext<T extends CollectionItem = CollectionItem> = RequiredBy<
  PublicContext<T>,
  "id" | "collection"
>

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the input's value is empty
   */
  isInputValueEmpty: boolean
  /**
   * @computed
   * Whether the combobox is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   */
  autoComplete: boolean
  /**
   * @computed
   */
  autoHighlight: boolean
  /**
   * @computed
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
}>

interface PrivateContext<T extends CollectionItem = CollectionItem> {
  /**
   * @internal
   * The placement of the combobox popover.
   */
  currentPlacement?: Placement
  /**
   * The highlighted item
   */
  highlightedItem: T | null
  /**
   * @interal
   * The selected items
   */
  selectedItems: T[]
  /**
   * @interal
   * The display value of the combobox (based on the selected items)
   */
  valueAsString: string
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "suggesting" | "interacting"
  tags: "open" | "focused" | "idle" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface TriggerProps {
  /**
   * Whether the trigger is focusable
   */
  focusable?: boolean
}

export interface ItemProps {
  /**
   * Whether hovering outside should clear the highlighted state
   */
  persistFocus?: boolean
  /**
   * The item to render
   */
  item: CollectionItem
}

export interface ItemState {
  /**
   * The value of the item
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
   * Whether the item is highlighted via pointer or keyboard navigation
   */
  highlighted: boolean
}

export interface ItemGroupProps {
  id: string
}

export interface ItemGroupLabelProps {
  htmlFor: string
}

export interface MachineApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
  /**
   * Whether the combobox is focused
   */
  focused: boolean
  /**
   * Whether the combobox is open
   */
  open: boolean
  /**
   * The value of the combobox input
   */
  inputValue: string
  /**
   * The value of the highlighted item
   */
  highlightedValue: string | null
  /**
   * The highlighted item
   */
  highlightedItem: V | null
  /**
   * The value of the combobox input
   */
  setHighlightValue(value: string): void
  /**
   * The selected items
   */
  selectedItems: V[]
  /**
   * Whether there's a selected item
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
   * Function to set the value of the combobox
   */
  setValue(value: string[]): void
  /**
   * Function to clear the value of the combobox
   */
  clearValue(value?: string): void
  /**
   * Function to focus on the combobox input
   */
  focus(): void
  /**
   * Function to set the input value of the combobox
   */
  setInputValue(value: string): void
  /**
   * Returns the state of a combobox item
   */
  getItemState(props: ItemProps): ItemState
  /**
   * Function to open or close the combobox
   */
  setOpen(open: boolean): void
  /**
   * Function to toggle the combobox
   */
  collection: Collection<V>
  /**
   * Function to set the collection of items
   */
  setCollection(collection: Collection<V>): void
  /**
   * Function to set the positioning options
   */
  reposition(options?: Partial<PositioningOptions>): void

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getControlProps(): T["element"]
  getPositionerProps(): T["element"]
  getInputProps(): T["input"]
  getContentProps(): T["element"]
  getTriggerProps(props?: TriggerProps): T["button"]
  getClearTriggerProps(): T["button"]
  getListProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemGroupProps(props: ItemGroupProps): T["element"]
  getItemGroupLabelProps(props: ItemGroupLabelProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { CollectionItem, CollectionOptions, Placement, PositioningOptions }
