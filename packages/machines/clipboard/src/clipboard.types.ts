import type { Service } from "@zag-js/core"
import type { CommonProperties, PropTypes, RequiredBy } from "@zag-js/types"

export interface CopyStatusDetails {
  copied: boolean
}

export interface ValueChangeDetails {
  value: string
}

export type ElementIds = Partial<{
  root: string
  input: string
  label: string
}>

export interface ClipboardProps extends CommonProperties {
  /**
   * The ids of the elements in the clipboard. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The value to be copied to the clipboard
   */
  value?: string | undefined
  /**
   * The default value to be copied to the clipboard
   */
  defaultValue?: string | undefined
  /**
   * The function to be called when the value changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * The function to be called when the value is copied to the clipboard
   */
  onStatusChange?: ((details: CopyStatusDetails) => void) | undefined
  /**
   * The timeout for the copy operation
   * @default 3000
   */
  timeout?: number | undefined
}

export interface ClipboardSchema {
  state: "idle" | "copied"
  props: RequiredBy<ClipboardProps, "timeout">
  context: {
    value: string
  }
  effect: string
  action: string
  guard: string
}

export type ClipboardService = Service<ClipboardSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface IndicatorProps {
  copied: boolean
}

export interface ClipboardApi<T extends PropTypes = PropTypes> {
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
