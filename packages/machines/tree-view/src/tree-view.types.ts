import type { StateMachine as S } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface FocusChangeDetails {
  focusedId: string
}

export interface ExpandedChangeDetails extends FocusChangeDetails {
  expandedIds: Set<string>
}

export interface SelectionChangeDetails extends FocusChangeDetails {
  selectedIds: Set<string>
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The id of the expanded nodes
   */
  expandedIds: Set<string>
  /**
   * The id of the selected nodes
   */
  selectedIds: Set<string>
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

type PrivateContext = Context<{
  /**
   * @internal
   * The typeahead state for faster keyboard navigation
   */
  typeahead: TypeaheadState
}>

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
  depth: number
  id: string
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
  expandedIds: Set<string>
  selectedIds: Set<string>
  expand(ids: Set<string>): void
  expandAll(): void
  collapse(ids: Set<string>): void
  collapseAll(): void
  select(ids: Set<string>): void
  selectAll(): void
  deselect(ids: Set<string>): void
  deselectAll(): void
  focusBranch(id: string): void
  focusItem(id: string): void

  rootProps: T["element"]
  labelProps: T["element"]
  treeProps: T["element"]
  getItemState(props: ItemProps): ItemState
  getItemProps(props: ItemProps): T["element"]
  getBranchState(props: BranchProps): BranchState
  getBranchProps(props: BranchProps): T["element"]
  getBranchTriggerProps(props: BranchProps): T["element"]
  getBranchControlProps(props: BranchProps): T["element"]
  getBranchContentProps(props: BranchProps): T["element"]
  getBranchTextProps(props: BranchProps): T["element"]
}
