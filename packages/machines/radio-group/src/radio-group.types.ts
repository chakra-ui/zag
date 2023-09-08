import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  label: string
  indicator: string
  radio(value: string): string
  radioLabel(value: string): string
  radioControl(value: string): string
  radioHiddenInput(value: string): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the radio. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The value of the checked radio
     */
    value: string | null

    /**
     * The name of the input fields in the radio
     * (Useful for form submission).
     */
    name?: string
    /**
     * The associate form of the underlying input.
     */
    form?: string
    /**
     * If `true`, the radio group will be disabled
     */
    disabled?: boolean
    /**
     * Function called once a radio is checked
     * @param value the value of the checked radio
     */
    onChange?(details: { value: string }): void
    /**
     * Orientation of the radio group
     */
    orientation?: "horizontal" | "vertical"
  }

type PrivateContext = Context<{
  /**
   * @internal
   * The id of the active radio
   */
  activeId: string | null
  /**
   * @internal
   * The id of the focused radio
   */
  focusedId: string | null
  /**
   * @internal
   * The id of the hovered radio
   */
  hoveredId: string | null
  /**
   * @internal
   * The active tab indicator's dom rect
   */
  indicatorRect?: Partial<{ left: string; top: string; width: string; height: string }>
  /**
   * @internal
   * Whether the active tab indicator's rect can transition
   */
  canIndicatorTransition?: boolean
  /**
   * @internal
   * Function to clean up the observer for the active tab's rect
   */
  indicatorCleanup?: VoidFunction | null
  /**
   * @internal
   * Whether the radio group's fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * Whether the radio group is disabled
   */
  isDisabled: boolean
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type RadioProps = {
  value: string
  /**
   * If `true`, the radio will be disabled
   */
  disabled?: boolean
  /**
   * If `true`, the radio is marked as invalid.
   */
  invalid?: boolean
}

export type RadioState = {
  isInteractive: boolean
  isInvalid: boolean
  isDisabled: boolean
  isChecked: boolean
  isFocused: boolean
  isHovered: boolean
  isActive: boolean
}

export type MachineApi<T extends PropTypes = PropTypes> = {
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
  focus: () => void
  /**
   * Returns the state details of a radio input
   */
  getRadioState(props: RadioProps): RadioState
  rootProps: T["element"]
  labelProps: T["element"]
  getRadioProps(props: RadioProps): T["label"]
  getRadioLabelProps(props: RadioProps): T["element"]
  getRadioControlProps(props: RadioProps): T["element"]
  getRadioHiddenInputProps(props: RadioProps): T["input"]
  indicatorProps: T["element"]
}
