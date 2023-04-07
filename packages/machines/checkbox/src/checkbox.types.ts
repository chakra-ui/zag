import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  input: string
  control: string
  label: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the checkbox. Useful for composition.
     */
    ids?: ElementIds
    /**
     * If `true`, the checkbox will be indeterminate.
     * This only affects the icon shown inside checkbox
     * and does not modify the isChecked property.
     */
    indeterminate?: boolean
    /**
     * If `true`, the checkbox will be disabled
     */
    disabled?: boolean
    /**
     * If `true` and `disabled` is passed, the checkbox will
     * remain tabbable but not interactive
     */
    focusable?: boolean
    /**
     * If `true`, the checkbox will be readonly
     */
    readOnly?: boolean
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
    checked?: boolean
    /**
     * The callback invoked when the checked state of the `Checkbox` changes.
     */
    onChange?: (details: { checked: boolean | "indeterminate" }) => void
    /**
     * The name of the input field in a checkbox
     * (Useful for form submission).
     */
    name?: string
    /**
     * The associate form of the underlying checkbox.
     */
    form?: string
    /**
     * The value to be used in the checkbox input.
     * This is the value that will be returned on form submission.
     */
    value?: string | number
    /**
     * Defines the string that labels the checkbox element.
     */
    "aria-label"?: string
    "aria-labelledby"?: string
    "aria-describedby"?: string
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the checkbox is interactive
   */
  readonly isInteractive: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * Whether the checkbox is pressed
   */
  active: boolean
  /**
   * @internal
   * Whether the checkbox has focus
   */
  focused: boolean
  /**
   * @internal
   * Whether the checkbox is hovered
   */
  hovered: boolean
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "checked" | "unchecked"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
