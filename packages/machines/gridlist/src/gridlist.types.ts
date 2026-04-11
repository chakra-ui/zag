import type { CollectionItem, GridCollection, ListCollection, Selection, SelectionMode } from "@zag-js/collection"
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

export interface FocusChangeDetails<T extends CollectionItem = CollectionItem> {
  focusedValue: string | null
  focusedItem: T | null
}

export interface ActionDetails<T extends CollectionItem = CollectionItem> {
  value: string
  item: T
}

export interface NavigateDetails {
  value: string
  href: string
  node: HTMLElement
  preventDefault: VoidFunction
}

export interface ScrollToIndexDetails {
  index: number
  immediate?: boolean | undefined
  getElement: () => HTMLElement | null
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  label: string
  content: string
  item: (id: string | number) => string
  cell: (itemId: string | number, cellId: string | number) => string
  itemGroup: (id: string | number) => string
  itemGroupLabel: (id: string | number) => string
}>

export interface GridListProps<T extends CollectionItem = CollectionItem> extends DirectionProperty, CommonProperties {
  /**
   * The item collection.
   *
   * Pass a `gridCollection({ items, columnCount })` to render the rows in a 2D
   * grid layout. Arrow Left/Right then move between columns on the same row, and
   * Arrow Up/Down jump by `columnCount` rows. Interactive-children keyboard walking
   * inside rows is disabled in grid mode — use `keyboardNavigationBehavior: "tab"`
   * if you need focusable children.
   */
  collection: ListCollection<T> | GridCollection<T>
  /**
   * The ids of the elements in the gridlist. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the gridlist is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether to loop the keyboard navigation through the items
   * @default false
   */
  loopFocus?: boolean | undefined
  /**
   * How multiple selection should behave in the gridlist.
   *
   * - `none`: No selection allowed
   * - `single`: Only one item can be selected
   * - `multiple`: Multiple items can be selected using modifier keys
   *
   * @default "none"
   */
  selectionMode?: SelectionMode | undefined
  /**
   * The selection behavior of the gridlist.
   *
   * - `toggle`: Clicking an item toggles its selection (checkbox mode)
   * - `replace`: Clicking an item replaces the selection (highlight mode)
   *
   * @default "toggle"
   */
  selectionBehavior?: "toggle" | "replace" | undefined
  /**
   * The controlled keys of the selected items
   */
  value?: string[] | undefined
  /**
   * The initial selected keys when the gridlist is first rendered.
   * Use when you don't need to control the selection state.
   *
   * @default []
   */
  defaultValue?: string[] | undefined
  /**
   * Callback fired when the selection changes
   */
  onValueChange?: ((details: ValueChangeDetails<T>) => void) | undefined
  /**
   * The controlled key of the focused item
   */
  focusedValue?: string | null | undefined
  /**
   * The initial focused key when the gridlist is first rendered.
   * Use when you don't need to control the focused state.
   */
  defaultFocusedValue?: string | null | undefined
  /**
   * Callback fired when the focused item changes
   */
  onFocusChange?: ((details: FocusChangeDetails<T>) => void) | undefined
  /**
   * Whether to auto-focus the gridlist on mount.
   * - `true` / `"first"`: focus the first item
   * - `"last"`: focus the last item
   * @default false
   */
  autoFocus?: boolean | "first" | "last" | undefined
  /**
   * Whether to disallow empty selection
   * @default false
   */
  disallowEmptySelection?: boolean | undefined
  /**
   * Whether to allow deselecting the selected item
   * @default true
   */
  deselectable?: boolean | undefined
  /**
   * Whether disabled items should be completely inaccessible or only non-selectable
   * - `all`: Disabled items cannot be focused or selected
   * - `selection`: Disabled items can be focused but not selected
   *
   * @default "all"
   */
  disabledBehavior?: "all" | "selection" | undefined
  /**
   * Handler called when an item action is triggered (e.g., Enter key, double-click, or click in replace mode).
   * Not called for items with an `href` — `onNavigate` fires instead.
   */
  onAction?: ((details: ActionDetails<T>) => void) | undefined
  /**
   * Handler called when an item with an `href` is activated.
   * Call `details.preventDefault()` to cancel the navigation.
   */
  onNavigate?: ((details: NavigateDetails) => void) | undefined
  /**
   * Whether typeahead is enabled for the gridlist
   * @default true
   */
  typeahead?: boolean | undefined
  /**
   * Whether keyboard navigation to focusable elements within items is
   * via arrow keys or tab key.
   *
   * - `arrow`: Use arrow left/right to navigate interactive children
   * - `tab`: Use tab to navigate interactive children
   *
   * @default "arrow"
   */
  keyboardNavigationBehavior?: "arrow" | "tab" | undefined
  /**
   * Behavior of the Escape key.
   * - `clearSelection`: Clear the current selection
   * - `none`: Do nothing (handle externally)
   * @default "clearSelection"
   */
  escapeKeyBehavior?: "clearSelection" | "none" | undefined
  /**
   * Function called to scroll an item at a given index into view.
   * Used to integrate with virtualization libraries (e.g. @tanstack/react-virtual).
   */
  scrollToIndexFn?: ((details: ScrollToIndexDetails) => void) | undefined
  /**
   * Number of items to skip when the user presses Page Up / Page Down.
   *
   * Per the WAI-ARIA grid pattern, this is "an author-determined number of items".
   * Pick a value that matches your visible viewport (or whatever feels right for
   * your design — Finder uses one viewport, Outlook uses ~10, etc.).
   *
   * @default 10
   */
  pageSize?: number | undefined
}

type PropsWithDefault = "collection" | "selectionMode"

export interface GridListSchema<T extends CollectionItem = CollectionItem> {
  state: "idle"
  props: RequiredBy<GridListProps<T>, PropsWithDefault>
  context: {
    value: string[]
    focusedValue: string | null
    focusedItem: T | null
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
    showCheckboxes: boolean
  }
  refs: {
    typeahead: TypeaheadState
    focusVisible: boolean
  }
  action: string
  guard: string
  effect: string
  event: EventObject
}

export type GridListService<T extends CollectionItem = CollectionItem> = Service<GridListSchema<T>>

export type GridListMachine<T extends CollectionItem = CollectionItem> = Machine<GridListSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps<T extends CollectionItem = CollectionItem> {
  /**
   * The collection item
   */
  item: T
  /**
   * A URL the item links to. When present, activating the item triggers navigation.
   */
  href?: string | undefined
  /**
   * The link target (when `href` is set)
   */
  target?: string | undefined
  /**
   * The link rel (when `href` is set)
   */
  rel?: string | undefined
  /**
   * Whether to focus the item on hover
   */
  focusOnHover?: boolean | undefined
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
   * Whether the item is focused
   */
  focused: boolean
  /**
   * Whether the item is focus visible
   */
  focusVisible: boolean
}

export interface ItemGroupProps {
  id: string
}

export interface ItemGroupLabelProps {
  /**
   * The id of the parent itemGroup. Used to wire `aria-labelledby`.
   */
  htmlFor: string
}

export interface CellProps {
  /**
   * The index of the cell within the item
   * @default 0
   */
  index?: number | undefined
}

export interface ItemCheckboxProps<T extends CollectionItem = CollectionItem> {
  /**
   * The collection item
   */
  item: T
}

export interface GridListApi<T extends PropTypes = PropTypes, V extends CollectionItem = CollectionItem> {
  /**
   * Whether the gridlist has no selected items
   */
  empty: boolean
  /**
   * The value of the focused item
   */
  focusedValue: string | null
  /**
   * The focused item
   */
  focusedItem: V | null
  /**
   * The selected items
   */
  selectedItems: V[]
  /**
   * Whether there are selected items
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
   * The item collection
   */
  collection: ListCollection<V> | GridCollection<V>
  /**
   * Whether the gridlist is disabled
   */
  disabled: boolean
  /**
   * Whether the gridlist should render checkboxes (i.e. `selectionMode` is not `none`
   * and `selectionBehavior` is `toggle`).
   */
  showCheckboxes: boolean
  /**
   * Function to select an item by value
   */
  selectValue: (value: string) => void
  /**
   * Function to set the selected items
   */
  setValue: (value: string[]) => void
  /**
   * Function to select all items
   *
   * **Note**: Only valid when `selectionMode` is `multiple`.
   */
  selectAll: VoidFunction
  /**
   * Function to clear the selection.
   * If a value is provided, only that item will be deselected.
   */
  clearValue: (value?: string) => void
  /**
   * Function to set the focused item
   */
  setFocusedValue: (value: string | null) => void
  /**
   * Returns the state of an item
   */
  getItemState: (props: ItemProps) => ItemState

  getRootProps: () => T["element"]
  getLabelProps: () => T["label"]
  getContentProps: () => T["element"]
  getItemGroupProps: (props: ItemGroupProps) => T["element"]
  getItemGroupLabelProps: (props: ItemGroupLabelProps) => T["element"]
  getItemProps: (props: ItemProps) => T["element"]
  getCellProps: (props?: CellProps) => T["element"]
  getItemCheckboxProps: (props: ItemCheckboxProps) => T["button"]
  getItemTextProps: (props: ItemProps) => T["element"]
  getItemIndicatorProps: (props: ItemProps) => T["svg"]
  getEmptyProps: () => T["element"]
}
