import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[]
}

export interface FocusChangeDetails {
  value: string | null
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  item(value: string): string
  itemContent(value: string): string
  itemTrigger(value: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether multple accordion items can be expanded at the same time.
   * @default false
   */
  multiple?: boolean
  /**
   * Whether an accordion item can be closed after it has been expanded.
   * @default false
   */
  collapsible?: boolean
  /**
   * The `value` of the accordion items that are currently being expanded.
   */
  value: string[]
  /**
   * Whether the accordion items are disabled
   */
  disabled?: boolean
  /**
   * The callback fired when the state of expanded/collapsed accordion items changes.
   */
  onValueChange?(details: ValueChangeDetails): void
  /**
   * The callback fired when the focused accordion item changes.
   */
  onFocusChange?(details: FocusChangeDetails): void
  /**
   *  The orientation of the accordion items.
   *  @default "vertical"
   */
  orientation?: "horizontal" | "vertical"
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the accordion items are horizontal.
   */
  isHorizontal: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * The `id` of the focused accordion item.
   */
  focusedValue: string | null
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The value of the accordion item.
   */
  value: string
  /**
   * Whether the accordion item is disabled.
   */
  disabled?: boolean
}

export interface ItemState {
  /**
   * Whether the accordion item is expanded.
   */
  expanded: boolean
  /**
   * Whether the accordion item is focused.
   */
  focused: boolean
  /**
   * Whether the accordion item is disabled.
   */
  disabled: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the focused accordion item.
   */
  focusedValue: string | null
  /**
   * The value of the accordion
   */
  value: string[]
  /**
   * Sets the value of the accordion.
   */
  setValue: (value: string[]) => void
  /**
   * Gets the state of an accordion item.
   */
  getItemState(props: ItemProps): ItemState

  getRootProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemContentProps(props: ItemProps): T["element"]
  getItemTriggerProps(props: ItemProps): T["button"]
  getItemIndicatorProps(props: ItemProps): T["element"]
}
