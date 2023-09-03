import type { Collection, CollectionItem } from "@zag-js/collection"
import type { StateMachine as S } from "@zag-js/core"
import type { FocusOutsideEvent, InteractOutsideEvent, PointerDownOutsideEvent } from "@zag-js/interact-outside"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

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

type PublicContext = DirectionProperty &
  CommonProperties & {
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
     * The behavior of the combobox when an item is selected
     */
    selectionBehavior?: "clear" | "set"
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
    onInputChange?: (details: { value: string }) => void
    /**
     * Function called when a new item is selected
     */
    onValueChange?: (details: { value: string[]; items: CollectionItem[] }) => void
    /**
     * Function called when an item is highlighted using the pointer
     * or keyboard navigation.
     */
    onHighlightChange?: (details: { value: string | null; item: CollectionItem | null }) => void
    /**
     * Function called when the popup is opened
     */
    onOpenChange?: (open: boolean) => void
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    translations: IntlTranslations
    /**
     * Function called when the pointer is pressed down outside the combobox
     */
    onPointerDownOutside?: (event: PointerDownOutsideEvent) => void
    /**
     * Function called when the focus is moved outside the combobox
     */
    onFocusOutside?: (event: FocusOutsideEvent) => void
    /**
     * Function called when an interaction happens outside the combobox
     */
    onInteractOutside?: (event: InteractOutsideEvent) => void
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
export type UserDefinedContext = RequiredBy<PublicContext, "id" | "collection">

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
   * The highlighted item
   */
  highlightedItem: CollectionItem | null
  /**
   * @computed
   * The selected items
   */
  selectedItems: CollectionItem[]
  /**
   * @computed
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
  /**
   * @computed
   * The display value of the combobox (based on the selected items)
   */
  displayValue: string
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
  key: string
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

export type { InteractOutsideEvent, Placement, PositioningOptions }

export type MachineApi<T extends PropTypes = PropTypes> = {
  isFocused: boolean
  isOpen: boolean
  isInputValueEmpty: boolean
  inputValue: string
  highlightedItem: CollectionItem | null
  selectedItems: CollectionItem[]
  setValue(value: string[]): void
  clearValue(): void
  focus(): void
  setInputValue(value: string): void
  getItemState(props: ItemProps): ItemState

  rootProps: T["element"]
  labelProps: T["label"]
  controlProps: T["element"]
  positionerProps: T["element"]
  inputProps: T["input"]
  contentProps: T["element"]
  triggerProps: T["button"]
  clearTriggerProps: T["button"]
  getItemProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemGroupProps(props: ItemGroupProps): T["element"]
  getItemGroupLabelProps(props: ItemGroupLabelProps): T["element"]
}
