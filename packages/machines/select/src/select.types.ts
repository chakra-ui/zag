import type { Collection, CollectionOptions, CollectionItem as Item } from "@zag-js/collection"
import type { StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  content: string
  trigger: string
  clearTrigger: string
  label: string
  hiddenSelect: string
  positioner: string
  item(id: string | number): string
  itemGroup(id: string | number): string
  itemGroupLabel(id: string | number): string
}>

export type ValueChangeDetails = {
  value: string[]
  items: Item[]
}

export type HighlightChangeDetails = {
  value: string | null
  item: Item | null
}

type PublicContext = DirectionProperty &
  CommonProperties &
  InteractOutsideHandlers &
  CollectionOptions & {
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
    onHighlightChange?: (details: HighlightChangeDetails) => void
    /**
     * The callback fired when the selected item changes.
     */
    onChange?: (details: ValueChangeDetails) => void
    /**
     * The callback fired when the menu is open state changes.
     */
    onOpenChange?: (open: boolean) => void
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
   * Internal state of the typeahead
   */
  typeahead: TypeaheadState
  /**
   * The current placement of the menu
   */
  currentPlacement?: Placement
  /**
   * Whether the fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

type ComputedContext = Readonly<{
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
  highlightedItem: Item | null
  /**
   * @computed
   * The selected items
   */
  selectedItems: Item[]
  /**
   * @computed
   * The map of item key to item
   */
  collection: Collection
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type ItemProps = {
  value: Item
}

export type MachineState = {
  value: "idle" | "focused" | "open"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ItemGroupProps = {
  id: string
}

export type ItemGroupLabelProps = {
  htmlFor: string
}

export type MachineApi<T extends PropTypes = PropTypes> = {
  labelProps: T["label"]
}
