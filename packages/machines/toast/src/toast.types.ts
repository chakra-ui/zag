import { Machine } from "@ui-machines/core"
import { Context, Direction } from "@ui-machines/types"

export type Type = "success" | "error" | "loading" | "info" | "custom"

export type Placement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

type SharedContext = {
  /**
   * Whether to pause toast when the user leaves the browser tab
   */
  pauseOnPageIdle?: boolean
  /**
   * Whether to pause the toast when interacted with
   */
  pauseOnInteraction?: boolean
}

export type MachineContext = SharedContext & {
  /**
   * The unique id of the toast
   */
  id: string
  /**
   * @internal The owner document of the toast
   */
  doc?: Document
  /**
   * The document's text/writing direction.
   */
  dir?: Direction
  /**
   * The type of the toast
   */
  type: Type
  /**
   * The placement of the toast
   */
  placement: Placement
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
   * The time the toast was created
   */
  createdAt: number
  /**
   * The time left before the toast is removed
   */
  remaining: number
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
  /**
   * Custom function to render the toast element.
   */
  render?: (options: RenderOptions) => any
}

export type RenderOptions = {
  id: string
  type: Type
  dismiss(): void
}

export type Options = Partial<Omit<MachineContext, "progress">>

export type MachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "persist"
  tags: "visible" | "paused" | "updating"
}

export type Service = Machine<MachineContext, MachineState>

export type GroupMachineContext = SharedContext &
  Context<{
    /**
     * @internal The child toast machines (spawned by the toast group)
     */
    toasts: Service[]
    /**
     * @internal The total number of toasts in the group
     */
    readonly count: number
    /**
     * The gutter or spacing between toasts
     */
    gutter: string
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

export type PromiseMessages<Value = any> = {
  loading: Value
  success: MaybeFunction<Value, Options>
  error: MaybeFunction<Value, Options>
}

export type PromiseOptions = Options & {
  [key in "success" | "loading" | "error"]?: Options
}

export type GroupProps = {
  placement: Placement
  label?: string
}

export type GlobalConnect = {
  count: number
  isVisible(id: string): boolean
  upsert(options: Options): string | undefined
  success(options: Options): string | undefined
  error(options: Options): string | undefined
  loading(options: Options): string | undefined
  dismiss(id?: string | undefined): void
  remove(id?: string | undefined): void
  promise<T>(promise: Promise<T>, msgs: PromiseMessages, opts?: PromiseOptions): Promise<T>
}
