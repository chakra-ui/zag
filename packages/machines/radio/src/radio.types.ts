import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  label: string
  item(value: string): string
  itemInput(value: string): string
  itemControl(value: string): string
  itemLabel(value: string): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the radio. Useful for composition.
     */
    ids?: ElementIds
    /**
     * The value of the checked radio item
     */
    value: string | null

    /**
     * The name of the input fields in the radio
     * (Useful for form submission).
     */
    name?: string
    /**
     * If `true`, the radio group will be disabled
     */
    disabled?: boolean
    /**
     * If `true`, the radio group will be readonly
     */
    readonly?: boolean
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
   * The initial radio value.
   */
  initialValue: string | null
  /**
   * @internal
   * The id of the active radio item
   */
  activeId: string | null
  /**
   * @internal
   * The id of the focused radio item
   */
  focusedId: string | null
  /**
   * @internal
   * The id of the hovered radio item
   */
  hoveredId: string | null
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "unknown"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ItemProps = {
  value: string
  /**
   * If `true`, the radio will be disabled
   */
  disabled?: boolean
  /**
   * If `true`, the radio will be readonly
   */
  readonly?: boolean
  /**
   * If `true`, the radio is marked as invalid.
   */
  invalid?: boolean
}

export type InputProps = ItemProps & {
  /**
   * If `true` and `disabled` is passed, the radio will
   * remain tabbable but not interactive
   */
  focusable?: boolean
  /**
   * If `true`, the radio input is marked as required,
   */
  required?: boolean
  /**
   * Defines the string that labels the checkbox element.
   */
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}
