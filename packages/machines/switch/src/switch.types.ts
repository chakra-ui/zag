import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  input: string
  control: string
  label: string
  thumb: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the switch. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    label: string
    /**
     * Whether the switch is disabled.
     */
    disabled?: boolean
    /**
     * If `true`, the switch will be readonly
     */
    readOnly?: boolean
    /**
     * If `true`, the switch is marked as invalid.
     */
    invalid?: boolean
    /**
     * If `true`, the switch input is marked as required,
     */
    required?: boolean
    /**
     * Function to call when the switch is clicked.
     */
    onChange?: (details: { checked: boolean }) => void
    /**
     * Whether the switch is checked.
     */
    checked: boolean
    /**
     * The name of the input field in a switch
     * (Useful for form submission).
     */
    name?: string
    /**
     * The id of the form that the switch belongs to
     */
    form?: string
    /**
     * The value of switch input. Useful for form submission.
     * @default "on"
     */
    value?: string | number
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * Whether the switch is disabled
   */
  isDisabled: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * Whether the checkbox is pressed
   */
  active?: boolean
  /**
   * @internal
   * Whether the checkbox has focus
   */
  focused?: boolean
  /**
   * @internal
   * Whether the checkbox is hovered
   */
  hovered?: boolean
  /**
   * @internal
   * Whether the checkbox fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "ready"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the checkbox is checked
   */
  isChecked: boolean
  /**
   * Whether the checkbox is disabled
   */
  isDisabled: boolean | undefined
  /**
   * Whether the checkbox is focused
   */
  isFocused: boolean | undefined
  /**
   * Function to set the checked state of the switch.
   */
  setChecked(checked: boolean): void
  /**
   * Function to toggle the checked state of the checkbox
   */
  toggleChecked(): void
  rootProps: T["label"]
  labelProps: T["element"]
  thumbProps: T["element"]
  controlProps: T["element"]
  hiddenInputProps: T["input"]
}
