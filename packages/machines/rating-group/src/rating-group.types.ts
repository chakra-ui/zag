import type { EventObject, Service } from "@zag-js/core"
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

export interface RatingGroupProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the rating. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
  /**
   * The total number of ratings.
   * @default 5
   */
  count?: number | undefined
  /**
   * The name attribute of the rating element (used in forms).
   */
  name?: string | undefined
  /**
   * The associate form of the underlying input element.
   */
  form?: string | undefined
  /**
   * The rating value.
   */
  value?: number | undefined
  /**
   * The default value of the rating
   */
  defaultValue?: number | undefined
  /**
   * Whether the rating is readonly.
   */
  readOnly?: boolean | undefined
  /**
   * Whether the rating is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the rating is required.
   */
  required?: boolean | undefined
  /**
   * Whether to allow half stars.
   */
  allowHalf?: boolean | undefined
  /**
   * Whether to autofocus the rating.
   */
  autoFocus?: boolean | undefined
  /**
   * Function to be called when the rating value changes.
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function to be called when the rating value is hovered.
   */
  onHoverChange?: ((details: HoverChangeDetails) => void) | undefined
}

type PropsWithDefault = "count" | "translations"

type ComputedContext = Readonly<{
  /**
   * Whether the rating is interactive
   */
  isInteractive: boolean
  /**
   * Whether the pointer is hovering over the rating
   */
  isHovering: boolean
  /**
   * Whether the rating is disabled
   */
  isDisabled: boolean
}>

interface PrivateContext {
  /**
   * The value of the hovered rating.
   */
  hoveredValue: number
  /**
   * Whether the fieldset is disabled.
   */
  fieldsetDisabled: boolean
  /**
   * The value of the rating group.
   */
  value: number
}

export interface RatingGroupSchema {
  state: "idle" | "hover" | "focus"
  context: PrivateContext
  props: RequiredBy<RatingGroupProps, PropsWithDefault>
  computed: ComputedContext
  private: PrivateContext
  action: string
  event: EventObject
  effect: string
  guard: string
}

export type RatingGroupService = Service<RatingGroupSchema>

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

export interface RatingGroupApi<T extends PropTypes = PropTypes> {
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
