import type { StateMachine as S } from "@zag-js/core"
import type { Context, DirectionProperty } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  input: string
  control: string
  label: string
}>

type PublicContext = DirectionProperty & {
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
  readonly?: boolean
  /**
   * If `true`, the checkbox is marked as invalid.
   */
  invalid?: boolean
  /**
   * If `true`, the checkbox input is marked as required,
   */
  required?: boolean
  /**
   * If `true`, the checkbox will be initially checked.
   */
  defaultChecked?: boolean
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
   * The value to be used in the checkbox input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number
  /**
   * Defines the string that labels the checkbox element.
   */
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: true | undefined
  "aria-describedby"?: string
}

export type UserDefinedContext = Partial<PublicContext>

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the slider is interactive
   */
  readonly isInteractive: boolean
  /**
   * @computed
   * Whether the writing direction is RTL
   */
  isRtl: boolean
}>

type PrivateContext = Context<{
  active: boolean
  focused: boolean
  hovered: boolean
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "unknown" | "checked" | "unchecked"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
