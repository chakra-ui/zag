import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: number
}

export interface HoverChangeDetails {
  hoveredValue: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface IntlTranslations {
  ratingValueText(index: number): string
}

export type ElementIds = Partial<{
  root: string
  label: string
  hiddenInput: string
  control: string
  item(id: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the rating. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations: IntlTranslations
  /**
   * The total number of ratings.
   * @default 5
   */
  count: number
  /**
   * The name attribute of the rating element (used in forms).
   */
  name?: string
  /**
   * The associate form of the underlying input element.
   */
  form?: string
  /**
   * The current rating value.
   */
  value: number
  /**
   * Whether the rating is readonly.
   */
  readOnly?: boolean
  /**
   * Whether the rating is disabled.
   */
  disabled?: boolean
  /**
   * Whether the rating is required.
   */
  required?: boolean
  /**
   * Whether to allow half stars.
   */
  allowHalf?: boolean
  /**
   * Whether to autofocus the rating.
   */
  autoFocus?: boolean
  /**
   * Function to be called when the rating value changes.
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * Function to be called when the rating value is hovered.
   */
  onHoverChange?: (details: HoverChangeDetails) => void
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the rating is interactive
   */
  isInteractive: boolean
  /**
   * @computed
   * Whether the pointer is hovering over the rating
   */
  isHovering: boolean
  /**
   * @computed
   * Whether the rating is disabled
   */
  isDisabled: boolean
}>

interface PrivateContext {
  /**
   * @internal The value of the hovered rating.
   */
  hoveredValue: number
  /**
   * @internal Whether the fieldset is disabled.
   */
  fieldsetDisabled: boolean
}

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "idle" | "hover" | "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  index: number
}

export interface ItemState {
  /**
   * Whether the rating item is highlighted.
   */
  highlighted: boolean
  /**
   * Whether the rating item is partially highlighted.
   */
  half: boolean
  /**
   * Whether the rating item is checked.
   */
  checked: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Sets the value of the rating group
   */
  setValue(value: number): void
  /**
   * Clears the value of the rating group
   */
  clearValue(): void
  /**
   * Whether the rating group is being hovered
   */
  hovering: boolean
  /**
   * The current value of the rating group
   */
  value: number
  /**
   * The value of the currently hovered rating
   */
  hoveredValue: number
  /**
   * The total number of ratings
   */
  count: number
  /**
   * The array of rating values. Returns an array of numbers from 1 to the max value.
   */
  items: number[]
  /**
   * Returns the state of a rating item
   */
  getItemState(props: ItemProps): ItemState

  getRootProps(): T["element"]
  getHiddenInputProps(): T["input"]
  getLabelProps(): T["element"]
  getControlProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
}
