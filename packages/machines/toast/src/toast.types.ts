import type { Machine, StateMachine as S } from "@zag-js/core"
import type { Context, Direction, DirectionProperty, RootProperties } from "@zag-js/types"

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

export type ToastOptions = {
  /**
   * The unique id of the toast
   */
  id: string
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
   * Custom function to render the toast element.
   */
  render?: (options: RenderOptions) => any
  /**
   * The duration for the toast to kept alive before it is removed.
   * Useful for exit transitions.
   */
  removeDelay?: number
  /**
   * Function called when the toast has been closed and removed
   */
  onClose?: VoidFunction
  /**
   * Function called when the toast is leaving
   */
  onClosing?: VoidFunction
  /**
   * Function called when the toast is shown
   */
  onOpen?: VoidFunction
  /**
   * Function called when the toast is updated
   */
  onUpdate?: VoidFunction
}

export type Options = Partial<ToastOptions>

export type RenderOptions = Omit<ToastOptions, "render"> & {
  dismiss(): void
}

export type MachineContext = SharedContext &
  RootProperties &
  Omit<ToastOptions, "removeDelay"> & {
    /**
     * The duration for the toast to kept alive before it is removed.
     * Useful for exit transitions.
     */
    removeDelay: number
    /**
     * The document's text/writing direction.
     */
    dir?: Direction
    /**
     * The time the toast was created
     */
    createdAt: number
    /**
     * The time left before the toast is removed
     */
    remaining: number
  }

export type MachineState = {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "persist"
  tags: "visible" | "paused" | "updating"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send

export type Service = Machine<MachineContext, MachineState>

type GroupPublicContext = SharedContext &
  DirectionProperty & {
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
    offsets: string | Record<"left" | "right" | "bottom" | "top", string>
  }

export type UserDefinedGroupContext = Partial<GroupPublicContext>

type GroupComputedContext = Readonly<{
  /**
   * @computed
   * The total number of toasts in the group
   */
  readonly count: number
}>

type GroupPrivateContext = Context<{
  /**
   * @internal
   * The child toast machines (spawned by the toast group)
   */
  toasts: Service[]
}>

export type GroupMachineContext = GroupPublicContext & GroupComputedContext & GroupPrivateContext

export type GroupState = S.State<GroupMachineContext>

export type GroupSend = (event: S.Event<S.AnyEventObject>) => void

type MaybeFunction<Value, Args> = Value | ((arg: Args) => Value)

export type PromiseOptions<Value> = {
  loading: ToastOptions
  success: MaybeFunction<ToastOptions, Value>
  error: MaybeFunction<ToastOptions, Error>
}

export type GroupProps = {
  placement: Placement
  label?: string
}

export type Toaster = {
  count: number
  isVisible(id: string): boolean
  upsert(options: ToastOptions): string | undefined
  create(options: ToastOptions): string | undefined
  success(options: ToastOptions): string | undefined
  error(options: ToastOptions): string | undefined
  loading(options: ToastOptions): string | undefined
  dismiss(id?: string | undefined): void
  remove(id?: string | undefined): void
  promise<T>(promise: Promise<T>, options: PromiseOptions<T>, shared?: ToastOptions): Promise<T>
}
