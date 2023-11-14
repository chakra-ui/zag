import type { Machine, StateMachine as S } from "@zag-js/core"
import type {
  CommonProperties,
  Context,
  Direction,
  DirectionProperty,
  PropTypes,
  RequiredBy,
  RootProperties,
} from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Base types
 * -----------------------------------------------------------------------------*/

export type Type = "success" | "error" | "loading" | "info" | "custom"

export type Placement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

export interface GenericOptions {
  render?: (api: any) => any
  title?: any
  description?: any
}

export interface DefaultGenericOptions {
  /**
   * Custom function to render the toast element.
   */
  render?: (api: MachineApi<any, DefaultGenericOptions>) => any
  /**
   * The title of the toast.
   */
  title?: string
  /**
   * The description of the toast.
   */
  description?: string
}

export type GlobalToastOptions<T extends GenericOptions> = Pick<T, "render"> & {
  /**
   * Whether to pause toast when the user leaves the browser tab
   */
  pauseOnPageIdle?: boolean
  /**
   * Whether to pause the toast when interacted with
   */
  pauseOnInteraction?: boolean
  /**
   * The duration the toast will be visible
   */
  duration?: number
  /**
   * The duration for the toast to kept alive before it is removed.
   * Useful for exit transitions.
   */
  removeDelay?: number
  /**
   * The placement of the toast
   */
  placement?: Placement
}

export type ToastOptions<T extends GenericOptions = DefaultGenericOptions> = T & {
  /**
   * The unique id of the toast
   */
  id: string
  /**
   * The type of the toast
   */
  type: Type
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

export type Options<T extends GenericOptions> = Partial<ToastOptions<T> & GlobalToastOptions<T>>

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type MachineContext<T extends GenericOptions = DefaultGenericOptions> = GlobalToastOptions<T> &
  RootProperties &
  CommonProperties &
  Omit<ToastOptions<T>, "removeDelay"> & {
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

export interface MachineState {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "persist"
  tags: "visible" | "paused" | "updating"
}

export type State<T extends GenericOptions = DefaultGenericOptions> = S.State<MachineContext<T>, MachineState>

export type Send = S.Send

export type Service<T extends GenericOptions = DefaultGenericOptions> = Machine<MachineContext<T>, MachineState>

type GroupPublicContext<T extends GenericOptions> = GlobalToastOptions<T> &
  DirectionProperty &
  CommonProperties & {
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

export type UserDefinedGroupContext<T extends GenericOptions> = RequiredBy<GroupPublicContext<T>, "id">

type GroupComputedContext = Readonly<{
  /**
   * @computed
   * The total number of toasts in the group
   */
  count: number
}>

type GroupPrivateContext<T extends GenericOptions> = Context<{
  /**
   * @internal
   * The child toast machines (spawned by the toast group)
   */
  toasts: Service<T>[]
}>

export interface GroupMachineContext<T extends GenericOptions = DefaultGenericOptions>
  extends GroupPublicContext<T>,
    GroupComputedContext,
    GroupPrivateContext<T> {}

export type GroupState<T extends GenericOptions = DefaultGenericOptions> = S.State<GroupMachineContext<T>>

export type GroupSend = S.Send

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

type MaybeFunction<Value, Args> = Value | ((arg: Args) => Value)

export interface PromiseOptions<V, O extends GenericOptions = DefaultGenericOptions> {
  loading: ToastOptions<O>
  success: MaybeFunction<ToastOptions<O>, V>
  error: MaybeFunction<ToastOptions<O>, Error>
}

export interface GroupProps {
  placement: Placement
  label?: string
}

export interface GroupMachineApi<T extends PropTypes = PropTypes, O extends GenericOptions = DefaultGenericOptions> {
  /**
   * The total number of toasts
   */
  count: number
  /**
   * The active toasts
   */
  toasts: Service<O>[]
  /**
   * The active toasts by placement
   */
  toastsByPlacement: Partial<Record<Placement, Service<O>[]>>
  /**
   * Returns whether the toast id is visible
   */
  isVisible(id: string): boolean
  /**
   * Function to create a toast.
   */
  create(options: Options<O>): string | undefined
  /**
   * Function to create or update a toast.
   */
  upsert(options: Options<O>): string | undefined
  /**
   * Function to update a toast's options by id.
   */
  update(id: string, options: Options<O>): void
  /**
   * Function to create a success toast.
   */
  success(options: Options<O>): string | undefined
  /**
   * Function to create an error toast.
   */
  error(options: Options<O>): string | undefined
  /**
   * Function to create a loading toast.
   */
  loading(options: Options<O>): string | undefined
  /**
   * Function to resume a toast by id.
   */
  resume(id?: string | undefined): void
  /**
   * Function to pause a toast by id.
   */
  pause(id?: string | undefined): void
  /**
   * Function to dismiss a toast by id.
   * If no id is provided, all toasts will be dismissed.
   */
  dismiss(id?: string | undefined): void
  /**
   * Function to dismiss all toasts by placement.
   */
  dismissByPlacement(placement: Placement): void
  /**
   * Function to remove a toast by id.
   * If no id is provided, all toasts will be removed.
   */
  remove(id?: string | undefined): void
  /**
   * Function to create a toast from a promise.
   * - When the promise resolves, the toast will be updated with the success options.
   * - When the promise rejects, the toast will be updated with the error options.
   */
  promise<T>(promise: Promise<T>, options: PromiseOptions<T, O>, shared?: Partial<ToastOptions<O>>): Promise<T>
  /**
   * Function to subscribe to the toast group.
   */
  subscribe(callback: (toasts: Service<O>[]) => void): VoidFunction
  getGroupProps(options: GroupProps): T["element"]
}

export type MachineApi<T extends PropTypes = PropTypes, O extends GenericOptions = DefaultGenericOptions> = Pick<
  O,
  "title" | "description"
> & {
  /**
   * The type of the toast.
   */
  type: Type
  /**
   * The current placement of the toast.
   */
  placement: Placement
  /**
   * Whether the toast is visible.
   */
  isVisible: boolean
  /**
   * Whether the toast is paused.
   */
  isPaused: boolean
  /**
   * Whether the toast is in RTL mode.
   */
  isRtl: boolean
  /**
   * Function to pause the toast (keeping it visible).
   */
  pause(): void
  /**
   * Function to resume the toast dismissing.
   */
  resume(): void
  /**
   * Function to instantly dismiss the toast.
   */
  dismiss(): void

  rootProps: T["element"]
  titleProps: T["element"]
  descriptionProps: T["element"]
  closeTriggerProps: T["button"]
}
