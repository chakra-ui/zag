import { StateMachine as S, subscribe } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { runIfFn } from "@ui-machines/utils"
import { dom } from "./toast.dom"
import {
  GlobalConnect,
  GroupProps,
  GroupMachineContext,
  Options,
  Placement,
  PromiseMessages,
  PromiseOptions,
} from "./toast.types"
import { getGroupPlacementStyle, getToastsByPlacement } from "./toast.utils"

export let toastGlobalConnect: GlobalConnect

export function groupConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<GroupMachineContext>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const group = {
    count: state.context.count,
    toasts: state.context.toasts,
    toastsByPlacement: getToastsByPlacement(state.context.toasts),

    isVisible(id: string) {
      if (!state.context.toasts.length) return false
      return !!state.context.toasts.find((toast) => toast.id == id)
    },

    create(options: Options) {
      const uid = "toast-" + Math.random().toString(36).substring(2, 9)
      const id = options.id ? options.id : uid

      if (group.isVisible(id)) return
      send({ type: "ADD_TOAST", toast: { ...options, id } })

      return id
    },

    upsert(options: Options) {
      const { id } = options
      const isVisible = id ? group.isVisible(id) : false
      if (isVisible && id != null) {
        return group.update(id, options)
      } else {
        return group.create(options)
      }
    },

    dismiss(id?: string) {
      if (id == null) {
        send("DISMISS_ALL")
      } else if (group.isVisible(id)) {
        send({ type: "DISMISS_TOAST", id })
      }
    },

    remove(id?: string) {
      if (id == null) {
        send("REMOVE_ALL")
      } else if (group.isVisible(id)) {
        send({ type: "REMOVE_TOAST", id })
      }
    },

    dismissByPlacement(placement: Placement) {
      const toasts = group.toastsByPlacement[placement]
      if (toasts) {
        toasts.forEach((toast) => group.dismiss(toast.id))
      }
    },

    update(id: string, options: Options) {
      if (!group.isVisible(id)) return
      send({ type: "UPDATE_TOAST", id, toast: options })
      return id
    },

    loading(options: Options) {
      options.type = "loading"
      return group.upsert(options)
    },

    success(options: Options) {
      options.type = "success"
      return group.upsert(options)
    },

    error(options: Options) {
      options.type = "error"
      return group.upsert(options)
    },

    promise<T>(promise: Promise<T>, msgs: PromiseMessages, opts: PromiseOptions = {}) {
      const id = group.loading({ ...opts, ...opts?.loading, type: "loading", title: msgs.loading })

      promise
        .then((response) => {
          const message = runIfFn(msgs.loading, response)
          group.success({ ...opts, ...opts?.success, id, title: message })
        })
        .catch((error) => {
          const message = runIfFn(msgs.error, error)
          group.error({ ...opts, ...opts?.error, id, title: message })
        })

      return promise
    },

    pause(id?: string) {
      if (id == null) {
        send("PAUSE_ALL")
      } else if (group.isVisible(id)) {
        send({ type: "PAUSE_TOAST", id })
      }
    },

    resume(id?: string) {
      if (id == null) {
        send("RESUME_ALL")
      } else if (group.isVisible(id)) {
        send({ type: "RESUME_TOAST", id })
      }
    },

    getGroupProps(options: GroupProps) {
      const { placement, label = "Notifications" } = options
      return normalize.element<T>({
        tabIndex: -1,
        "aria-label": label,
        id: dom.getGroupId(placement),
        "data-placement": placement,
        "aria-live": "polite",
        role: "region",
        style: getGroupPlacementStyle(state.context, placement),
      })
    },

    createPortal() {
      const doc = dom.getDoc(state.context)
      const exist = dom.getPortalEl(state.context)
      if (exist) return exist
      const portal = dom.createPortalEl(state.context)
      doc.body.appendChild(portal)
      return portal
    },

    subscribe(fn: (toasts: GroupMachineContext["toasts"]) => void) {
      return subscribe(state.context.toasts, () => fn(state.context.toasts))
    },
  }

  if (!state.matches("unknown")) {
    toastGlobalConnect = {
      count: group.count,
      isVisible: group.isVisible,
      upsert: group.upsert,
      dismiss: group.dismiss,
      success: group.success,
      error: group.error,
      loading: group.loading,
      remove: group.remove,
      promise: group.promise,
    }
  }

  return group
}
