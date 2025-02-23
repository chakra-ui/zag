import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export interface ValueChangeDetails {
  value: string | null
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  label: string
  indicator: string
  item(value: string): string
  itemLabel(value: string): string
  itemControl(value: string): string
  itemHiddenInput(value: string): string
}>

export interface RadioGroupProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the radio. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The controlled value of the radio group
   */
  value?: string | null | undefined
  /**
   * The initial value of the checked radio when rendered.
   * Use when you don't need to control the value of the radio group.
   */
  defaultValue?: string | null | undefined
  /**
   * The name of the input fields in the radio
   * (Useful for form submission).
   */
  name?: string | undefined
  /**
   * The associate form of the underlying input.
   */
  form?: string | undefined
  /**
   * If `true`, the radio group will be disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the checkbox is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Function called once a radio is checked
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Orientation of the radio group
   */
  orientation?: "horizontal" | "vertical" | undefined
}

export interface IndicatorRect {
  left: string
  top: string
  width: string
  height: string
}

interface PrivateContext {
  /**
   * The value of the checked radio
   */
  value: string | null
  /**
   * The id of the active radio
   */
  activeValue: string | null
  /**
   * The id of the focused radio
   */
  focusedValue: string | null
  /**
   * The id of the hovered radio
   */
  hoveredValue: string | null
  /**
   * The active tab indicator's dom rect
   */
  indicatorRect: Partial<IndicatorRect>
  /**
   * Whether the active tab indicator's rect can transition
   */
  canIndicatorTransition: boolean
  /**
   * Whether the radio group's fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * Whether the radio group is in focus
   */
  focusVisible: boolean
  /**
   * Whether the radio group is in server-side rendering
   */
  ssr: boolean
}

type PropsWithDefault = "orientation"

type ComputedContext = Readonly<{
  /**
   * Whether the radio group is disabled
   */
  isDisabled: boolean
}>

interface Refs {
  /**
   * Function to clean up the observer for the active tab's rect
   */
  indicatorCleanup: VoidFunction | null
}

export interface RadioGroupSchema {
  state: "idle"
  props: RequiredBy<RadioGroupProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  refs: Refs
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type RadioGroupService = Service<RadioGroupSchema>

export type RadioGroupMachine = Machine<RadioGroupSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  value: string
  disabled?: boolean | undefined
  invalid?: boolean | undefined
}

export interface ItemState {
  /**
   * Whether the radio is invalid
   */
  invalid: boolean
  /**
   * Whether the radio is disabled
   */
  disabled: boolean
  /**
   * Whether the radio is checked
   */
  checked: boolean
  /**
   *  Whether the radio is focused
   */
  focused: boolean
  /**
   * Whether the radio is hovered
   */
  hovered: boolean
  /**
   * Whether the radio is active or pressed
   */
  active: boolean
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface RadioGroupApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the radio group
   */
  value: string | null
  /**
   * Function to set the value of the radio group
   */
  setValue(value: string): void
  /**
   * Function to clear the value of the radio group
   */
  clearValue(): void
  /**
   * Function to focus the radio group
   */
  focus(): void
  /**
   * Returns the state details of a radio input
   */
  getItemState(props: ItemProps): ItemState

  getRootProps(): T["element"]
  getLabelProps(): T["element"]
  getItemProps(props: ItemProps): T["label"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemControlProps(props: ItemProps): T["element"]
  getItemHiddenInputProps(props: ItemProps): T["input"]
  getIndicatorProps(): T["element"]
}
