import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

export interface VisibilityChangeDetails {
  visible: boolean
}

export interface ElementIds {
  input?: string
  visibilityTrigger?: string
}

export interface PasswordInputProps extends DirectionProperty, CommonProperties {
  /**
   * The default visibility of the password input.
   */
  defaultVisible?: boolean
  /**
   * Whether the password input is visible.
   */
  visible?: boolean
  /**
   * Function called when the visibility changes.
   */
  onVisibilityChange?: (details: VisibilityChangeDetails) => void
  /**
   * The ids of the password input parts
   */
  ids?: ElementIds
  /**
   * Whether the password input is disabled.
   */
  disabled?: boolean
  /**
   * The invalid state of the password input.
   */
  invalid?: boolean
  /**
   * Whether the password input is read only.
   */
  readOnly?: boolean
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

export interface InputProps {
  /**
   * When `true`, the input will ignore password managers.
   *
   * **Only works for the following password managers**
   * - 1Password, LastPass, Bitwarden, Dashlane, Proton Pass
   */
  ignorePasswordManagers?: boolean
  /**
   * The autocomplete attribute for the password input.
   */
  autoComplete?: "current-password" | "new-password"
}

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
  focus(): void
  /**
   * Set the visibility of the password input.
   */
  setVisible(value: boolean): void

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getInputProps(props?: InputProps): T["input"]
  getVisibilityTriggerProps(): T["button"]
  getIndicatorProps(): T["element"]
  getControlProps(): T["element"]
}
