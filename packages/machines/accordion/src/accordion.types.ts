import type { StateMachine as S } from "@ui-machines/core"
import type { Context } from "@ui-machines/types"

export type AccordionMachineContext = Context<{
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
   * @internal - The `id` of the focused accordion item.
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
  onChange?: (activeId: string | string[] | null) => void
}>

/**
 * The `Accordion` machine states:
 *
 * - "unknown": The state before the accordion machine is initialized.
 * - "idle": The state after the accordion machine is initialized and not interacted with.
 * - "focused": The state when an accordion item's trigger is focused (with keyboard or pointer down)
 */
export type AccordionMachineState = {
  value: "unknown" | "idle" | "focused"
}

export type AccordionState = S.State<AccordionMachineContext, AccordionMachineState>

export type AccordionSend = S.Send<S.AnyEventObject>

export type AccordionItemProps = {
  value: string
  disabled?: boolean
}
