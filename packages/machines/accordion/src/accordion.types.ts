import type { StateMachine as S } from "@zag-js/core"
import type { Context } from "@zag-js/types"

export type MachineContext = Context<{
  /**
   * Whether multple accordion items can be open at the same time.
   * @default false
   */
  multiple?: boolean
  /**
   * Whether an accordion item can be collapsed after it has been opened.
   * @default false
   */
  collapsible?: boolean
  /**
   * @internal The `id` of the focused accordion item.
   */
  focusedValue: string | null
  /**
   * The `id` of the accordion item that is currently being opened.
   */
  value: string | string[] | null
  /**
   * Whether the accordion items are disabled
   */
  disabled?: boolean
  /**
   * The callback fired when the state of opened/closed accordion items changes.
   */
  onChange?: (details: { value: string | string[] | null }) => void
}>

export type MachineState = {
  value: "unknown" | "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type ItemProps = {
  value: string
  disabled?: boolean
}
