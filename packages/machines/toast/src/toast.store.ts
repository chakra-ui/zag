import type { Required } from "@zag-js/types"
import { compact, hasProp, runIfFn, uuid, warn } from "@zag-js/utils"
import type {
  Options,
  ToastQueuePriority,
  PromiseOptions,
  ToastProps,
  ToastStore,
  ToastStoreProps,
  Type,
} from "./toast.types"

const withDefaults = <T extends object, D extends Partial<T>>(options: T, defaults: D): T & Required<D> => {
  return { ...defaults, ...compact(options as any) }
}

const priorities: Record<string, [ToastQueuePriority, ToastQueuePriority]> = {
  error: [1, 2],
  warning: [3, 6],
  loading: [4, 5],
  success: [5, 7],
  info: [6, 8],
}

const DEFAULT_TYPE: Type = "info"

const getPriorityForType = (type?: Type, hasAction?: boolean): ToastQueuePriority => {
  const key = type ?? DEFAULT_TYPE
  const [actionable, nonActionable] = hasProp(priorities, key) ? priorities[key] : priorities[DEFAULT_TYPE]
  return hasAction ? actionable : nonActionable
}

const sortToastsByPriority = <V>(toastArray: Partial<ToastProps<V>>[]): Partial<ToastProps<V>>[] => {
  return toastArray.sort((a, b) => {
    const priorityA = a.priority ?? getPriorityForType(a.type, !!a.action)
    const priorityB = b.priority ?? getPriorityForType(b.type, !!b.action)
    return priorityA - priorityB
  })
}

export function createToastStore<V = any>(props: ToastStoreProps = {}): ToastStore<V> {
  const attrs = withDefaults(props, {
    placement: "bottom",
    overlap: false,
    max: 24,
    gap: 16,
    offsets: "1rem",
    hotkey: ["altKey", "KeyT"],
    removeDelay: 200,
    pauseOnPageIdle: true,
  })

  let subscribers: Array<(...args: any[]) => void> = []
  let toasts: Partial<ToastProps<V>>[] = []
  let dismissedToasts = new Set<string>()
  let toastQueue: Partial<ToastProps<V>>[] = []
  const closingToasts = new Set<string>()
  const promiseTokens = new Map<string, symbol>()
  let paused = false

  const subscribe = (subscriber: (...args: any[]) => void) => {
    subscribers.push(subscriber)

    let active = true

    return () => {
      if (!active) return
      active = false
      const index = subscribers.indexOf(subscriber)
      if (index !== -1) subscribers.splice(index, 1)
    }
  }

  const notifications: Partial<ToastProps<V>>[] = []
  let publishing = false

  const publish = (...data: Partial<ToastProps<V>>[]) => {
    notifications.push(...data)

    if (publishing) return data
    publishing = true

    try {
      while (notifications.length) {
        const next = notifications.shift()!
        subscribers.slice().forEach((subscriber) => subscriber(next))
      }
    } finally {
      publishing = false
      notifications.length = 0
    }

    return data
  }

  const addToast = (data: Partial<ToastProps<V>>) => {
    if (toasts.length >= attrs.max) {
      toastQueue.push(data)
      return
    }

    toasts.unshift(data)
    publish(data)
  }

  const processQueue = () => {
    toastQueue = sortToastsByPriority(toastQueue)

    while (toastQueue.length > 0 && toasts.length < attrs.max) {
      const nextToast = toastQueue.shift()
      if (nextToast) {
        const toast = { ...nextToast, paused: paused || nextToast.paused }
        toasts.unshift(toast)
        publish(toast)
      }
    }
  }

  const create = (data: Options<V>) => {
    const id = data.id ?? `toast:${uuid()}`
    const exists = toasts.find((toast) => toast.id === id) ?? toastQueue.find((toast) => toast.id === id)

    if (closingToasts.has(id)) return id

    if (hasProp(data, "promise") && data.promise !== exists?.promise) promiseTokens.delete(id)
    dismissedToasts.delete(id)

    if (exists) {
      const next = { ...exists, ...data, id }

      if (toasts.some((toast) => toast.id === id)) {
        toasts = toasts.map((toast) => (toast.id === id ? next : toast))
        publish(next)
      } else {
        toastQueue = toastQueue.map((toast) => (toast.id === id ? next : toast))
      }
    } else {
      const newToast = {
        id,
        duration: attrs.duration,
        removeDelay: attrs.removeDelay,
        type: DEFAULT_TYPE,
        ...data,
        stacked: !attrs.overlap,
        gap: attrs.gap,
        paused,
      }

      const priority = newToast.priority ?? getPriorityForType(newToast.type, !!newToast.action)
      addToast({ ...newToast, priority })
    }

    return id
  }

  const remove = (id?: string) => {
    const removed =
      id == null ? [...toasts, ...toastQueue] : [...toasts, ...toastQueue].filter((toast) => toast.id === id)
    const visible = id == null ? toasts : toasts.filter((toast) => toast.id === id)

    removed.forEach((toast) => {
      dismissedToasts.add(toast.id!)
      closingToasts.delete(toast.id!)
      promiseTokens.delete(toast.id!)
    })

    if (id != null) dismissedToasts.add(id)

    toasts = id == null ? [] : toasts.filter((toast) => toast.id !== id)
    toastQueue = id == null ? [] : toastQueue.filter((toast) => toast.id !== id)

    // Commit removal before notifying subscribers or promoting queued toasts.
    if (id != null && !visible.length) publish({ id, dismiss: true })
    publish(...visible.map((toast) => ({ id: toast.id, dismiss: true })))
    processQueue()

    return id
  }

  const error = (data?: Omit<Options<V>, "type">) => {
    return create({ ...data, type: "error" })
  }

  const success = (data?: Omit<Options<V>, "type">) => {
    return create({ ...data, type: "success" })
  }

  const info = (data?: Omit<Options<V>, "type">) => {
    return create({ ...data, type: "info" })
  }

  const warning = (data?: Omit<Options<V>, "type">) => {
    return create({ ...data, type: "warning" })
  }

  const loading = (data?: Omit<Options<V>, "type">) => {
    return create({ ...data, type: "loading" })
  }

  const getVisibleToasts = () => {
    return toasts.filter((toast) => !dismissedToasts.has(toast.id!))
  }

  const getCount = () => {
    return toasts.length
  }

  const promise = <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: PromiseOptions<T, V>,
    shared: Omit<Options<V>, "type"> = {},
  ) => {
    if (!options || !options.loading) {
      warn("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified")
      return
    }

    const id = create({
      ...shared,
      ...options.loading,
      promise,
      type: "loading",
    })

    const token = Symbol()
    const current = toasts.find((toast) => toast.id === id) ?? toastQueue.find((toast) => toast.id === id)
    if (current?.promise === promise && !closingToasts.has(id)) promiseTokens.set(id, token)

    const isCurrent = () => promiseTokens.get(id) === token && !closingToasts.has(id)

    let removable = true
    let result: ["resolve", T] | ["reject", unknown]

    const prom = runIfFn(promise)
      .then(async (response: any) => {
        result = ["resolve", response]
        if (isHttpResponse(response) && !response.ok) {
          //
          removable = false
          const errorOptions = runIfFn(options.error, `HTTP Error! status: ${response.status}`)
          if (isCurrent()) create({ ...shared, ...errorOptions, id, type: "error" })
          //
        } else if (options.success !== undefined) {
          removable = false
          const successOptions = runIfFn(options.success, response)
          if (isCurrent()) create({ ...shared, ...successOptions, id, type: successOptions.type ?? "success" })
        }
      })
      .catch(async (error) => {
        result = ["reject", error]
        if (options.error !== undefined) {
          removable = false
          const errorOptions = runIfFn(options.error, error)
          if (isCurrent()) create({ ...shared, ...errorOptions, id, type: "error" })
        }
      })
      .finally(() => {
        if (removable && isCurrent()) {
          remove(id)
        }

        if (promiseTokens.get(id) === token) promiseTokens.delete(id)

        options.finally?.()
      })

    const unwrap = () =>
      new Promise<T>((resolve, reject) =>
        prom.then(() => (result[0] === "reject" ? reject(result[1]) : resolve(result[1]))).catch(reject),
      )

    return { id, unwrap }
  }

  const update: ToastStore<V>["update"] = (id, data) => {
    if (closingToasts.has(id)) return id
    if (typeof data !== "function") return create({ ...data, id })

    const current = toasts.find((toast) => toast.id === id) ?? toastQueue.find((toast) => toast.id === id)
    if (!current) return id

    const next = { ...data({ ...current }), id }

    // The updater may remove, update, or promote its toast. Read the store again.
    if (closingToasts.has(id)) return id
    if (toasts.some((toast) => toast.id === id)) return create(next)
    if (!toastQueue.some((toast) => toast.id === id)) return id

    // Updating a queued toast must not publish it or move it into the visible list.
    toastQueue = toastQueue.map((toast) => (toast.id === id ? { ...toast, ...next } : toast))
    return id
  }

  const changeToasts = (data: Partial<ToastProps<V>>, id?: string) => {
    const changed: Partial<ToastProps<V>>[] = []

    toasts = toasts.map((toast) => {
      if ((id != null && toast.id !== id) || closingToasts.has(toast.id!)) return toast

      const next = { ...toast, ...data }
      changed.push(next)

      return next
    })

    toastQueue = toastQueue.map((toast) => (id == null || toast.id === id ? { ...toast, ...data } : toast))

    publish(...changed)
  }

  const pause = (id?: string) => {
    if (id == null) paused = true

    changeToasts({ paused: true }, id)
  }

  const resume = (id?: string) => {
    if (id == null) paused = false

    changeToasts({ paused: false }, id)
  }

  const dismiss = (id?: string) => {
    const queued = toastQueue.filter((toast) => id == null || toast.id === id)
    toastQueue = toastQueue.filter((toast) => id != null && toast.id !== id)

    queued.forEach((toast) => {
      dismissedToasts.add(toast.id!)
      promiseTokens.delete(toast.id!)
    })

    const changed = toasts.filter((toast) => (id == null || toast.id === id) && !closingToasts.has(toast.id!))
    changed.forEach((toast) => closingToasts.add(toast.id!))
    toasts = toasts.map((toast) => (closingToasts.has(toast.id!) ? { ...toast, message: "DISMISS" } : toast))

    publish(...changed.map((toast) => ({ ...toast, message: "DISMISS" })))
  }

  const isVisible = (id: string) => {
    return !dismissedToasts.has(id) && !!toasts.find((toast) => toast.id === id)
  }

  const isDismissed = (id: string) => {
    return dismissedToasts.has(id)
  }

  const expand = () => changeToasts({ stacked: true })

  const collapse = () => changeToasts({ stacked: false })

  return {
    attrs,
    subscribe,
    create,
    update,
    remove,
    dismiss,
    error,
    success,
    info,
    warning,
    loading,
    getVisibleToasts,
    getCount,
    promise,
    pause,
    resume,
    isVisible,
    isDismissed,
    expand,
    collapse,
  }
}

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === "object" &&
    "ok" in data &&
    typeof data.ok === "boolean" &&
    "status" in data &&
    typeof data.status === "number"
  )
}
