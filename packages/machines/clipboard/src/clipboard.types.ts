import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

export interface CopyStatusDetails {
  copied: boolean
}

export type ElementIds = Partial<{
  root: string
  input: string
  label: string
}>

interface PublicContext extends CommonProperties {
  /**
   * The ids of the elements in the clipboard. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The value to be copied to the clipboard
   */
  value: string
  /**
   * The function to be called when the value is copied to the clipboard
   */
  onStatusChange?: (details: CopyStatusDetails) => void
  /**
   * The timeout for the copy operation
   * @default 3000
   */
  timeout: number
}

interface PrivateContext {}

type ComputedContext = Readonly<{}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "copied"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface IndicatorProps {
  copied: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the value has been copied to the clipboard
   */
  copied: boolean
  /**
   * The value to be copied to the clipboard
   */
  value: string
  /**
   * Set the value to be copied to the clipboard
   */
  setValue(value: string): void
  /**
   * Copy the value to the clipboard
   */
  copy(): void

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getControlProps(): T["element"]
  getTriggerProps(): T["button"]
  getInputProps(): T["input"]
  getIndicatorProps(props: IndicatorProps): T["element"]
}
