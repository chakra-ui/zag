import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[]
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  item(value: string): string
}>

export interface ToggleGroupProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the toggle. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the toggle is disabled.
   */
  disabled?: boolean | undefined
  /**
   * The controlled selected value of the toggle group.
   */
  value?: string[] | undefined
  /**
   * The initial selected value of the toggle group when rendered.
   * Use when you don't need to control the selected value of the toggle group.
   */
  defaultValue?: string[] | undefined
  /**
   * Function to call when the toggle is clicked.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Whether to loop focus inside the toggle group.
   * @default true
   */
  loopFocus?: boolean | undefined
  /**
   * Whether to use roving tab index to manage focus.
   * @default true
   */
  rovingFocus?: boolean | undefined
  /**
   * The orientation of the toggle group.
   * @default "horizontal"
   */
  orientation?: Orientation | undefined
  /**
   * Whether to allow multiple toggles to be selected.
   */
  multiple?: boolean | undefined
  /**
   * Whether the toggle group allows empty selection.
   * **Note:** This is ignored if `multiple` is `true`.
   *
   * @default true
   */
  deselectable?: boolean | undefined
}

type PropsWithDefault = "loopFocus" | "rovingFocus" | "orientation"

type ComputedContext = Readonly<{
  currentLoopFocus: boolean
}>

interface PrivateContext {
  /**
   * Whether the user is tabbing backward.
   */
  isTabbingBackward: boolean
  /**
   * Whether the toggle was focused by a click.
   */
  isClickFocus: boolean
  /**
   * The value of the toggle that was focused.
   */
  focusedId: string | null
  /**
   * Whether the toggle group is within a toolbar.
   * This is used to determine whether to use roving tab index.
   */
  isWithinToolbar: boolean
  /**
   * The value of the toggle group.
   */
  value: string[]
}

export interface ToggleGroupSchema {
  props: RequiredBy<ToggleGroupProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  state: "idle" | "focused"
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type ToggleGroupService = Service<ToggleGroupSchema>

export type ToggleGroupMachine = Machine<ToggleGroupSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  value: string
  disabled?: boolean | undefined
}

export interface ItemState {
  /**
   * The underlying id of the item.
   */
  id: string
  /**
   * Whether the toggle item is disabled.
   */
  disabled: boolean
  /**
   * Whether the toggle item is pressed.
   */
  pressed: boolean
  /**
   * Whether the toggle item is focused.
   */
  focused: boolean
}

export interface ToggleGroupApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the toggle group.
   */
  value: string[]
  /**
   * Function to set the value of the toggle group.
   */
  setValue: (values: string[]) => void
  /**
   * Returns the state of the toggle item.
   */
  getItemState(props: ItemProps): ItemState
  getRootProps(): T["element"]
  getItemProps(props: ItemProps): T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
