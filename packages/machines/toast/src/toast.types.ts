import type { CommonProperties, Direction, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { EventObject, Service } from "@zag-js/core"
import type { ToastStore } from "./toast.store"

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
  onClick: () => void
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
  index?: number
  /**
   * @internal
   * Whether the toast is stacked
   */
  stacked?: boolean
  /**
   * @internal
   * The event to be dispatched
   */
  message?: any
  /**
   * The gap of the toast
   */
  gap?: number
  /**
   * @internal
   * The parent of the toast
   */
  parent: Service<ToastGroupSchema>
  /**
   * @internal
   * Whether to dismiss the toast
   */
  dismiss?: boolean
}

type ToastPropsWithDefault = "type" | "parent" | "duration" | "id"

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

/* -----------------------------------------------------------------------------
 * Toast Group API
 * -----------------------------------------------------------------------------*/

export interface ToastStoreProps {
  /**
   * The placement of the toast
   * @default "bottom"
   */
  placement?: Placement
  /**
   * The maximum number of toasts
   * @default 10
   */
  max?: number
  /**
   * Whether to overlap the toasts
   */
  overlap?: boolean
  /**
   * The duration of the toast.
   * By default, it is determined by the type of the toast.
   */
  duration?: number
}

export interface ToastGroupProps extends DirectionProperty, CommonProperties {
  /**
   * Whether to pause toast when the user leaves the browser tab
   * @default false
   */
  pauseOnPageIdle?: boolean | undefined
  /**
   * The store of the toast
   */
  store: ToastStore
  /**
   * The hotkey that will move focus to the toast group
   * @default '["altKey", "KeyT"]'
   */
  hotkey?: string[] | undefined
  /**
   * The offset from the safe environment edge of the viewport
   * @default "1rem"
   */
  offsets?: string | Record<"left" | "right" | "bottom" | "top", string> | undefined
  /**
   * The duration for the toast to kept alive before it is removed.
   * Useful for exit transitions.
   *
   * @default 200
   */
  removeDelay?: number | undefined
  /**
   * The gap between the toasts
   * @default 16
   */
  gap?: number | undefined
}

type ToastGroupPropsWithDefault = "offsets" | "hotkey" | "gap" | "store"

export type ToastGroupSchema = {
  state: "stack" | "overlap"
  props: RequiredBy<ToastGroupProps, ToastGroupPropsWithDefault>
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
  }
  guard: string
  effect: string
  action: string
  event: EventObject
}

export type ToastGroupService = Service<ToastGroupSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

type MaybeFunction<Value, Args> = Value | ((arg: Args) => Value)

export interface PromiseOptions<V, O = any> {
  loading: Options<O>
  success: MaybeFunction<Options<O>, V>
  error: MaybeFunction<Options<O>, Error>
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
  getCount(): number
  /**
   * The toasts
   */
  getToasts(): ToastProps[]
  /**
   * Subscribe to the toast group
   */
  subscribe(callback: (toasts: Options<O>[]) => void): VoidFunction

  getGroupProps(options?: GroupProps): T["element"]
}

export interface ToastApi<T extends PropTypes = PropTypes, O = any> {
  /**
   * The title of the toast.
   */
  title: O
  /**
   * The description of the toast.
   */
  description: O
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
  pause(): void
  /**
   * Function to resume the toast dismissing.
   */
  resume(): void
  /**
   * Function to instantly dismiss the toast.
   */
  dismiss(): void

  getRootProps(): T["element"]
  getTitleProps(): T["element"]
  getGhostBeforeProps(): T["element"]
  getGhostAfterProps(): T["element"]
  getDescriptionProps(): T["element"]
  getCloseTriggerProps(): T["button"]
  getActionTriggerProps(): T["button"]
}
