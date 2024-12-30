import type { TreeCollection, TreeNode } from "@zag-js/collection"
import type { Machine, StateMachine as S } from "@zag-js/core"
import type { InteractOutsideHandlers } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { Placement, PositioningOptions } from "@zag-js/popper"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface HighlightChangeDetails {
  indexPath: number[]
  value: string
}

export interface ValueChangeDetails {
  indexPaths: number[][]
  value: string[]
}

export interface OpenChangeDetails {
  open: boolean
}

export type ElementIds = Partial<{
  root: string
  label: string
  control: string
  trigger: string
  clearTrigger: string
  positioner: string
  content: string
  list(value: string): string
  item(value: string): string
}>

interface PublicContext<V = any> extends DirectionProperty, CommonProperties, InteractOutsideHandlers {
  /**
   * The tree collection data
   */
  collection: TreeCollection<V>
  /**
   * The ids of the tree elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The `name` attribute of the underlying input.
   */
  name?: string | undefined
  /**
   * The associate form of the underlying input.
   */
  form?: string | undefined
  /**
   * The positioning options of the menu.
   */
  positioning: PositioningOptions
  /**
   * Whether the cascader is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the cascader is invalid
   */
  invalid?: boolean | undefined
  /**
   * Whether the cascader is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Whether the cascader is required
   */
  required?: boolean | undefined
  /**
   * Whether the cascader should close after an item is selected
   * @default true
   */
  closeOnSelect?: boolean | undefined
  /**
   * The callback fired when the highlighted item changes.
   */
  onHighlightChange?: ((details: HighlightChangeDetails) => void) | undefined
  /**
   * The callback fired when the selected item changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function called when the popup is opened
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
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
   * The trigger to expand the menu
   * @default "hover"
   */
  expandTrigger: "click" | "hover"
  /**
   * Whether the cascader menu is open
   */
  open?: boolean | undefined
  /**
   * Whether the cascader's open state is controlled by the user
   */
  "open.controlled"?: boolean | undefined
  /**
   * The highlighted item
   */
  highlightedValue: string | null
  /**
   * The selected items
   */
  value: string[]
}

interface PrivateContext<V> {
  /**
   * @internal
   * The current placement of the menu
   */
  currentPlacement?: Placement | undefined
  /**
   * @internal
   * Whether the fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * The index path of the highlighted item
   */
  highlightedIndexPath: number[]
  /**
   * The highlighted item
   */
  highlightedItem: V | null
  /**
   * The index path of the highlighted item
   */
  valueIndexPaths: number[][]
  /**
   * @computed
   * The selected items
   */
  selectedItems: V[]
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether there's a selected option
   */
  hasSelectedItems: boolean
  /**
   * @computed
   * Whether the cascader is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether the cascader is disabled
   */
  isDisabled: boolean
}>

export type UserDefinedContext<V> = RequiredBy<PublicContext<V>, "id" | "collection">

export interface MachineContext<V = TreeNode> extends PublicContext<V>, PrivateContext<V>, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "open"
  tags: "open" | "closed"
}

export type State<V> = S.State<MachineContext<V>, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface NodeProps {
  /**
   * The tree node
   */
  node: TreeNode
  /**
   * The index path of the tree node
   */
  indexPath: number[]
  /**
   * Whether the cascader should be closed when the option is selected.
   */
  closeOnSelect?: boolean | undefined
}

export interface NodeState {
  /**
   * The value of the tree item
   */
  value: string
  /**
   * The value path of the tree item
   */
  valuePath: string[]
  /**
   * Whether the tree item is disabled
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
  /**
   * The depth of the tree item
   */
  depth: number
  /**
   * Whether the tree item is a branch
   */
  isBranch: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes, V = TreeNode> {
  /**
   * The tree collection data
   */
  collection: TreeCollection<V>
  /**
   * The index path of the highlighted item
   */
  highlightedIndexPath: number[]
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
   * Whether the cascader is open
   */
  open: boolean
  /**
   * Whether the cascader is focused
   */
  focused: boolean
  /**
   * Whether the cascader value is empty
   */
  empty: boolean
  /**
   * Function to select a value
   */
  selectValue(value: string): void
  /**
   * Function to select all values
   */
  selectAll(): void
  /**
   * Function to set the value of the cascader
   */
  setValue(value: string[]): void
  /**
   * Function to clear the value of the cascader.
   * If a value is provided, it will only clear that value, otherwise, it will clear all values.
   */
  clearValue(value?: string): void
  /**
   * Function to focus on the cascader trigger
   */
  focus(): void
  /**
   * Function to open or close the cascader
   */
  setOpen(open: boolean): void
  /**
   * Function to set the positioning options of the cascader
   */
  reposition(options?: Partial<PositioningOptions>): void
  /**
   * Whether the cascader allows multiple selections
   */
  multiple: boolean
  /**
   * Whether the cascader is disabled
   */
  disabled: boolean

  getNodeState(props: NodeProps): NodeState
  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getControlProps(): T["element"]
  getTriggerProps(): T["button"]
  getClearTriggerProps(): T["button"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getListProps(props: NodeProps): T["element"]
  getItemProps(props: NodeProps): T["element"]
  getItemTextProps(props: NodeProps): T["element"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { TreeNode, PositioningOptions }
