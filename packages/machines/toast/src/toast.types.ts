import type { CommonProperties, Direction, DirectionProperty, PropTypes, Required, RequiredBy } from "@zag-js/types"
import type { EventObject, Machine, Service } from "@zag-js/core"

/* -----------------------------------------------------------------------------
 * Base types
 * -----------------------------------------------------------------------------*/

export type Type = "success" | "error" | "loading" | "info" | (string & {})

export type Placement = "top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"

export type Status = "visible" | "dismissing" | "unmounted"

export interface StatusChangeDetails {
  /**
   * The status of the toast
   */
  status: Status
  /**
   * The reason for the status change
   */
  src?: string | undefined
}

export interface ToastHeight {
  /**
   * The id of the toast
   */
  id: string
  /**
   * The height of the toast
   */
  height: number
}

export interface ActionOptions {
  /**
   * The label of the action
   */
  label: string
  /**
   * The function to call when the action is clicked
   */
  onClick: VoidFunction
}

/* -----------------------------------------------------------------------------
 * Toast Options
 * -----------------------------------------------------------------------------*/

export interface Options<T = any> {
  /**
   * The title of the toast.
   */
  title?: T | undefined
  /**
   * The description of the toast.
   */
  description?: T | undefined
  /**
   * The duration the toast will be visible
   */
  duration?: number | undefined
  /**
   * The duration for the toast to kept alive before it is removed.
   * Useful for exit transitions.
   */
  removeDelay?: number | undefined
  /**
   * The unique id of the toast
   */
  id?: string | undefined
  /**
   * The type of the toast
   */
  type?: Type | undefined
  /**
   * Function called when the toast is visible
   */
  onStatusChange?: ((details: StatusChangeDetails) => void) | undefined
  /**
   * The action of the toast
   */
  action?: ActionOptions | undefined
  /**
   * Whether the toast is closable
   */
  closable?: boolean | undefined
  /**
   * The metadata of the toast
   */
  meta?: Record<string, any> | undefined
  /**
   * @internal
   * The promise of the toast
   */
  promise?: Promise<any> | (() => Promise<any>) | undefined
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ToastProps<T = any> extends Omit<CommonProperties, "id">, Options<T> {
  /**
   * The direction of the toast
   */
  dir?: Direction | undefined
  /**
   * @internal
   * The index of the toast
   */
  index?: number | undefined
  /**
   * @internal
   * Whether the toast is stacked
   */
  stacked?: boolean | undefined
  /**
   * @internal
   * The event to be dispatched
   */
  message?: any | undefined
  /**
   * The gap of the toast
   */
  gap?: number | undefined
  /**
   * @internal
   * The parent of the toast
   */
  parent: Service<ToastGroupSchema>
  /**
   * @internal
   * Whether to dismiss the toast
   */
  dismiss?: boolean | undefined
}

type ToastPropsWithDefault = "type" | "parent" | "duration" | "id" | "removeDelay"

export type ToastSchema<O = any> = {
  props: RequiredBy<ToastProps<O>, ToastPropsWithDefault>
  context: {
    mounted: boolean
    initialHeight: number
    remainingTime: number
  }
  computed: {
    height: number
    heightIndex: number
    heightBefore: number
    frontmost: boolean
    zIndex: number
    shouldPersist: boolean
  }
  refs: {
    closeTimerStartTime: number
    lastCloseStartTimerStartTime: number
  }
  state: "visible" | "visible:updating" | "dismissing" | "unmounted" | "visible:persist"
  tag: "visible" | "paused" | "updating"
  guard: string
  action: string
  effect: string
  event: EventObject
}

export type ToastService = Service<ToastSchema>

export type ToastMachine = Machine<ToastSchema>

/* -----------------------------------------------------------------------------
 * Toast Group API
 * -----------------------------------------------------------------------------*/

export interface ToastStoreProps {
  /**
   * The placement of the toast
   * @default "bottom"
   */
  placement?: Placement | undefined
  /**
   * The maximum number of toasts. When the number of toasts exceeds this limit, the new toasts are queued.
   * @default 24
   */
  max?: number | undefined
  /**
   * Whether to overlap the toasts
   */
  overlap?: boolean | undefined
  /**
   * The duration of the toast.
   * By default, it is determined by the type of the toast.
   */
  duration?: number | undefined
  /**
   * The gap between the toasts
   * @default 16
   */
  gap?: number | undefined
  /**
   * The offset from the safe environment edge of the viewport
   * @default "1rem"
   */
  offsets?: string | Record<"left" | "right" | "bottom" | "top", string> | undefined
  /**
   * The hotkey that will move focus to the toast group
   * @default '["altKey", "KeyT"]'
   */
  hotkey?: string[] | undefined
  /**
   * The duration for the toast to kept alive before it is removed.
   * Useful for exit transitions.
   *
   * @default 200
   */
  removeDelay?: number | undefined
  /**
   * Whether to pause toast when the user leaves the browser tab
   * @default false
   */
  pauseOnPageIdle?: boolean | undefined
}

export interface ToastGroupProps extends DirectionProperty, CommonProperties {
  /**
   * The store of the toast
   */
  store: ToastStore
}

export type ToastGroupSchema = {
  state: "stack" | "overlap"
  props: ToastGroupProps
  context: {
    toasts: RequiredBy<ToastProps, ToastPropsWithDefault>[]
    heights: ToastHeight[]
  }
  computed: {
    count: number
    overlap: boolean
    placement: Placement
  }
  refs: {
    dismissableCleanup?: VoidFunction | undefined
    lastFocusedEl: HTMLElement | null
    isFocusWithin: boolean
    isPointerWithin: boolean
    ignoreMouseTimer: number | null
  }
  guard: string
  effect: string
  action: string
  event: EventObject
}

export type ToastGroupService = Service<ToastGroupSchema>

export type ToastGroupMachine = Machine<ToastGroupSchema>

/* -----------------------------------------------------------------------------
 * Toaster API
 * -----------------------------------------------------------------------------*/

export interface ToastStore<V = any> {
  /**
   * The attributes of the toast store
   */
  attrs: Required<ToastStoreProps>
  /**
   * Subscribe to the toast store
   */
  subscribe: (subscriber: (...args: any[]) => void) => VoidFunction
  /**
   * Create a new toast with the given options
   */
  create: (data: Options<V>) => string
  /**
   * Update an existing toast with new properties
   */
  update: (id: string, data: Partial<ToastProps<V>>) => string
  /**
   * Remove a toast by its ID
   */
  remove: (id?: string) => void
  /**
   * Dismiss a toast by its ID. If no ID is provided, dismisses all toasts
   */
  dismiss: (id?: string) => void
  /**
   * Create an error toast with the given options
   */
  error: (data: Options<V>) => void
  /**
   * Create a success toast with the given options
   */
  success: (data: Options<V>) => void
  /**
   * Create an info toast with the given options
   */
  info: (data: Options<V>) => void
  /**
   * Create a warning toast with the given options
   */
  warning: (data: Options<V>) => void
  /**
   * Create a loading toast with the given options
   */
  loading: (data: Options<V>) => void
  /**
   * Get all currently visible toasts
   */
  getVisibleToasts: () => Partial<ToastProps<V>>[]
  /**
   * Get the total number of toasts
   */
  getCount: () => number
  /**
   * Create a toast that tracks a promise's state
   */
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: PromiseOptions<T, V>,
    shared?: Omit<Options<V>, "type">,
  ) => { id: string | undefined; unwrap: () => Promise<T> } | undefined
  /**
   * Pause a toast's auto-dismiss timer. If no ID is provided, pauses all toasts
   */
  pause: (id?: string) => void
  /**
   * Resume a toast's auto-dismiss timer. If no ID is provided, resumes all toasts
   */
  resume: (id?: string) => void
  /**
   * Check if a toast with the given ID is currently visible
   */
  isVisible: (id: string) => boolean
  /**
   * Check if a toast with the given ID has been dismissed
   */
  isDismissed: (id: string) => boolean
  /**
   * @internal
   * Expand all toasts to show their full content
   */
  expand: VoidFunction
  /**
   * @internal
   * Collapse all toasts to their compact state
   */
  collapse: VoidFunction
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

type MaybeFunction<Value, Args> = Value | ((arg: Args) => Value)

export interface PromiseOptions<V, O = any> {
  loading: Omit<Options<O>, "type">
  success?: MaybeFunction<Omit<Options<O>, "type">, V> | undefined
  error?: MaybeFunction<Omit<Options<O>, "type">, unknown> | undefined
  finally?: (() => void | Promise<void>) | undefined
}

export interface GroupProps {
  /**
   * The human-readable label for the toast region
   */
  label?: string | undefined
}

export interface ToastGroupApi<T extends PropTypes = PropTypes, O = any> {
  /**
   * The total number of toasts
   */
  getCount: () => number
  /**
   * The toasts
   */
  getToasts: () => ToastProps[]
  /**
   * Subscribe to the toast group
   */
  subscribe: (callback: (toasts: Options<O>[]) => void) => VoidFunction

  getGroupProps: (options?: GroupProps) => T["element"]
}

export interface ToastApi<T extends PropTypes = PropTypes, O = any> {
  /**
   * The title of the toast.
   */
  title?: O | undefined
  /**
   * The description of the toast.
   */
  description?: O | undefined
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
  visible: boolean
  /**
   * Whether the toast should render a close button
   */
  closable: boolean
  /**
   * Whether the toast is paused.
   */
  paused: boolean
  /**
   * Function to pause the toast (keeping it visible).
   */
  pause: VoidFunction
  /**
   * Function to resume the toast dismissing.
   */
  resume: VoidFunction
  /**
   * Function to instantly dismiss the toast.
   */
  dismiss: VoidFunction

  getRootProps: () => T["element"]
  getTitleProps: () => T["element"]
  getGhostBeforeProps: () => T["element"]
  getGhostAfterProps: () => T["element"]
  getDescriptionProps: () => T["element"]
  getCloseTriggerProps: () => T["button"]
  getActionTriggerProps: () => T["button"]
}
