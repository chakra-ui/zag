import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { runIfFn } from "@ui-machines/utils"
import { dom } from "./toast.dom"
import {
  ToastGlobalConnect,
  ToastGroupContainerProps,
  ToastGroupMachineContext,
  ToastOptions,
  ToastPlacement,
  ToastPromiseMessages,
  ToastPromiseOptions,
} from "./toast.types"
import { getGroupPlacementStyle, getToastsByPlacement } from "./toast.utils"

export let toastGlobalConnect: ToastGlobalConnect

export function toastGroupConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<ToastGroupMachineContext>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  const group = {
    count: ctx.toasts.length,
    toasts: ctx.toasts,
    toastsByPlacement: getToastsByPlacement(ctx.toasts),

    isVisible(id: string) {
      if (!ctx.toasts.length) return false
      return !!ctx.toasts.find((toast) => toast.id == id)
    },

    create(options: ToastOptions) {
      const uid = "toast-" + Math.random().toString(36).substr(2, 9)
      const id = options.id ? options.id : uid

      if (group.isVisible(id)) return
      send({ type: "ADD_TOAST", toast: { ...options, id } })

      return id
    },

    upsert(options: ToastOptions) {
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

    dismissByPlacement(placement: ToastPlacement) {
      const toasts = group.toastsByPlacement[placement]
      if (toasts) {
        toasts.forEach((toast) => group.dismiss(toast.id))
      }
    },

    update(id: string, options: ToastOptions) {
      if (!group.isVisible(id)) return
      send({ type: "UPDATE_TOAST", id, toast: options })
      return id
    },

    loading(options: ToastOptions) {
      options.type = "loading"
      return group.upsert(options)
    },

    success(options: ToastOptions) {
      options.type = "success"
      return group.upsert(options)
    },

    error(options: ToastOptions) {
      options.type = "error"
      return group.upsert(options)
    },

    promise<T>(promise: Promise<T>, msgs: ToastPromiseMessages, opts: ToastPromiseOptions = {}) {
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

    getContainerProps(props: ToastGroupContainerProps) {
      const { placement } = props
      return normalize.element<T>({
        id: dom.getGroupContainerId(ctx, placement),
        "data-placement": placement,
        "aria-live": "polite",
        role: "region",
        style: getGroupPlacementStyle(ctx, placement),
      })
    },

    createPortal() {
      const doc = dom.getDoc(ctx)
      const exist = dom.getPortalEl(ctx)
      if (exist) return exist
      const portal = dom.createPortalEl(ctx)
      doc.body.appendChild(portal)
      return portal
    },
  }

  if (!state.matches("unknown")) {
    toastGlobalConnect = {
      count: group.count,
      isVisible: group.isVisible,
      upsert: group.upsert,
      dismiss: group.dismiss,
      remove: group.remove,
      promise: group.promise,
    }
  }

  return group
}
