import type { StateMachine as S } from "@zag-js/core"
import type { TypeaheadState } from "@zag-js/dom-query"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

export interface OpenChangeDetails {
  ids: Set<string>
}

export interface SelectionChangeDetails {
  ids: Set<string>
}

export interface FocusChangeDetails {
  focusedId: string
}

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The id of the expanded nodes
   */
  expandedIds: Set<string>
  /**
   * The id of the nodes that are selected
   */
  selectedIds: Set<string>
  /**
   * The id of the nodes that are focused
   */
  focusedId: string | null
  /**
   * Whether the tree supports multiple selection
   */
  selectionMode?: "single" | "multiple"
  /**
   * Called when the tree is opened or closed
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * Called when the selection changes
   */
  onSelectionChange?: (details: SelectionChangeDetails) => void
  /**
   * Called when the focused node changes
   */
  onFocusChange?: (details: FocusChangeDetails) => void
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
