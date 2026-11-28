import type { CollectionItem, CollectionOptions, ListCollection } from "@zag-js/collection"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { InteractOutsideHandlers, LayerSnapshot } from "@zag-js/dismissable"
import type { AnimationFrame, ModifierKeys } from "@zag-js/dom-query"
import type { LiveRegion } from "@zag-js/dom-query/live-region"
import type { Placement, PlacementSide, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

/**
 * What changed the value:
 * - `input-change`: the user typed
 * - `item-select`: a suggestion was clicked or chosen with Enter
 * - `interact-outside`: focus left while a suggestion was shown inline
 * - `clear-trigger`: the clear trigger was pressed
 * - `script`: `setValue` or `clearValue` was called
 */
export type ValueChangeReason = "input-change" | "item-select" | "interact-outside" | "clear-trigger" | "script"

export interface ValueChangeDetails {
  value: string
  reason?: ValueChangeReason | undefined
}

export interface HighlightChangeDetails<T extends CollectionItem = CollectionItem> {
  highlightedValue: string | null
  highlightedItem: T | null
}

export type OpenChangeReason =
  | "input-click"
  | "input-change"
  | "trigger-click"
  | "arrow-key"
  | "escape-key"
  | "enter-key"
  | "item-select"
  | "interact-outside"
  | "clear-trigger"
  | "script"

export interface OpenChangeDetails {
  open: boolean
  reason?: OpenChangeReason | undefined
}

export interface SelectionDetails {
  /**
   * The value of the chosen item
   */
  itemValue: string
  /**
   * The text written to the input
   */
  value: string
  /**
   * The modifier keys held when the item was chosen
   */
  modifiers: ModifierKeys
}

export interface ScrollToIndexDetails {
  index: number
  immediate?: boolean | undefined
  getElement: () => HTMLElement | null
}

export interface NavigateDetails {
  value: string
  node: HTMLAnchorElement
  href: string
  modifiers: ModifierKeys
}

export interface HighlightedItemDetails {
  label: string
}

export interface IntlTranslations {
  triggerLabel?: string | undefined
  clearTriggerLabel?: string | undefined
  /**
   * Announced when the suggestions settle after typing. Return "" to disable.
   */
  resultsCount?: ((count: number) => string) | undefined
  /**
   * Announced when typing yields no suggestions. Set to "" to disable.
   */
  noResults?: string | undefined
  /**
   * Announced while suggestions load. Set to "" to disable.
   */
  loading?: string | undefined
  /**
   * Announced on Apple platforms when a suggestion is highlighted. Return "" to disable.
   */
  highlightedItem?: ((details: HighlightedItemDetails) => string) | undefined
}

export type ElementIds = Partial<{
  root: string
  label: string
  control: string
  input: string
  content: string
  list: string
  trigger: string
  clearTrigger: string
  positioner: string
  item: (id: string) => string
  itemGroup: (id: string | number) => string
  itemGroupLabel: (id: string | number) => string
}>

/**
 * How suggestions relate to the text (`aria-autocomplete`):
 * - `list`: the list shows suggestions that match the text
 * - `both`: like `list`, and the highlighted suggestion is shown in the input
 * - `inline`: the list is not filtered; the highlighted suggestion is shown in the input
 * - `none`: the list is not filtered and the input only changes on choice
 */
export type AutocompleteMode = "list" | "both" | "inline" | "none"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface AutocompleteProps<T extends CollectionItem = CollectionItem>
  extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The ids of the elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The suggestions
   */
  collection?: ListCollection<T> | undefined
  /**
   * The controlled text of the input
   */
  value?: string | undefined
  /**
   * The initial text of the input. Use when you don't need to control it.
   * @default ""
   */
  defaultValue?: string | undefined
  /**
   * Called when the text changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * How suggestions relate to the text
   * @default "list"
   */
  mode?: AutocompleteMode | undefined
  /**
   * Whether to highlight the first suggestion as the user types
   * @default false
   */
  autoHighlight?: boolean | undefined
  /**
   * The controlled open state
   */
  open?: boolean | undefined
  /**
   * The initial open state. Use when you don't need to control it.
   */
  defaultOpen?: boolean | undefined
  /**
   * Called when the suggestions open or close
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Whether to open on click of the input
   * @default false
   */
  openOnClick?: boolean | undefined
  /**
   * Whether to open when the text changes
   * @default true
   */
  openOnChange?: boolean | ((details: ValueChangeDetails) => boolean) | undefined
  /**
   * Whether to open on arrow key press
   * @default true
   */
  openOnKeyPress?: boolean | undefined
  /**
   * The controlled highlighted suggestion
   */
  highlightedValue?: string | null | undefined
  /**
   * The initial highlighted suggestion
   */
  defaultHighlightedValue?: string | null | undefined
  /**
   * Called when a suggestion is highlighted with the pointer or keyboard
   */
  onHighlightChange?: ((details: HighlightChangeDetails<T>) => void) | undefined
  /**
   * Called when a suggestion is chosen
   */
  onSelect?: ((details: SelectionDetails) => void) | undefined
  /**
   * Whether choosing a suggestion submits the input's form, as a search box does
   * @default false
   */
  submitOnSelect?: boolean | undefined
  /**
   * Whether keyboard navigation loops
   * @default true
   */
  loopFocus?: boolean | undefined
  /**
   * Number of items Page Up / Page Down moves the highlight by
   * @default 10
   */
  pageSize?: number | undefined
  /**
   * The positioning options of the suggestions
   */
  positioning?: PositioningOptions | undefined
  /**
   * The `name` of the input, so a form submits the text
   */
  name?: string | undefined
  /**
   * The id of the form the input belongs to
   */
  form?: string | undefined
  disabled?: boolean | undefined
  readOnly?: boolean | undefined
  invalid?: boolean | undefined
  required?: boolean | undefined
  placeholder?: string | undefined
  /**
   * Whether to focus the input on mount
   */
  autoFocus?: boolean | undefined
  /**
   * Whether the suggestions are loading
   */
  loading?: boolean | undefined
  /**
   * The localized strings
   */
  translations?: IntlTranslations | undefined
  /**
   * Function to scroll to a specific index
   */
  scrollToIndexFn?: ((details: ScrollToIndexDetails) => void) | undefined
  /**
   * Function to navigate when a link suggestion is chosen
   */
  navigate?: ((details: NavigateDetails) => void) | null | undefined
}

type PropsWithDefault =
  | "collection"
  | "defaultValue"
  | "mode"
  | "openOnClick"
  | "openOnChange"
  | "openOnKeyPress"
  | "loopFocus"
  | "pageSize"
  | "positioning"

export interface AutocompleteSchema<T extends CollectionItem = CollectionItem> {
  props: AutocompleteProps<T>
  defaultPropKey: PropsWithDefault
  state: "closed.idle" | "closed.focused" | "open"
  tag: "open" | "focused" | "closed"
  context: {
    layer: LayerSnapshot | null
    value: string
    highlightedValue: string | null
    highlightedItem: T | null
    preview: string | null
    currentPlacement: Placement | undefined
  }
  refs: {
    liveRegion: LiveRegion | null
    resultsRegion: LiveRegion | null
    /** Whether the highlight should follow the first suggestion as the list changes */
    suggesting: boolean
    completing: boolean
    highlightFrame: AnimationFrame
    initialFocusFrame: AnimationFrame
    finalFocusFrame: AnimationFrame
    reconcileFrame: AnimationFrame
  }
  computed: {
    isInteractive: boolean
    inlineCompletion: boolean
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type AutocompleteService<T extends CollectionItem = CollectionItem> = Service<AutocompleteSchema<T>>

export type AutocompleteMachine<T extends CollectionItem = CollectionItem> = Machine<AutocompleteSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The item to render
   */
  item: CollectionItem
  /**
   * Whether leaving the item keeps it highlighted
   */
  persistFocus?: boolean | undefined
}

export interface ItemState {
  value: string
  disabled: boolean
  highlighted: boolean
}

export interface RootState {
  open: boolean
  focused: boolean
  disabled: boolean
  invalid: boolean
  readOnly: boolean
  required: boolean
}

export interface ContentState {
  open: boolean
  nested: boolean
  hasNested: boolean
  placement: Placement | undefined
  side: PlacementSide | undefined
  empty: boolean
  loading: boolean
}

export interface ItemGroupProps {
  id: string
}

export interface ItemGroupLabelProps {
  htmlFor: string
}

export interface AutocompleteApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
  /**
   * Whether the input is focused
   */
  focused: boolean
  /**
   * Whether the suggestions are open
   */
  open: boolean
  /**
   * Whether the suggestions are loading
   */
  loading: boolean
  /**
   * The text of the input
   */
  value: string
  /**
   * Sets the text of the input
   */
  setValue: (value: string) => void
  /**
   * Clears the text of the input
   */
  clearValue: VoidFunction
  /**
   * The value of the highlighted suggestion
   */
  highlightedValue: string | null
  /**
   * The highlighted suggestion
   */
  highlightedItem: V | null
  /**
   * Highlights a suggestion, or clears the highlight with `null`
   */
  setHighlightedValue: (value: string | null) => void
  /**
   * Chooses a suggestion, writing its text to the input
   */
  selectValue: (value: string) => void
  /**
   * The suggestions
   */
  collection: ListCollection<V>
  /**
   * Opens or closes the suggestions
   */
  setOpen: (open: boolean, reason?: OpenChangeReason) => void
  /**
   * Focuses the input
   */
  focus: VoidFunction
  /**
   * Repositions the suggestions
   */
  reposition: (options?: Partial<PositioningOptions>) => void

  getRootState: () => RootState
  getRootProps: () => T["element"]
  getLabelProps: () => T["label"]
  getControlProps: () => T["element"]
  getInputProps: () => T["input"]
  getTriggerProps: () => T["button"]
  getClearTriggerProps: () => T["button"]
  getPositionerProps: () => T["element"]
  getContentState: () => ContentState
  getContentProps: () => T["element"]
  getListProps: () => T["element"]
  getEmptyProps: () => T["element"]
  getItemState: (props: ItemProps) => ItemState
  getItemProps: (props: ItemProps) => T["element"]
  getItemTextProps: (props: ItemProps) => T["element"]
  getItemGroupProps: (props: ItemGroupProps) => T["element"]
  getItemGroupLabelProps: (props: ItemGroupLabelProps) => T["element"]
  getSeparatorProps: () => T["element"]
}

export type { CollectionItem, CollectionOptions, Placement, PositioningOptions }
