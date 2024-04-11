import { isMachine, subscribe } from "@zag-js/core"
// import { contains } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { runIfFn, uuid } from "@zag-js/utils"
import { parts } from "./toast.anatomy"
import { dom } from "./toast.dom"
import type { GroupMachineApi, GroupSend, GroupService, GroupState, Options } from "./toast.types"
import { getGroupPlacementStyle, getToastsByPlacement } from "./toast.utils"

export function groupConnect<T extends PropTypes, O = any>(
  serviceOrState: GroupState<O> | GroupService<O>,
  send: GroupSend,
  normalize: NormalizeProps<T>,
): GroupMachineApi<T, O> {
  //

  function getState(): GroupState<O> {
    const result = isMachine(serviceOrState) ? serviceOrState.getState() : serviceOrState
    return result as GroupState<O>
  }

  function getToastsByPlacementImpl() {
    return getToastsByPlacement(getState().context.toasts)
  }

  function isVisible(id: string) {
    const toasts = getState().context.toasts
    if (!toasts.length) return false
    return !!toasts.find((toast) => toast.id == id)
  }

  function create(options: Options<O>) {
    const uid = `toast:${uuid()}`
    const id = options.id ? options.id : uid

    if (isVisible(id)) return id
    send({ type: "ADD_TOAST", toast: { ...options, id } })

    return id
  }

  function update(id: string, options: Options<O>) {
    if (!isVisible(id)) return id
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
    getCount() {
      return getState().context.count
    },
    getToasts() {
      return getState().context.toasts
    },
    getToastsByPlacement: getToastsByPlacementImpl,
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
      const toastsByPlacement = getToastsByPlacementImpl()
      const toasts = toastsByPlacement[placement]
      if (!toasts) return
      toasts.forEach((toast) => dismiss(toast.id))
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

      runIfFn(promise)
        .then((response) => {
          const successOptions = runIfFn(options.success, response)
          upsert({ ...shared, ...successOptions, id, type: "success" })
        })
        .catch((error) => {
          const errorOptions = runIfFn(options.error, error)
          upsert({ ...shared, ...errorOptions, id, type: "error" })
        })
        .finally(() => {
          options.finally?.()
        })

      return id
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
      const state = getState()
      const hotkeyLabel = state.context.hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "")
      return normalize.element({
        ...parts.group.attrs,
        dir: state.context.dir,
        tabIndex: -1,
        "aria-label": `${placement} ${label} ${hotkeyLabel}`,
        id: dom.getRegionId(placement),
        "data-placement": placement,
        "aria-live": "polite",
        role: "region",
        style: getGroupPlacementStyle(state.context, placement),
        onMouseMove() {
          if (!state.context.overlap) return
          send({ type: "REGION.POINTER_ENTER", placement })
        },
        onMouseLeave() {
          if (!state.context.overlap) return
          send({ type: "REGION.POINTER_LEAVE", placement })
        },
        onFocus() {
          send({ type: "REGION.FOCUS" })
        },
      })
    },

    subscribe(fn) {
      const state = getState()
      return subscribe(state.context.toasts, () => {
        const toasts = getToastsByPlacementImpl()[state.context.placement!] ?? []
        const contexts = toasts.map((toast) => toast.getState().context)
        fn(contexts)
      })
    },
  }
}
