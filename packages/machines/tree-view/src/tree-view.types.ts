import type { StateMachine as S } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface FocusChangeDetails {
  focusedId: string | null
}

export interface ExpandedChangeDetails extends FocusChangeDetails {
  expandedIds: string[]
}

export interface SelectionChangeDetails extends FocusChangeDetails {
  selectedIds: string[]
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The id of the expanded nodes
   */
  expandedIds: string[]
  /**
   * The id of the selected nodes
   */
  selectedIds: string[]
  /**
   * The id of the focused node
   */
  focusedId: string | null
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
  openOnClick?: boolean
}

interface PrivateContext {
  /**
   * @internal
   * The typeahead state for faster keyboard navigation
   */
  typeahead: TypeaheadState
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
  id: string
  /**
   * Whether the item or branch is disabled
   */
  disabled?: boolean
}

export interface BranchProps extends ItemProps {}

export interface ItemState {
  id: string
  isDisabled: boolean
  isSelected: boolean
  isFocused: boolean
}

export interface BranchState extends ItemState {
  isExpanded: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The id of the expanded nodes
   */
  expandedIds: string[]
  /**
   * The id of the selected nodes
   */
  selectedIds: string[]
  /**
   * Function to expand nodes
   */
  expand(ids: string[]): void
  /**
   * Function to expand all nodes
   */
  expandAll(): void
  /**
   * Function to collapse nodes
   */
  collapse(ids: string[]): void
  /**
   * Function to collapse all nodes
   */
  collapseAll(): void
  /**
   * Function to select nodes
   */
  select(ids: string[]): void
  /**
   * Function to select all nodes
   */
  selectAll(): void
  /**
   * Function to deselect nodes
   */
  deselect(ids: string[]): void
  /**
   * Function to deselect all nodes
   */
  deselectAll(): void
  /**
   * Function to focus a branch node
   */
  focusBranch(id: string): void
  /**
   * Function to focus an item node
   */
  focusItem(id: string): void

  rootProps: T["element"]
  labelProps: T["element"]
  treeProps: T["element"]
  getItemState(props: ItemProps): ItemState
  getItemProps(props: ItemProps): T["element"]
  getItemIndicatorProps(props: ItemProps): T["element"]
  getItemTextProps(props: ItemProps): T["element"]
  getBranchState(props: BranchProps): BranchState
  getBranchProps(props: BranchProps): T["element"]
  getBranchTriggerProps(props: BranchProps): T["element"]
  getBranchControlProps(props: BranchProps): T["element"]
  getBranchContentProps(props: BranchProps): T["element"]
  getBranchTextProps(props: BranchProps): T["element"]
}
