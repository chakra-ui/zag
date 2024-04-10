import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Direction, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Base types
 * -----------------------------------------------------------------------------*/

export type Type = "success" | "error" | "loading" | "info" | "custom"

export type Placement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

export interface GenericOptions<T = any> {
  /**
   * The title of the toast.
   */
  title?: T
  /**
   * The description of the toast.
   */
  description?: T
}

export interface OpenChangeDetails {
  open: boolean
}

export interface DefaultGenericOptions extends GenericOptions<string> {}

export interface GlobalToastOptions<T = any> extends GenericOptions<T> {
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

export interface ToastOptions<T> extends GenericOptions<T> {
  /**
   * The unique id of the toast
   */
  id: string
  /**
   * The type of the toast
   */
  type: Type
  /**
   * Function called when the toast is visible
   */
  onOpenChange?(details: OpenChangeDetails): void
  /**
   * Function called when the toast is leaving
   */
  onClosing?: VoidFunction
}

export interface Options<T> extends Partial<ToastOptions<T> & GlobalToastOptions<T>> {}

export interface ToastHeightDetails {
  id: string
  height: number
  placement: Placement
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface MachineContext<T = any>
  extends CommonProperties,
    MachinePrivateContext,
    Omit<ToastOptions<T>, "removeDelay">,
    GlobalToastOptions<T> {
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

interface MachinePrivateContext {
  /**
   * @internal
   * The height of the toast
   */
  height: number
  /**
   * @internal
   * The absolute height of the toast relative to other toasts
   */
  offset: number
  /**
   * @internal
   * Whether the toast is in the front
   */
  frontmost: boolean
  /**
   * @internal
   * The index of the toast in the group
   */
  index: number
  /**
   * @internal
   * Whether the toast is mounted
   */
  mounted: boolean
  /**
   * @internal
   * The z-index of the toast
   */
  zIndex: number
  /**
   * @internal
   * Whether the toast is stacked
   */
  expanded?: boolean
}

export interface MachineState {
  value: "active" | "active:temp" | "dismissing" | "inactive" | "persist"
  tags: "visible" | "paused" | "updating"
}

export type State<T = any> = S.State<MachineContext<T>, MachineState>

export type Send = S.Send

export type Service<T = any> = Machine<MachineContext<T>, MachineState>

/* -----------------------------------------------------------------------------
 * Group machine context
 * -----------------------------------------------------------------------------*/

interface GroupPublicContext<T> extends GlobalToastOptions<T>, DirectionProperty, CommonProperties {
  /**
   * The gap or spacing between toasts
   */
  gap: number
  /**
   * The maximum number of toasts that can be shown at once
   */
  max: number
  /**
   * The offset from the safe environment edge of the viewport
   */
  offsets: string | Record<"left" | "right" | "bottom" | "top", string>
  /**
   * The hotkey that will move focus to the toast group
   */
  hotkey: string[]
  /**
   * Whether the toasts should overlap each other
   */
  overlap?: boolean
}

export interface UserDefinedGroupContext<T> extends RequiredBy<GroupPublicContext<T>, "id"> {}

type GroupComputedContext = Readonly<{
  /**
   * @computed
   * The total number of toasts in the group
   */
  count: number
}>

interface GroupPrivateContext<T> extends GenericOptions<T> {
  /**
   * @internal
   * The child toast machines (spawned by the toast group)
   */
  toasts: Service<T>[]
  /**
   * @internal
   * The height of each toast
   */
  heights: ToastHeightDetails[]
}

export interface GroupMachineContext<T = any>
  extends GroupPublicContext<T>,
    GroupPrivateContext<T>,
    GroupComputedContext {}

export interface GroupMachineState {
  value: "expanded" | "collapsed"
}

export type GroupState<T = any> = S.State<GroupMachineContext<T>>

export type GroupSend = S.Send

export type GroupService<T = any> = Machine<GroupMachineContext<T>, GroupMachineState>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

type MaybeFunction<Value, Args> = Value | ((arg: Args) => Value)

export interface PromiseOptions<V, O = any> {
  loading: ToastOptions<O>
  success: MaybeFunction<ToastOptions<O>, V>
  error: MaybeFunction<ToastOptions<O>, Error>
  finally?: () => void | Promise<void>
}

export interface GroupProps {
  placement: Placement
  label?: string
}

export interface GroupMachineApi<T extends PropTypes = PropTypes, O = any> {
  /**
   * The total number of toasts
   */
  getCount(): number
  /**
   * The active toasts
   */
  getToasts(): Service<O>[]
  /**
   * The active toasts by placement
   */
  getToastsByPlacement(): Partial<Record<Placement, Service<O>[]>>
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
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options: PromiseOptions<T, O>,
    shared?: Partial<ToastOptions<O>>,
  ): string
  /**
   * Function to subscribe to the toast group.
   */
  subscribe(callback: (toasts: Service<O>[]) => void): VoidFunction
  getGroupProps(options: GroupProps): T["element"]
}

export interface MachineApi<T extends PropTypes = PropTypes, O = any> extends GenericOptions<O> {
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
