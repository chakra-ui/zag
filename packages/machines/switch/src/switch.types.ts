import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface CheckedChangeDetails {
  checked: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  hiddenInput: string
  control: string
  label: string
  thumb: string
}>

export interface SwitchProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the switch. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  label?: string | undefined
  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean | undefined
  /**
   * If `true`, the switch is marked as invalid.
   */
  invalid?: boolean | undefined
  /**
   * If `true`, the switch input is marked as required,
   */
  required?: boolean | undefined
  /**
   * Whether the switch is read-only
   */
  readOnly?: boolean | undefined
  /**
   * Function to call when the switch is clicked.
   */
  onCheckedChange?: ((details: CheckedChangeDetails) => void) | undefined
  /**
   * The controlled checked state of the switch
   */
  checked?: boolean | undefined
  /**
   * The initial checked state of the switch when rendered.
   * Use when you don't need to control the checked state of the switch.
   */
  defaultChecked?: boolean | undefined
  /**
   * The name of the input field in a switch
   * (Useful for form submission).
   */
  name?: string | undefined
  /**
   * The id of the form that the switch belongs to
   */
  form?: string | undefined
  /**
   * The value of switch input. Useful for form submission.
   * @default "on"
   */
  value?: string | number | undefined
}

type PropsWithDefault = "value"

type ComputedContext = Readonly<{
  /**
   * Whether the switch is disabled
   */
  isDisabled: boolean
}>

interface PrivateContext {
  /**
   * Whether the switch is pressed
   */
  active: boolean
  /**
   * Whether the switch has focus
   */
  focused: boolean
  /**
   * Whether the switch has focus visible
   */
  focusVisible: boolean
  /**
   * Whether the switch is hovered
   */
  hovered: boolean
  /**
   * Whether the switch fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * The checked state of the switch
   */
  checked: boolean
}

export interface SwitchSchema {
  props: RequiredBy<SwitchProps, PropsWithDefault>
  context: PrivateContext
  state: "ready"
  computed: ComputedContext
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type SwitchService = Service<SwitchSchema>

export type SwitchMachine = Machine<SwitchSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface SwitchApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the switch is checked
   */
  checked: boolean
  /**
   * Whether the switch is disabled
   */
  disabled: boolean | undefined
  /**
   * Whether the switch is focused
   */
  focused: boolean | undefined
  /**
   * Sets the checked state of the switch.
   */
  setChecked: (checked: boolean) => void
  /**
   * Toggles the checked state of the switch.
   */
  toggleChecked: VoidFunction

  getRootProps: () => T["label"]
  getLabelProps: () => T["element"]
  getThumbProps: () => T["element"]
  getControlProps: () => T["element"]
  getHiddenInputProps: () => T["input"]
}
