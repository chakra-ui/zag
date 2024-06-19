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
}>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the tree elements. Useful for composition.
   */
  ids?: ElementIds
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
  onExpandedChange?: (details: ExpandedChangeDetails) => void
  /**
   * Called when the selection changes
   */
  onSelectionChange?: (details: SelectionChangeDetails) => void
  /**
   * Called when the focused node changes
   */
  onFocusChange?: (details: FocusChangeDetails) => void
  /**
   * Whether clicking on a branch should open it or not
   * @default true
   */
  expandOnClick?: boolean
  /**
   * Whether the tree supports typeahead search
   * @default true
   */
  typeahead?: boolean
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

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The depth of the item or branch
   */
  depth: number
  /**
   * The id of the item or branch
   */
  value: string
  /**
   * Whether the item or branch is disabled
   */
  disabled?: boolean
}

export interface BranchProps extends ItemProps {}

export interface ItemState {
  /**
   * The value of the tree item
   */
  value: string
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
}

export interface BranchState extends ItemState {
  /**
   * Whether the tree branch is expanded
   */
  expanded: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The id of the expanded nodes
   */
  expandedValue: string[]
  /**
   * The id of the selected nodes
   */
  selectedValue: string[]
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
   * Function to focus a branch node
   */
  focusBranch(value: string): void
  /**
   * Function to focus an item node
   */
  focusItem(value: string): void

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getTreeProps(): T["element"]
  getItemState(props: ItemProps): ItemState
  getItemProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getBranchState(props: BranchProps): BranchState
  getBranchProps(props: BranchProps): T["element"]
  getBranchIndicatorProps(props: BranchProps): T["element"]
  getBranchTriggerProps(props: BranchProps): T["element"]
  getBranchControlProps(props: BranchProps): T["element"]
  getBranchContentProps(props: BranchProps): T["element"]
  getBranchTextProps(props: BranchProps): T["element"]
}
