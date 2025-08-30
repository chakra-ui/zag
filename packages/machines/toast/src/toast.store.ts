import type { Required } from "@zag-js/types"
import { compact, runIfFn, uuid, warn } from "@zag-js/utils"
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
  warning: [2, 6],
  loading: [3, 4],
  success: [4, 7],
  info: [5, 8],
}

const DEFAULT_TYPE: Type = "info"

const getPriorityForType = (type?: Type, hasAction?: boolean): ToastQueuePriority => {
  const [actionable, nonActionable] = priorities[type ?? DEFAULT_TYPE] ?? [5, 8]
  return hasAction ? actionable : nonActionable
}

const sortToastsByPriority = <V>(toastArray: Partial<ToastProps<V>>[]): Partial<ToastProps<V>>[] => {
  return toastArray.sort((a, b) => {
    const priorityA = a.priority ?? getPriorityForType(a.type, !!a.action)
    const priorityB = b.priority ?? getPriorityForType(b.type, !!b.action)
    return priorityA - priorityB
  })
}

export function createToastStore<V = any>(props: ToastStoreProps): ToastStore<V> {
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

  const subscribe = (subscriber: (...args: any[]) => void) => {
    subscribers.push(subscriber)
    return () => {
      const index = subscribers.indexOf(subscriber)
      subscribers.splice(index, 1)
    }
  }

  const publish = (data: Partial<ToastProps<V>>) => {
    subscribers.forEach((subscriber) => subscriber(data))
    return data
  }

  const addToast = (data: Partial<ToastProps<V>>) => {
    if (toasts.length >= attrs.max) {
      toastQueue.push(data)
      return
    }
    publish(data)
    toasts.unshift(data)
  }

  const processQueue = () => {
    while (toastQueue.length > 0 && toasts.length < attrs.max) {
      toastQueue = sortToastsByPriority(toastQueue)
      const nextToast = toastQueue.shift()
      if (nextToast) {
        publish(nextToast)
        toasts.unshift(nextToast)
      }
    }
  }

  const create = (data: Options<V>) => {
    const id = data.id ?? `toast:${uuid()}`
    const exists = toasts.find((toast) => toast.id === id)

    if (dismissedToasts.has(id)) dismissedToasts.delete(id)

    if (exists) {
      toasts = toasts.map((toast) => {
        if (toast.id === id) {
          return publish({ ...toast, ...data, id })
        }

        return toast
      })
    } else {
      const newToast = {
        id,
        duration: attrs.duration,
        removeDelay: attrs.removeDelay,
        type: DEFAULT_TYPE,
        ...data,
        stacked: !attrs.overlap,
        gap: attrs.gap,
      }
      const priority = newToast.priority ?? getPriorityForType(newToast.type, !!newToast.action)
      addToast({ ...newToast, priority })
    }

    return id
  }

  const remove = (id?: string) => {
    dismissedToasts.add(id!)

    if (!id) {
      toasts.forEach((toast) => {
        subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }))
      })
      toasts = []
      toastQueue = []
    } else {
      subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }))
      toasts = toasts.filter((toast) => toast.id !== id)
      processQueue()
    }
    return id
  }

  const error = (data?: Omit<Options<V>, "type">) => {
    const priority = data?.priority ?? getPriorityForType("error", !!data?.action)
    return create({ ...data, type: "error", priority })
  }

  const success = (data?: Omit<Options<V>, "type">) => {
    const priority = data?.priority ?? getPriorityForType("success", !!data?.action)
    return create({ ...data, type: "success", priority })
  }

  const info = (data?: Omit<Options<V>, "type">) => {
    const priority = data?.priority ?? getPriorityForType("info", !!data?.action)
    return create({ ...data, type: "info", priority })
  }

  const warning = (data?: Omit<Options<V>, "type">) => {
    const priority = data?.priority ?? getPriorityForType("warning", !!data?.action)
    return create({ ...data, type: "warning", priority })
  }

  const loading = (data?: Omit<Options<V>, "type">) => {
    const priority = data?.priority ?? getPriorityForType("loading", !!data?.action)
    return create({ ...data, type: "loading", priority })
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

    let removable = true
    let result: ["resolve", T] | ["reject", unknown]

    const prom = runIfFn(promise)
      .then(async (response: any) => {
        result = ["resolve", response]
        if (isHttpResponse(response) && !response.ok) {
          //
          removable = false
          const errorOptions = runIfFn(options.error, `HTTP Error! status: ${response.status}`)
          create({ ...shared, ...errorOptions, id, type: "error" })
          //
        } else if (options.success !== undefined) {
          removable = false
          const successOptions = runIfFn(options.success, response)
          create({ ...shared, ...successOptions, id, type: successOptions.type ?? "success" })
        }
      })
      .catch(async (error) => {
        result = ["reject", error]
        if (options.error !== undefined) {
          removable = false
          const errorOptions = runIfFn(options.error, error)
          create({ ...shared, ...errorOptions, id, type: "error" })
        }
      })
      .finally(() => {
        if (removable) {
          remove(id)
        }
        options.finally?.()
      })

    const unwrap = () =>
      new Promise<T>((resolve, reject) =>
        prom.then(() => (result[0] === "reject" ? reject(result[1]) : resolve(result[1]))).catch(reject),
      )

    return { id, unwrap }
  }

  const update = (id: string, data: Omit<Options, "id">) => {
    return create({ id, ...data })
  }

  const pause = (id?: string) => {
    if (id != null) {
      toasts = toasts.map((toast) => {
        if (toast.id === id) return publish({ ...toast, message: "PAUSE" })
        return toast
      })
    } else {
      toasts = toasts.map((toast) => publish({ ...toast, message: "PAUSE" }))
    }
  }

  const resume = (id?: string) => {
    if (id != null) {
      toasts = toasts.map((toast) => {
        if (toast.id === id) return publish({ ...toast, message: "RESUME" })
        return toast
      })
    } else {
      toasts = toasts.map((toast) => publish({ ...toast, message: "RESUME" }))
    }
  }

  const dismiss = (id?: string) => {
    if (id != null) {
      toasts = toasts.map((toast) => {
        if (toast.id === id) return publish({ ...toast, message: "DISMISS" })
        return toast
      })
    } else {
      toasts = toasts.map((toast) => publish({ ...toast, message: "DISMISS" }))
    }
  }

  const isVisible = (id: string) => {
    return !dismissedToasts.has(id) && !!toasts.find((toast) => toast.id === id)
  }

  const isDismissed = (id: string) => {
    return dismissedToasts.has(id)
  }

  const expand = () => {
    toasts = toasts.map((toast) => publish({ ...toast, stacked: true }))
  }

  const collapse = () => {
    toasts = toasts.map((toast) => publish({ ...toast, stacked: false }))
  }

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
