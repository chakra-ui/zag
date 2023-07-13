import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  button: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
    /**
     * The ids of the elements in the toggle. Useful for composition.
     */
    ids?: ElementIds
    /**
     * Specifies the localized strings that identifies the accessibility elements and their states
     */
    "aria-label": string
    /**
     * Whether the toggle is disabled.
     */
    disabled?: boolean
    /**
     * Function to call when the toggle is clicked.
     */
    onChange?: (details: { pressed: boolean }) => void
    /**
     * Whether the toggle is initially pressed.
     */
    pressed: boolean
  }

export type PublicApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the toggle is pressed.
   */
  isPressed: boolean
  /**
   * Function to set the pressed state of the toggle.
   */
  setPressed(pressed: boolean): void
  buttonProps: T["button"]
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{}>

type PrivateContext = Context<{}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "ready"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
