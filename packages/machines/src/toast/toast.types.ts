import { Machine } from "@ui-machines/core"
import { Context, Direction } from "../utils"

export type ToastType = "success" | "error" | "loading" | "info" | "custom"

export type ToastPlacement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

type SharedContext = {
  /**
   * Whether to pause toast when the user leaves the browser tab
   */
  pauseOnPageIdle?: boolean
  /**
   * Whehther to pause the toast wnhen it is hovered
   */
  pauseOnHover?: boolean
}

export type ToastMachineContext = SharedContext & {
  /**
   * The unique id of the toast
   */
  id: string
  /**
   * The owner document of the toast
   */
  doc?: Document
  /**
   * The document's text/writing direction.
   */
  dir?: Direction
  /**
   * The type of the toast
   */
  type: ToastType
  /**
   * The placement of the toast
   */
  placement: ToastPlacement
  /**
   * The message of the toast
   */
  title?: string
  /**
   * The description of the toast
   */
  description?: string
  /**
   * The duration the toast will be visible
   */
  duration: number
  /**
   * The duration for the toast to kept alive before it is removed.
   * Useful for exit transitions.
   */
  removeDelay: number
  /**
   * The progress of the toast until it is closed
   */
  progress: { max: number; value: number }
  /**
   * Function called when the toast has been closed and removed
   */
  onExited?: VoidFunction
  /**
   * Function called when the toast is leaving
   */
  onExiting?: VoidFunction
  /**
   * Function called when the toast is shown
   */
  onEntered?: VoidFunction
  /**
   * Function called when the toast is updated
   */
  onUpdate?: VoidFunction
}

export type ToastOptions = Partial<Omit<ToastMachineContext, "progress">>

export type ToastMachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "visible"
}

export type ToastMachine = Machine<ToastMachineContext, ToastMachineState>

export type ToastGroupMachineContext = SharedContext &
  Context<{
    /**
     * The child toast machines (spawned by the toast group)
     */
    toasts: Machine<ToastMachineContext, ToastMachineState>[]
    /**
     * The gutter or spacing between toasts
     */
    spacing: string | number
    /**
     * @computed The string value of the spacing
     */
    readonly spacingValue: string
    /**
     * The z-index applied to each toast group
     */
    zIndex: number
    /**
     * The maximum number of toasts that can be shown at once
     */
    max: number
    /**
     * The offset from the safe environment edge of the viewport
     */
    offsets: Record<"left" | "right" | "bottom" | "top", number>
  }>

type MaybeFunction<Value, Args> = Value | ((arg: Args) => Value)

export type ToastPromiseMessages<Value = any> = {
  loading: Value
  success: MaybeFunction<Value, ToastOptions>
  error: MaybeFunction<Value, ToastOptions>
}

export type ToastPromiseOptions = ToastOptions & {
  [key in "success" | "loading" | "error"]?: ToastOptions
}

export type ToastGroupContainerProps = {
  placement: ToastPlacement
}
