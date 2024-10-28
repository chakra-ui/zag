import type { TreeCollection, TreeNode } from "@zag-js/collection"
import type { Machine, StateMachine as S } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface FocusChangeDetails {
  focusedValue: string | null
}

export interface ExpandedChangeDetails extends FocusChangeDetails {
  expandedValue: string[]
}

export interface SelectionChangeDetails extends FocusChangeDetails {
  selectedValue: string[]
}

export type ElementIds = Partial<{
  root: string
  tree: string
  label: string
  node(value: string): string
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext<T = any> extends DirectionProperty, CommonProperties {
  /**
   * The tree collection data
   */
  collection: TreeCollection<T>
  /**
   * The ids of the tree elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The id of the expanded nodes
   */
  expandedValue: string[]
  /**
   * The id of the selected nodes
   */
  selectedValue: string[]
  /**
   * The id of the focused node
   */
  focusedValue: string | null
  /**
   * Whether the tree supports multiple selection
   * - "single": only one node can be selected
   * - "multiple": multiple nodes can be selected
   *
   * @default "single"
   */
  selectionMode: "single" | "multiple"
  /**
   * Called when the tree is opened or closed
   */
  onExpandedChange?: ((details: ExpandedChangeDetails) => void) | undefined
  /**
   * Called when the selection changes
   */
  onSelectionChange?: ((details: SelectionChangeDetails) => void) | undefined
  /**
   * Called when the focused node changes
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   * Whether clicking on a branch should open it or not
   * @default true
   */
  expandOnClick?: boolean | undefined
  /**
   * Whether the tree supports typeahead search
   * @default true
   */
  typeahead?: boolean | undefined
}

interface PrivateContext {
  /**
   * @internal
   * The typeahead state for faster keyboard navigation
   */
  typeaheadState: TypeaheadState
}

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether a typeahead search is ongoing
   */
  isTypingAhead: boolean
  /**
   * @computed
   * Whether the tree supports multiple selection
   */
  isMultipleSelection: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id" | "collection">

export interface MachineContext<T = any> extends PublicContext<T>, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

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
   * Whether the tree item is selected
   */
  selected: boolean
  /**
   * Whether the tree item is focused
   */
  focused: boolean
  /**
   * The depth of the tree item
   */
  depth: number
  /**
   * Whether the tree branch is expanded
   */
  expanded: boolean
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
   * The id of the expanded nodes
   */
  expandedValue: string[]
  /**
   * Function to set the expanded value
   */
  setExpandedValue(value: string[]): void
  /**
   * The id of the selected nodes
   */
  selectedValue: string[]
  /**
   * Function to set the selected value
   */
  setSelectedValue(value: string[]): void
  /**
   * Function to get the visible nodes
   */
  getVisibleNodes(): V[]
  /**
   * Function to expand nodes.
   * If no value is provided, all nodes will be expanded
   */
  expand(value?: string[]): void
  /**
   * Function to collapse nodes
   * If no value is provided, all nodes will be collapsed
   */
  collapse(value?: string[]): void
  /**
   * Function to select nodes
   * If no value is provided, all nodes will be selected
   */
  select(value?: string[]): void
  /**
   * Function to deselect nodes
   * If no value is provided, all nodes will be deselected
   */
  deselect(value?: string[]): void
  /**
   * Function to focus an item node
   */
  focus(value: string): void
  /**
   * Function to select the parent node of the focused node
   */
  selectParent(value: string): void
  /**
   * Function to expand the parent node of the focused node
   */
  expandParent(value: string): void

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getTreeProps(): T["element"]
  getNodeState(props: NodeProps): NodeState
  getItemProps(props: NodeProps): T["element"]
  getItemIndicatorProps(props: NodeProps): T["element"]
  getItemTextProps(props: NodeProps): T["element"]
  getBranchProps(props: NodeProps): T["element"]
  getBranchIndicatorProps(props: NodeProps): T["element"]
  getBranchTriggerProps(props: NodeProps): T["element"]
  getBranchControlProps(props: NodeProps): T["element"]
  getBranchContentProps(props: NodeProps): T["element"]
  getBranchTextProps(props: NodeProps): T["element"]
  getBranchIndentGuideProps(props: NodeProps): T["element"]
}

export type { TreeNode } from "@zag-js/collection"
