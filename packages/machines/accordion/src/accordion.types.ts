import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

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
  content(value: string): string
  trigger(value: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether multple accordion items can be open at the same time.
   * @default false
   */
  multiple?: boolean
  /**
   * Whether an accordion item can be collapsed after it has been opened.
   * @default false
   */
  collapsible?: boolean
  /**
   * The `id` of the accordion item that is currently being opened.
   */
  value: string[]
  /**
   * Whether the accordion items are disabled
   */
  disabled?: boolean
  /**
   * The callback fired when the state of opened/closed accordion items changes.
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * The callback fired when the focused accordion item changes.
   */
  onFocusChange?: (details: FocusChangeDetails) => void
  /**
   *  The orientation of the accordion items.
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

type PrivateContext = Context<{
  /**
   * @internal
   * The `id` of the focused accordion item.
   */
  focusedValue: string | null
}>

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  value: string
  disabled?: boolean
}

export interface ItemState {
  isOpen: boolean
  isFocused: boolean
  isDisabled: boolean
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
  getItemState: (props: ItemProps) => ItemState
  rootProps: T["element"]
  getItemProps(props: ItemProps): T["element"]
  getItemContentProps(props: ItemProps): T["element"]
  getItemTriggerProps(props: ItemProps): T["button"]
  getItemIndicatorProps(props: ItemProps): T["element"]
}
