import type { EventObject, Machine, Service } from "@zag-js/core"
import type { PropTypes } from "@zag-js/types"

export interface ToggleProps {
  /**
   * Whether the toggle is disabled.
   */
  disabled?: boolean | undefined
  /**
   * The default pressed state of the toggle.
   */
  defaultPressed?: boolean | undefined
  /**
   * The pressed state of the toggle.
   */
  pressed?: boolean | undefined
  /**
   * Event handler called when the pressed state of the toggle changes.
   */
  onPressedChange?: ((pressed: boolean) => void) | undefined
}

export interface ToggleSchema {
  state: "idle"
  props: ToggleProps
  context: {
    pressed: boolean
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type ToggleService = Service<ToggleSchema>

export type ToggleMachine = Machine<ToggleSchema>

export interface ToggleApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the toggle is pressed.
   */
  pressed: boolean
  /**
   * Whether the toggle is disabled.
   */
  disabled: boolean
  /**
   * Sets the pressed state of the toggle.
   */
  setPressed: (pressed: boolean) => void

  getRootProps: () => T["element"]
  getIndicatorProps: () => T["element"]
}
