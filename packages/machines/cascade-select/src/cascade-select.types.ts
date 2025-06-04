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
  item(value: string): string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface CascadeSelectProps<T = any> extends DirectionProperty, CommonProperties {
  /**
   * The tree collection data
   */
  collection?: TreeCollection<T> | undefined
  /**
   * The ids of the cascade-select elements. Useful for composition.
   */
  ids?: ElementIds | undefined
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
   * The controlled highlighted value of the cascade-select
   */
  highlightedPath?: string[] | null | undefined
  /**
   * The placeholder text for the cascade-select
   */
  placeholder?: string | undefined
  /**
   * Whether the cascade-select should close when an item is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * Whether the cascade-select should loop focus when navigating with keyboard
   * @default false
   */
  loop?: boolean | undefined
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
   * Whether parent (branch) items can be selected
   */
  allowParentSelection?: boolean
}

type PropsWithDefault = "collection" | "closeOnSelect" | "loop" | "defaultValue" | "defaultOpen" | "multiple"

export interface CascadeSelectSchema<T extends TreeNode = TreeNode> {
  state: "idle" | "focused" | "open"
  props: RequiredBy<CascadeSelectProps<T>, PropsWithDefault>
  context: {
    value: string[][]
    highlightedPath: string[] | null
    currentPlacement: Placement | undefined
    fieldsetDisabled: boolean
    levelValues: string[][]
  }
  computed: {
    isDisabled: boolean
    isInteractive: boolean
    levelDepth: number
    valueText: string
  }
  action: string
  effect: string
  guard: string
}

export type CascadeSelectService<T extends TreeNode = TreeNode> = Service<CascadeSelectSchema<T>>

export type CascadeSelectMachine<T extends TreeNode = TreeNode> = Machine<CascadeSelectSchema<T>>

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

export interface CascadeSelectApi<T extends PropTypes = PropTypes, V = TreeNode> {
  /**
   * The tree collection data
   */
  collection: TreeCollection<V>
  /**
   * The current value of the cascade-select
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
   * Whether the cascade-select is open
   */
  open: boolean
  /**
   * Whether the cascade-select is focused
   */
  focused: boolean
  /**
   * Function to open the cascade-select
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
  getItemState(props: ItemProps): ItemState
  getItemProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
}
