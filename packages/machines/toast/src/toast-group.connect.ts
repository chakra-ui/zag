import { StateMachine as S } from "@ui-machines/core"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { runIfFn } from "tiny-fn"
import { dom } from "./toast.dom"
import { ToastGroupContainerProps, ToastGroupMachineContext, ToastOptions, ToastPlacement, ToastPromiseMessages, ToastPromiseOptions } from "./toast.types"
import { getGroupPlacementStyle, getToastsByPlacement } from "./toast.utils"

export function toastGroupConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<ToastGroupMachineContext>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state

  return {
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

      if (this.isVisible(id)) return
      send({ type: "ADD_TOAST", toast: { ...options, id } })

      return id
    },

    upsert(options: ToastOptions) {
      const { id } = options
      const isVisible = id ? this.isVisible(id) : false
      if (isVisible && id != null) {
        return this.update(id, options)
      } else {
        return this.create(options)
      }
    },

    dismiss(id?: string) {
      if (id == null) {
        send("DISMISS_ALL")
      } else if (this.isVisible(id)) {
        send({ type: "DISMISS_TOAST", id })
      }
    },

    remove(id?: string) {
      if (id == null) {
        send("REMOVE_ALL")
      } else if (this.isVisible(id)) {
        send({ type: "REMOVE_TOAST", id })
      }
    },

    dismissByPlacement(placement: ToastPlacement) {
      const toasts = this.toastsByPlacement[placement]
      if (toasts) {
        toasts.forEach((toast) => this.dismiss(toast.id))
      }
    },

    update(id: string, options: ToastOptions) {
      if (!this.isVisible(id)) return
      send({ type: "UPDATE_TOAST", id, toast: options })
      return id
    },

    loading(options: ToastOptions) {
      options.type = "loading"
      return this.upsert(options)
    },

    success(options: ToastOptions) {
      options.type = "success"
      return this.upsert(options)
    },

    error(options: ToastOptions) {
      options.type = "error"
      return this.upsert(options)
    },

    promise<T>(promise: Promise<T>, msgs: ToastPromiseMessages, opts: ToastPromiseOptions = {}) {
      const id = this.loading({ ...opts, ...opts?.loading, type: "loading", title: msgs.loading })

      promise
        .then((response) => {
          const message = runIfFn(msgs.loading, response)
          this.success({ ...opts, ...opts?.success, id, title: message })
        })
        .catch((error) => {
          const message = runIfFn(msgs.error, error)
          this.error({ ...opts, ...opts?.error, id, title: message })
        })

      return promise
    },

    pause(id?: string) {
      if (id == null) {
        send("PAUSE_ALL")
      } else if (this.isVisible(id)) {
        send({ type: "PAUSE_TOAST", id })
      }
    },

    resume(id?: string) {
      if (id == null) {
        send("RESUME_ALL")
      } else if (this.isVisible(id)) {
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

    setupPortal() {
      const doc = dom.getDoc(ctx)
      const exist = dom.getPortalEl(ctx)
      if (exist) return exist
      const portal = dom.createPortalEl(ctx)
      doc.body.appendChild(portal)
      return portal
    },
  }
}
