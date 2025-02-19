import { runIfFn, uuid } from "@zag-js/utils"
import type { Options, Placement, ToastProps, ToastStoreProps } from "./toast.types"

type MaybeFunction<V, A> = V | ((arg: A) => V)

export function createToastStore<V = any>(props: ToastStoreProps) {
  const placement: Placement = props.placement ?? "bottom"
  const overlap = !!props.overlap
  const duration = props.duration
  const max = props.max ?? 10

  let subscribers: Array<(...args: any[]) => void> = []
  let toasts: Partial<ToastProps<V>>[] = []
  let dismissedToasts = new Set<string>()

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
    if (toasts.length >= max) return
    publish(data)
    toasts.unshift(data)
  }

  const create = (data: Options<V>) => {
    const id = data.id ?? `toast:${uuid()}`
    const exists = toasts.find((toast) => toast.id === id)

    const closable = data.closable ?? true
    if (dismissedToasts.has(id)) dismissedToasts.delete(id)

    if (exists) {
      toasts = toasts.map((toast) => {
        if (toast.id === id) {
          return publish({ ...toast, ...data, id, closable })
        }

        return toast
      })
    } else {
      addToast({ ...data, closable, id, stacked: !overlap, duration })
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
    } else {
      subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }))
      toasts = toasts.filter((toast) => toast.id !== id)
    }
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
    options?: {
      loading?: Omit<Options<V>, "type">
      success?: MaybeFunction<Omit<Options<V>, "type">, T>
      error?: MaybeFunction<Omit<Options<V>, "type">, unknown>
      finally?: (() => void | Promise<void>) | undefined
    },
    shared: Omit<Options<V>, "type"> = {},
  ) => {
    if (!options) return

    let id: string | undefined = undefined
    if (options.loading !== undefined) {
      id = create({
        ...shared,
        ...options.loading,
        promise,
        type: "loading",
      })
    }

    let removable = id !== undefined
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
          create({ ...shared, ...successOptions, id, type: "success" })
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
          id = undefined
        }
        options.finally?.()
      })

    const unwrap = () =>
      new Promise<T>((resolve, reject) =>
        prom.then(() => (result[0] === "reject" ? reject(result[1]) : resolve(result[1]))).catch(reject),
      )

    if (typeof id !== "string" && typeof id !== "number") {
      // cannot Object.assign on undefined
      return { unwrap }
    } else {
      return Object.assign(id, { unwrap })
    }
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
    placement,
    overlap,
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

export type ToastStore = ReturnType<typeof createToastStore>

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
