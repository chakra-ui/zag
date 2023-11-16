import { subscribe } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { runIfFn, uuid } from "@zag-js/utils"
import { parts } from "./toast.anatomy"
import { dom } from "./toast.dom"
import type {
  DefaultGenericOptions,
  GenericOptions,
  GroupMachineApi,
  GroupSend,
  GroupState,
  Options,
} from "./toast.types"
import { getGroupPlacementStyle, getToastsByPlacement } from "./toast.utils"

export function groupConnect<T extends PropTypes, O extends GenericOptions = DefaultGenericOptions>(
  state: GroupState<O>,
  send: GroupSend,
  normalize: NormalizeProps<T>,
): GroupMachineApi<T, O> {
  //
  const toastsByPlacement = getToastsByPlacement(state.context.toasts)

  function isVisible(id: string) {
    if (!state.context.toasts.length) return false
    return !!state.context.toasts.find((toast) => toast.id == id)
  }

  function create(options: Options<O>) {
    const uid = `toast:${uuid()}`
    const id = options.id ? options.id : uid

    if (isVisible(id)) return
    send({ type: "ADD_TOAST", toast: { ...options, id } })

    return id
  }

  function update(id: string, options: Options<O>) {
    if (!isVisible(id)) return
    send({ type: "UPDATE_TOAST", id, toast: options })
    return id
  }

  function upsert(options: Options<O>) {
    const { id } = options
    const visible = id ? isVisible(id) : false
    if (visible && id != null) {
      return update(id, options)
    } else {
      return create(options)
    }
  }

  function dismiss(id?: string) {
    if (id == null) {
      send("DISMISS_ALL")
    } else if (isVisible(id)) {
      send({ type: "DISMISS_TOAST", id })
    }
  }

  return {
    count: state.context.count,
    toasts: state.context.toasts,
    toastsByPlacement,
    isVisible,

    create,
    update,
    upsert,
    dismiss,

    remove(id) {
      if (id == null) {
        send("REMOVE_ALL")
      } else if (isVisible(id)) {
        send({ type: "REMOVE_TOAST", id })
      }
    },

    dismissByPlacement(placement) {
      const toasts = toastsByPlacement[placement]
      if (toasts) {
        toasts.forEach((toast) => dismiss(toast.id))
      }
    },
    loading(options) {
      return upsert({ ...options, type: "loading" })
    },
    success(options) {
      return upsert({ ...options, type: "success" })
    },
    error(options) {
      return upsert({ ...options, type: "error" })
    },

    promise(promise, options, shared = {}) {
      const id = upsert({ ...shared, ...options.loading, type: "loading" })

      promise
        .then((response) => {
          const successOptions = runIfFn(options.success, response)
          upsert({ ...shared, ...successOptions, id, type: "success" })
        })
        .catch((error) => {
          const errorOptions = runIfFn(options.error, error)
          upsert({ ...shared, ...errorOptions, id, type: "error" })
        })

      return promise
    },

    pause(id) {
      if (id == null) {
        send("PAUSE_ALL")
      } else if (isVisible(id)) {
        send({ type: "PAUSE_TOAST", id })
      }
    },

    resume(id) {
      if (id == null) {
        send("RESUME_ALL")
      } else if (isVisible(id)) {
        send({ type: "RESUME_TOAST", id })
      }
    },

    getGroupProps(options) {
      const { placement, label = "Notifications" } = options
      return normalize.element({
        ...parts.group.attrs,
        dir: state.context.dir,
        tabIndex: -1,
        "aria-label": `${placement} ${label}`,
        id: dom.getGroupId(placement),
        "data-placement": placement,
        "aria-live": "polite",
        role: "region",
        style: getGroupPlacementStyle(state.context, placement),
      })
    },

    subscribe(fn) {
      return subscribe(state.context.toasts, () => fn(state.context.toasts))
    },
  }
}
