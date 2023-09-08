import type { Collection, CollectionItem, CollectionOptions } from "@zag-js/collection"
import type { StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export type { CollectionOptions, CollectionItem }

type IntlTranslations = {
  triggerLabel?: string
  clearTriggerLabel?: string
}

type ElementIds = Partial<{
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

export type ValueChangeDetails<T extends CollectionItem = CollectionItem> = {
  value: string[]
  items: T[]
}

export type HighlightChangeDetails<T extends CollectionItem = CollectionItem> = {
  value: string | null
  item: T | null
}

type InputValueChangeDetails = {
  value: string
}

type PublicContext<T extends CollectionItem = CollectionItem> = DirectionProperty &
  CommonProperties &
  InteractOutsideHandlers & {
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
     * Whether the combobox is required
     */
    invalid?: boolean
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
     */
    inputBehavior: "autohighlight" | "autocomplete" | "none"
    /**
     * The behavior of the combobox input when an item is selected
     *
     * - `replace`: The selected item string is set as the input value
     * - `clear`: The input value is cleared
     * - `preserve`: The input value is preserved
     */
    selectionBehavior: "clear" | "replace" | "preserve"
    /**
     * Whether to select the higlighted item on interaction outside the combobox
     */
    selectOnBlur: boolean
    /**
     * Whether to autofocus the input on mount
     */
    autoFocus?: boolean
    /**
     * Whether to open the combobox popup on initial click on the input
     */
    openOnClick?: boolean
    /**
     * Whether to allow custom values or free values in the input
     */
    allowCustomValue?: boolean
    /**
     * Whether to loop the keyboard navigation through the items
     */
    loop?: boolean
    /**
     * The positioning options to dynamically position the menu
     */
    positioning: PositioningOptions
    /**
     * Function called when the input's value changes
     */
    onInputChange?: (details: InputValueChangeDetails) => void
    /**
     * Function called when a new item is selected
     */
    onChange?: (details: ValueChangeDetails<T>) => void
    /**
     * Function called when an item is highlighted using the pointer
     * or keyboard navigation.
     */
    onHighlight?: (details: HighlightChangeDetails<T>) => void
    /**
     * Function called when the popup is opened
     */
    onOpen?: VoidFunction
    /**
     * Function called when the popup is closed
     */
    onClose?: VoidFunction
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    translations: IntlTranslations
    /**
     * The collection of items
     */
    collection: Collection<any>
    /**
     * Whether to allow multiple selection
     */
    multiple?: boolean
    /**
     * Whether to close the combobox when an item is selected.
     */
    closeOnSelect?: boolean
  }

/**
 * This is the actual context exposed to the user.
 */
export type UserDefinedContext<T extends CollectionItem = CollectionItem> = RequiredBy<
  PublicContext<T>,
  "id" | "collection"
>

type ComputedContext<T extends CollectionItem = CollectionItem> = Readonly<{
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
   * The highlighted item
   */
  highlightedItem: T | null
  /**
   * @computed
   * The selected items
   */
  selectedItems: T[]
  /**
   * @computed
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
  /**
   * @computed
   * The display value of the combobox (based on the selected items)
   */
  valueAsString: string
}>

type PrivateContext = Context<{
  /**
   * @internal
   * The placement of the combobox popover.
   */
  currentPlacement?: Placement
  /**
   * @internal
   * Whether the user is composing text in the input
   */
  composing: boolean
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "suggesting" | "interacting"
  tags: "open" | "focused" | "idle" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ItemProps = {
  item: CollectionItem
}

export type ItemState = {
  value: string
  isDisabled: boolean
  isSelected: boolean
  isHighlighted: boolean
}

export type ItemGroupProps = {
  id: string
}

export type ItemGroupLabelProps = {
  htmlFor: string
}

export type { Placement, PositioningOptions }

export type MachineApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> = {
  /**
   * Whether the combobox is focused
   */
  isFocused: boolean
  /**
   * Whether the combobox is open
   */
  isOpen: boolean
  /**
   * Whether the combobox input value is empty
   */
  isInputValueEmpty: boolean
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
  highlightValue(value: string): void
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
   * Function to open the combobox
   */
  open(): void
  /**
   * Function to close the combobox
   */
  close(): void
  /**
   * Function to set the collection of items
   */
  setCollection(collection: Collection<V>): void

  rootProps: T["element"]
  labelProps: T["label"]
  controlProps: T["element"]
  positionerProps: T["element"]
  inputProps: T["input"]
  contentProps: T["element"]
  triggerProps: T["button"]
  clearTriggerProps: T["button"]
  getItemProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemGroupProps(props: ItemGroupProps): T["element"]
  getItemGroupLabelProps(props: ItemGroupLabelProps): T["element"]
}
