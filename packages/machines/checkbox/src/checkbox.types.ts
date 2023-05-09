import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  input: string
  control: string
  label: string
}>

export type CheckedState = boolean | "indeterminate"

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the checkbox. Useful for composition.
     */
    ids?: ElementIds
    /**
     * If `true`, the checkbox will be disabled
     */
    disabled?: boolean
    /**
     * If `true`, the checkbox is marked as invalid.
     */
    invalid?: boolean
    /**
     * If `true`, the checkbox input is marked as required,
     */
    required?: boolean
    /**
     * If `true`, the checkbox will be checked.
     */
    checked: CheckedState
    /**
     * The callback invoked when the checked state of the `Checkbox` changes.
     */
    onChange?: (details: { checked: CheckedState }) => void
    /**
     * The name of the input field in a checkbox. Useful for form submission.
     */
    name?: string
    /**
     * The id of the form that the checkbox belongs to.
     */
    form?: string
    /**
     * The value of checkbox input. Useful for form submission.
     * @default "on"
     */
    value: string
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * Whether the checkbox is checked
   */
  isIndeterminate: boolean
  /**
   * Whether the checkbox is checked
   */
  isChecked: boolean
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
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "ready"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
