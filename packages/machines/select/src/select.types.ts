import type { CollectionItem, CollectionOptions, ListCollection } from "@zag-js/collection"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { LiveRegion } from "@zag-js/live-region"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { AutoScrollHandlers } from "./select.dom"

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

export interface OpenChangeDetails {
  open: boolean
  value: string[]
}

export interface ScrollToIndexDetails {
  index: number
  immediate?: boolean | undefined
  getElement: () => HTMLElement | null
}

export interface SelectionDetails {
  value: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ItemAnnouncementDetails {
  value: string
  label: string
  selected: boolean
}

export interface IntlTranslations {
  clearTriggerLabel?: string | undefined
  /**
   * Format the live-region announcement when the highlighted item changes.
   * Useful for localizing the "selected" suffix or customizing the message.
   */
  itemAnnouncement?: ((details: ItemAnnouncementDetails) => string) | undefined
}

export type ElementIds = Partial<{
  root: string
  content: string
  list: string
  control: string
  trigger: string
  clearTrigger: string
  label: string
  hiddenSelect: string
  positioner: string
  item: (id: string | number) => string
  itemGroup: (id: string | number) => string
  itemGroupLabel: (id: string | number) => string
}>

export interface SelectProps<T extends CollectionItem = CollectionItem>
  extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
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
   * The autocomplete attribute for the hidden select. Enables browser autofill (e.g. "address-level1" for state).
   */
  autoComplete?: string | undefined
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
   * Whether the select should close after an item is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * Function called when an item is selected
   */
  onSelect?: ((details: SelectionDetails) => void) | undefined
  /**
   * The callback fired when the highlighted item changes.
   */
  onHighlightChange?: ((details: HighlightChangeDetails<T>) => void) | undefined
  /**
   * The callback fired when the selected item changes.
   */
  onValueChange?: ((details: ValueChangeDetails<T>) => void) | undefined
  /**
   * Function called when the popup is opened
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The positioning options of the menu.
   */
  positioning?: PositioningOptions | undefined
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
  highlightedValue?: string | null | undefined
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
   * Whether the select menu is open
   */
  open?: boolean | undefined
  /**
   * Whether the select's open state is controlled by the user
   */
  defaultOpen?: boolean | undefined
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
  /**
   * Whether the positioner overlaps the trigger so the selected item's text is
   * aligned with the trigger's value text. Only applies to mouse/keyboard input
   * and is automatically disabled for touch or when there is not enough space.
   * @default false
   */
  alignItemWithTrigger?: boolean | undefined
  /**
   * Element to receive focus when the select is opened. Defaults to the first
   * tabbable element inside the content (typically the list).
   */
  initialFocusEl?: (() => HTMLElement | null) | undefined
  /**
   * The ARIA pattern of the popup. Drives `aria-haspopup` on the trigger and
   * the `role` of the content element.
   * - `"listbox"` (default) — content is a passthrough wrapper; the list bears `role="listbox"`.
   * - `"dialog"` — content is announced as a dialog; useful when composing search inputs, tabs, or other widgets inside the popup.
   *
   * @default "listbox"
   */
  popupType?: "listbox" | "dialog" | undefined
}

type PropsWithDefault = "positioning" | "closeOnSelect" | "loopFocus" | "popupType" | "collection" | "translations"

export interface SelectSchema<T extends CollectionItem = CollectionItem> {
  state: "idle" | "focused" | "open"
  props: RequiredBy<SelectProps<T>, PropsWithDefault>
  context: {
    currentPlacement: Placement | undefined
    value: string[]
    highlightedValue: string | null
    fieldsetDisabled: boolean
    highlightedItem: T | null
    selectedItemMap: Map<string, T>
    scrollArrowVisibility: "none" | "top" | "bottom" | "both"
    positioned: boolean
    aligned: boolean
  }
  computed: {
    hasSelectedItems: boolean
    isTypingAhead: boolean
    isInteractive: boolean
    isDisabled: boolean
    selectedItems: T[]
    valueAsString: string
  }
  refs: {
    typeahead: TypeaheadState
    openMethod: "mouse" | "touch" | "keyboard" | null
    autoScrollTop: AutoScrollHandlers | null
    autoScrollBottom: AutoScrollHandlers | null
    realignWithTrigger: VoidFunction | null
    handleGrowth: VoidFunction | null
    liveRegion: LiveRegion | null
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

export interface ScrollArrowProps {
  /**
   * Where the scroll arrow is placed.
   * - `"top"`: the arrow shown at the top of the popup (scrolls content up)
   * - `"bottom"`: the arrow shown at the bottom of the popup (scrolls content down)
   */
  placement: "top" | "bottom"
}

export interface SelectApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
  /**
   * Which scroll arrows should be visible based on the content's scroll position.
   * - `"none"`: content fits, no scrolling needed
   * - `"top"`: scrolled past the top (top arrow visible)
   * - `"bottom"`: more content below (bottom arrow visible)
   * - `"both"`: scrolled somewhere in the middle (both arrows visible)
   */
  scrollArrowVisibility: "none" | "top" | "bottom" | "both"
  /**
   * Whether the select is focused
   */
  focused: boolean
  /**
   * Whether the select is open
   */
  open: boolean
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
  setHighlightValue: (value: string) => void
  /**
   * Function to clear the highlighted value
   */
  clearHighlightValue: VoidFunction
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
  selectValue: (value: string) => void
  /**
   * Function to select all values
   */
  selectAll: VoidFunction
  /**
   * Function to set the value of the select
   */
  setValue: (value: string[]) => void
  /**
   * Function to clear the value of the select.
   * If a value is provided, it will only clear that value, otherwise, it will clear all values.
   */
  clearValue: (value?: string) => void
  /**
   * Function to focus on the select input
   */
  focus: VoidFunction
  /**
   * Returns the state of a select item
   */
  getItemState: (props: ItemProps) => ItemState
  /**
   * Function to open or close the select
   */
  setOpen: (open: boolean) => void
  /**
   * Function to toggle the select
   */
  collection: ListCollection<V>
  /**
   * Function to set the positioning options of the select
   */
  reposition: (options?: Partial<PositioningOptions>) => void
  /**
   * Whether the select allows multiple selections
   */
  multiple: boolean
  /**
   * Whether the select is disabled
   */
  disabled: boolean

  getRootProps: () => T["element"]
  getLabelProps: () => T["label"]
  getControlProps: () => T["element"]
  getTriggerProps: () => T["button"]
  getIndicatorProps: () => T["element"]
  getClearTriggerProps: () => T["button"]
  getValueTextProps: () => T["element"]
  getPositionerProps: () => T["element"]
  getContentProps: () => T["element"]
  getListProps: () => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getItemTextProps: (props: ItemProps) => T["element"]
  getItemIndicatorProps: (props: ItemProps) => T["element"]
  getItemGroupProps: (props: ItemGroupProps) => T["element"]
  getItemGroupLabelProps: (props: ItemGroupLabelProps) => T["element"]
  getScrollArrowProps: (props: ScrollArrowProps) => T["element"]
  getHiddenSelectProps: () => T["select"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { CollectionItem, CollectionOptions, PositioningOptions }
