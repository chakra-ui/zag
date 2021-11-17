import { Machine } from "@ui-machines/core"
import { Context } from "../utils"

export type ToastType = "success" | "error" | "loading" | "info" | "custom"

export type ToastPlacement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

export type ToastMachineContext = {
  /**
   * The owner document of the toast
   */
  doc?: Document
  /**
   * The unique id of the toast
   */
  id: string
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
   * The progress of the toast until it is closed
   */
  progress: { max: number; value: number }
  /**
   * Function called when the toast is closed
   */
  onClose?: VoidFunction
  /**
   * Whether to pause toast when the user leaves the browser tab
   */
  pauseOnPageIdle: boolean
  /**
   * Whehther to pause the toast wnhen it is hovered
   */
  pauseOnHover: boolean
}

export type ToastOptions = Partial<Omit<ToastMachineContext, "progress">>

export type ToastMachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "visible"
}

export type ToastMachine = Machine<ToastMachineContext, ToastMachineState>

export type ToastGroupMachineContext = Context<{
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
