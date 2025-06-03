import type { TreeCollection, TreeNode } from "@zag-js/collection"
import type { Machine, Service } from "@zag-js/core"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[][]
  valueText: string
}

export interface HighlightChangeDetails {
  highlightedPath: string[] | null
}

export interface OpenChangeDetails {
  open: boolean
}

export type { TreeNode }

export type ElementIds = Partial<{
  root: string
  label: string
  control: string
  trigger: string
  indicator: string
  valueText: string
  clearTrigger: string
  positioner: string
  content: string
  level(level: number): string
  levelContent(level: number): string
  item(value: string): string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface CascaderProps<T = any> extends DirectionProperty, CommonProperties {
  /**
   * The tree collection data
   */
  collection?: TreeCollection<T> | undefined
  /**
   * The ids of the cascader elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the cascader
   */
  value?: string[][] | undefined
  /**
   * The initial value of the cascader when rendered.
   * Use when you don't need to control the value.
   */
  defaultValue?: string[][] | undefined
  /**
   * Whether to allow multiple selections
   * @default false
   */
  multiple?: boolean | undefined
  /**
   * The controlled open state of the cascader
   */
  open?: boolean | undefined
  /**
   * The initial open state of the cascader when rendered.
   * Use when you don't need to control the open state.
   */
  defaultOpen?: boolean | undefined
  /**
   * The controlled highlighted value of the cascader
   */
  highlightedPath?: string[] | null | undefined
  /**
   * The placeholder text for the cascader
   */
  placeholder?: string | undefined
  /**
   * Whether the cascader should close when an item is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * Whether the cascader should loop focus when navigating with keyboard
   * @default false
   */
  loop?: boolean | undefined
  /**
   * Whether the cascader is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the cascader is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Whether the cascader is required
   */
  required?: boolean | undefined
  /**
   * Whether the cascader is invalid
   */
  invalid?: boolean | undefined
  /**
   * The positioning options for the cascader content
   */
  positioning?: PositioningOptions | undefined
  /**
   * Function to format the display value
   */
  formatValue?: ((value: string[][]) => string) | undefined
  /**
   * Called when the value changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Called when the highlighted value changes
   */
  onHighlightChange?: ((details: HighlightChangeDetails) => void) | undefined
  /**
   * Called when the open state changes
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * Function to determine if a node should be selectable
   */
  isItemDisabled?: ((value: string) => boolean) | undefined
  /**
   * How highlighting is triggered
   * - "hover": Items are highlighted on hover (default)
   * - "click": Items are highlighted only on click
   */
  highlightTrigger?: "hover" | "click"
  /**
   * Whether parent (branch) items can be selected
   * When true, highlightTrigger is forced to "click"
   */
  allowParentSelection?: boolean
}

type PropsWithDefault = "collection" | "closeOnSelect" | "loop" | "defaultValue" | "defaultOpen" | "multiple"

export interface CascaderSchema<T extends TreeNode = TreeNode> {
  state: "idle" | "focused" | "open"
  props: RequiredBy<CascaderProps<T>, PropsWithDefault>
  context: {
    value: string[][]
    highlightedPath: string[] | null
    currentPlacement: Placement | undefined
    fieldsetDisabled: boolean
    levelValues: string[][]
    clearFocusTimer: (() => void) | null
  }
  computed: {
    hasValue: boolean
    isDisabled: boolean
    isInteractive: boolean
    selectedItems: T[]
    highlightedItem: T | null
    levelDepth: number
    valueText: string
  }
  action: string
  effect: string
  guard: string
}

export type CascaderService<T extends TreeNode = TreeNode> = Service<CascaderSchema<T>>

export type CascaderMachine<T extends TreeNode = TreeNode> = Machine<CascaderSchema<T>>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The value of the item
   */
  value: string
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
}

export interface LevelProps {
  /**
   * The level index
   */
  level: number
}

export interface CascaderApi<T extends PropTypes = PropTypes, V = TreeNode> {
  /**
   * The tree collection data
   */
  collection: TreeCollection<V>
  /**
   * The current value of the cascader
   */
  value: string[][]
  /**
   * Function to set the value
   */
  setValue(value: string[][]): void
  /**
   * The current value as text
   */
  valueText: string
  /**
   * The current highlighted value
   */
  highlightedPath: string[] | null
  /**
   * Whether the cascader is open
   */
  open: boolean
  /**
   * Whether the cascader is focused
   */
  focused: boolean
  /**
   * Function to open the cascader
   */
  setOpen(open: boolean): void
  /**
   * Function to highlight an item
   */
  highlight(path: string[] | null): void
  /**
   * Function to select an item
   */
  selectItem(value: string): void
  /**
   * Function to clear the value
   */
  clearValue(): void
  /**
   * Function to get the level values for rendering levels
   */
  getLevelValues(level: number): string[]
  /**
   * Function to get the current level count
   */
  getLevelDepth(): number
  /**
   * Function to get the parent value at a specific level
   */
  getParentValue(level: number): string | null

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getControlProps(): T["element"]
  getTriggerProps(): T["element"]
  getIndicatorProps(): T["element"]
  getValueTextProps(): T["element"]
  getClearTriggerProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getLevelProps(props: LevelProps): T["element"]
  getLevelContentProps(props: LevelProps): T["element"]
  getItemState(props: ItemProps): ItemState
  getItemProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
}
