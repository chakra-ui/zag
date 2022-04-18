import type { StateMachine as S } from "@zag-js/core"
import type { Context, DirectionProperty } from "@zag-js/types"

/////////////////////////////////////////////////////////////////////////

type ElementIds = Partial<{
  root: string
  item(value: string): string
  content(value: string): string
  trigger(value: string): string
}>

/////////////////////////////////////////////////////////////////////////

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds
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
}

export type UserDefinedContext = Partial<PublicContext>

/////////////////////////////////////////////////////////////////////////

type ComputedContext = Readonly<{}>

/////////////////////////////////////////////////////////////////////////

type PrivateContext = Context<{
  /**
   * @internal
   * The `id` of the focused accordion item.
   */
  focusedValue: string | null
}>

/////////////////////////////////////////////////////////////////////////

export type MachineContext = PublicContext & PrivateContext & ComputedContext

/////////////////////////////////////////////////////////////////////////

export type MachineState = {
  value: "unknown" | "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

/////////////////////////////////////////////////////////////////////////

export type Send = S.Send<S.AnyEventObject>

/////////////////////////////////////////////////////////////////////////

export type ItemProps = {
  value: string
  disabled?: boolean
}
