import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

export interface VisibilityChangeDetails {
  visible: boolean
}

export type ElementIds = Partial<{
  input: string
  visibilityTrigger: string
}>

export type IntlTranslations = Partial<{
  visibilityTrigger: ((visible: boolean) => string) | undefined
}>

export interface PasswordInputProps extends DirectionProperty, CommonProperties {
  /**
   * The default visibility of the password input.
   */
  defaultVisible?: boolean | undefined
  /**
   * Whether the password input is visible.
   */
  visible?: boolean | undefined
  /**
   * Function called when the visibility changes.
   */
  onVisibilityChange?: ((details: VisibilityChangeDetails) => void) | undefined
  /**
   * The ids of the password input parts
   */
  ids?: ElementIds | undefined
  /**
   * Whether the password input is disabled.
   */
  disabled?: boolean | undefined
  /**
   * The invalid state of the password input.
   */
  invalid?: boolean | undefined
  /**
   * Whether the password input is read only.
   */
  readOnly?: boolean | undefined
  /**
   * Whether the password input is required.
   */
  required?: boolean | undefined
  /**
   * The localized messages to use.
   */
  translations?: IntlTranslations | undefined
  /**
   * When `true`, the input will ignore password managers.
   *
   * **Only works for the following password managers**
   * - 1Password, LastPass, Bitwarden, Dashlane, Proton Pass
   */
  ignorePasswordManagers?: boolean | undefined
  /**
   * The autocomplete attribute for the password input.
   * @default "current-password"
   */
  autoComplete?: "current-password" | "new-password" | undefined
  /**
   * The name of the password input.
   */
  name?: string | undefined
}

export interface PasswordInputSchema {
  state: "idle"
  props: PasswordInputProps
  context: {
    visible: boolean
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type PasswordInputService = Service<PasswordInputSchema>

export type PasswordInputMachine = Machine<PasswordInputSchema>

export interface PasswordInputApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the password input is visible.
   */
  visible: boolean
  /**
   * Whether the password input is disabled.
   */
  disabled: boolean
  /**
   * Whether the password input is invalid.
   */
  invalid: boolean
  /**
   * Focus the password input.
   */
  focus: VoidFunction
  /**
   * Set the visibility of the password input.
   */
  setVisible: (value: boolean) => void
  /**
   * Toggle the visibility of the password input.
   */
  toggleVisible: VoidFunction

  getRootProps: () => T["element"]
  getLabelProps: () => T["label"]
  getInputProps: () => T["input"]
  getVisibilityTriggerProps: () => T["button"]
  getIndicatorProps: () => T["element"]
  getControlProps: () => T["element"]
}
