import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, RequiredBy, PropTypes } from "@zag-js/types"

type ElementIds = Partial<{
  button: string
  disclosure: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the disclosure. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Whether the disclosure button is disabled.
     */
    disabled?: boolean
    /**
     * Function to call when the disclosure is clicked.
     */
    onChange?: (details: { open: boolean }) => void
    /**
     * Whether the disclosure is open.
     */
    open?: boolean
  }

type PrivateContext = Context<{
  /**
   * @internal
   * Whether the button has focus
   */
  focused?: boolean
}>

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the disclosure is open
   */
  isOpen: boolean
  /**
   * Whether the button is disabled
   */
  isDisabled: boolean | undefined
  /**
   * Whether the button is focused
   */
  isFocused: boolean | undefined
  /**
   * Function to set the open state of the disclosure.
   */
  setOpen(open: boolean): void
  /**
   * Function to toggle the open state of the disclosure.
   */
  toggleOpen(): void
  buttonProps: T["element"]
  disclosureProps: T["element"]
}
