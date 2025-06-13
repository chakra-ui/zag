import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { TreeCollection, TreeNode } from "@zag-js/collection"
import type { IndexPath } from "@zag-js/collection/src/tree-visit"
import type { Point } from "@zag-js/rect-utils"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails<T = TreeNode> {
  value: string[][]
  items: T[][]
}

export interface HighlightChangeDetails<T = TreeNode> {
  value: string[]
  items: T[]
}

export interface OpenChangeDetails {
  open: boolean
}

export interface ScrollToIndexDetails {
  index: number
  immediate?: boolean | undefined
  depth: number
}

export type { TreeNode }

export type ElementIds = Partial<{
  root: string
  label: string
  control: string
  trigger: string
  indicator: string
  clearTrigger: string
  positioner: string
  content: string
  hiddenInput: string
  list(value: number): string
  item(value: string): string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface CascadeSelectProps<T = any> extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The tree collection data
   */
  collection?: TreeCollection<T> | undefined
  /**
   * The ids of the cascade-select elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The name attribute of the underlying input element
   */
  name?: string | undefined
  /**
   * The form attribute of the underlying input element
   */
  form?: string | undefined
  /**
   * The controlled value of the cascade-select
   */
  value?: string[][] | undefined
  /**
   * The initial value of the cascade-select when rendered.
   * Use when you don't need to control the value.
   */
  defaultValue?: string[][] | undefined
  /**
   * The controlled highlighted value of the cascade-select
   */
  highlightedValue?: string[] | undefined
  /**
   * The initial highlighted value of the cascade-select when rendered.
   */
  defaultHighlightedValue?: string[] | undefined
  /**
   * Whether to allow multiple selections
   * @default false
   */
  multiple?: boolean | undefined
  /**
   * The controlled open state of the cascade-select
   */
  open?: boolean | undefined
  /**
   * The initial open state of the cascade-select when rendered.
   * Use when you don't need to control the open state.
   */
  defaultOpen?: boolean | undefined
  /**
   * What triggers highlighting of items
   * @default "click"
   */
  highlightTrigger?: "click" | "hover" | undefined
  /**
   * Whether the cascade-select should close when an item is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * Whether the cascade-select should loop focus when navigating with keyboard
   * @default false
   */
  loopFocus?: boolean | undefined
  /**
   * Whether the cascade-select is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the cascade-select is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Whether the cascade-select is required
   */
  required?: boolean | undefined
  /**
   * Whether the cascade-select is invalid
   */
  invalid?: boolean | undefined
  /**
   * The positioning options for the cascade-select content
   */
  positioning?: PositioningOptions | undefined
  /**
   * Function to scroll to a specific index in a list
   */
  scrollToIndexFn?: ((details: ScrollToIndexDetails) => void) | undefined
  /**
   * Function to format the display value
   */
  formatValue?: ((selectedItems: T[][]) => string) | undefined
  /**
   * Called when the value changes
   */
  onValueChange?: ((details: ValueChangeDetails<T>) => void) | undefined
  /**
   * Called when the highlighted value changes
   */
  onHighlightChange?: ((details: HighlightChangeDetails<T>) => void) | undefined
  /**
   * Called when the open state changes
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Whether parent (branch) items can be selectable
   */
  allowParentSelection?: boolean
}

type PropsWithDefault = "collection" | "closeOnSelect" | "loopFocus" | "highlightTrigger"

export interface CascadeSelectSchema<T extends TreeNode = TreeNode> {
  state: "idle" | "focused" | "open"
  props: RequiredBy<CascadeSelectProps<T>, PropsWithDefault>
  context: {
    value: string[][]
    highlightedValue: string[]
    currentPlacement: Placement | undefined
    fieldsetDisabled: boolean
    graceArea: Point[] | null
    valueIndexPath: IndexPath[]
    highlightedIndexPath: IndexPath
    highlightedItem: T[] | null
    selectedItems: T[][]
  }
  computed: {
    isInteractive: boolean
    valueAsString: string
  }
  action: string
  effect: string
  guard: string
  event: EventObject
}

export type CascadeSelectService<T extends TreeNode = TreeNode> = Service<CascadeSelectSchema<T>>

export type CascadeSelectMachine<T extends TreeNode = TreeNode> = Machine<CascadeSelectSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps<T = TreeNode> {
  /**
   * The item to render
   */
  item: T
  /**
   * The index path of the item
   */
  indexPath: IndexPath
  /**
   * The value path of the item
   */
  value: string[]
}

export interface ItemState<T = TreeNode> {
  /**
   * The value of the item
   */
  value: string[]
  /**
   * Whether the item is disabled
   */
  disabled: boolean
  /**
   * Whether the item is highlighted (part of the highlighted path)
   */
  highlighted: boolean
  /**
   * Whether the item is selected (part of the current value)
   */
  selected: boolean
  /**
   * Whether the item has children
   */
  hasChildren: boolean
  /**
   * The depth of the item in the tree
   */
  depth: number
  /**
   * The highlighted child of the item
   */
  highlightedChild: T | undefined
  /**
   * The index of the highlighted child
   */
  highlightedIndex: number
}

export interface CascadeSelectApi<T extends PropTypes = PropTypes, V = TreeNode> {
  /**
   * The tree collection data
   */
  collection: TreeCollection<V>
  /**
   * Whether the cascade-select is open
   */
  open: boolean
  /**
   * Whether the cascade-select is focused
   */
  focused: boolean
  /**
   * Whether the cascade-select allows multiple selections
   */
  multiple: boolean
  /**
   * Whether the cascade-select is disabled
   */
  disabled: boolean
  /**
   * The value of the highlighted item
   */
  highlightedValue: string[]
  /**
   * The highlighted item
   */
  highlightedItem: V[] | null
  /**
   * The selected items
   */
  selectedItems: V[][]
  /**
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
  /**
   * The current value of the cascade-select
   */
  value: string[][]
  /**
   * The current value as text
   */
  valueAsString: string
  /**
   * Function to focus on the select input
   */
  focus(): void
  /**
   * Function to focus on the select input
   */
  focus(): void
  /**
   * Function to set the positioning options of the cascade-select
   */
  reposition(options?: Partial<PositioningOptions>): void
  /**
   * Function to open the cascade-select
   */
  setOpen(open: boolean): void
  /**
   * Function to highlight a value
   */
  highlightValue(value: string): void
  /**
   * Function to select a value
   */
  selectValue(value: string[]): void
  /**
   * Function to set the value
   */
  setValue(value: string[][]): void
  /**
   * Function to clear the value
   */
  clearValue(value?: string[]): void
  /**
   * Returns the state of a cascade-select item
   */
  getItemState(props: ItemProps<V>): ItemState<V>

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getControlProps(): T["element"]
  getTriggerProps(): T["element"]
  getIndicatorProps(): T["element"]
  getClearTriggerProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getListProps(props: ItemProps<V>): T["element"]
  getItemProps(props: ItemProps<V>): T["element"]
  getItemTextProps(props: ItemProps<V>): T["element"]
  getItemIndicatorProps(props: ItemProps<V>): T["element"]
  getHiddenInputProps(): T["input"]
}

export type { IndexPath }
