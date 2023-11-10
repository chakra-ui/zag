import type { Collection, CollectionItem, CollectionOptions } from "@zag-js/collection"
import type { StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

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

export interface OpenChangeDetails {
  open: boolean
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

interface PublicContext<T extends CollectionItem = CollectionItem>
  extends DirectionProperty,
    CommonProperties,
    InteractOutsideHandlers {
  /**
   * The item collection
   */
  collection: Collection<CollectionItem>
  /**
   * The ids of the elements in the select. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The `name` attribute of the underlying select.
   */
  name?: string
  /**
   * The associate form of the underlying select.
   */
  form?: string
  /**
   * Whether the select is disabled
   */
  disabled?: boolean
  /**
   * Whether the select is invalid
   */
  invalid?: boolean
  /**
   * Whether the select is read-only
   */
  readOnly?: boolean
  /**
   * Whether the select should close after an item is selected
   */
  closeOnSelect?: boolean
  /**
   * Whether to select the highlighted item when the user presses Tab,
   * and the menu is open.
   */
  selectOnBlur?: boolean
  /**
   * The callback fired when the highlighted item changes.
   */
  onHighlightChange?: (details: HighlightChangeDetails<T>) => void
  /**
   * The callback fired when the selected item changes.
   */
  onValueChange?: (details: ValueChangeDetails<T>) => void
  /**
   * Function called when the popup is opened
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * The positioning options of the menu.
   */
  positioning: PositioningOptions
  /**
   * The keys of the selected items
   */
  value: string[]
  /**
   * The key of the highlighted item
   */
  highlightedValue: string | null
  /**
   * Whether to loop the keyboard navigation through the options
   */
  loop?: boolean
  /**
   * Whether to allow multiple selection
   */
  multiple?: boolean
  /**
   * Whether the select menu is open
   */
  open?: boolean
}

type PrivateContext = Context<{
  /**
   * @internal
   * Internal state of the typeahead
   */
  typeahead: TypeaheadState
  /**
   * @internal
   * The current placement of the menu
   */
  currentPlacement?: Placement
  /**
   * @internal
   * Whether the fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

type ComputedContext<T extends CollectionItem = CollectionItem> = Readonly<{
  /**
   * @computed
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
  /**
   * @computed
   * Whether a typeahead is currently active
   */
  isTypingAhead: boolean
  /**
   * @computed
   * Whether the select is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether the select is disabled
   */
  isDisabled: boolean
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
   * The display value of the select (based on the selected items)
   */
  valueAsString: string
}>

export type UserDefinedContext<T extends CollectionItem = CollectionItem> = RequiredBy<
  PublicContext<T>,
  "id" | "collection"
>

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps<T extends CollectionItem = CollectionItem> {
  item: T
}

export interface ItemState {
  value: string
  isDisabled: boolean
  isSelected: boolean
  isHighlighted: boolean
}

export interface ItemGroupProps {
  id: string
}

export interface ItemGroupLabelProps {
  htmlFor: string
}

export interface MachineApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
  /**
   * Whether the select is focused
   */
  isFocused: boolean
  /**
   * Whether the select is open
   */
  isOpen: boolean
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
   * Function to toggle the combobox
   */
  collection: Collection<V>
  /**
   * Function to set the collection of items
   */
  setCollection(collection: Collection<V>): void
  /**
   * Function to set the positioning options of the select
   */
  reposition(options: Partial<PositioningOptions>): void

  rootProps: T["element"]
  labelProps: T["label"]
  controlProps: T["element"]
  triggerProps: T["button"]
  indicatorProps: T["element"]
  clearTriggerProps: T["button"]
  positionerProps: T["element"]
  contentProps: T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemGroupProps(props: ItemGroupProps): T["element"]
  getItemGroupLabelProps(props: ItemGroupLabelProps): T["element"]
  hiddenSelectProps: T["select"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { CollectionOptions, CollectionItem }
