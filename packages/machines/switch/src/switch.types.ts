import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

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
     * If `true` and `disabled` is passed, the switch will
     * remain tabbable but not interactive
     */
    focusable?: boolean
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
    checked?: boolean
    /**
     * The name of the input field in a switch
     * (Useful for form submission).
     */
    name?: string
    /**
     * The associate form of the underlying input.
     */
    form?: string
    /**
     * The value to be used in the switch input.
     * This is the value that will be returned on form submission.
     */
    value?: string | number
    /**
     * Defines the string that labels the switch element.
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
