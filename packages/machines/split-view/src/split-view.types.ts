import { Context } from "@ui-machines/types"

export type MachineContext = Context<{
  /**
   * Whether to allow the separator to be dragged.
   */
  fixed?: boolean
  /**
   * The orientation of the split view.
   */
  orientation: "horizontal" | "vertical"
  /**
   * The minimum size of the primary pane.
   */
  min: number
  /**
   * The maximum size of the primary pane.
   */
  max: number
  /**
   * The size of the primary pane.
   */
  value: number
  /**
   * The step increments of the primary pane when it is dragged
   * or resized with keyboard.
   */
  step: number
  /**
   * Callback to be invoked when the primary pane is resized.
   */
  onChange?: (size: number) => void
  /**
   * Whether the primary pane is disabled.
   */
  disabled?: boolean
  readonly isCollapsed: boolean
  readonly isHorizontal: boolean
}>

export type MachineState = {
  value: "unknown" | "idle" | "hover:temp" | "hover" | "dragging" | "focused"
}
