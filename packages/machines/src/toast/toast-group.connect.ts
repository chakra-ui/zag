import { StateMachine as S } from "@ui-machines/core"
import { runIfFn } from "@core-foundation/utils/fn"
import { DOMHTMLProps, WithDataAttr } from "../__utils/types"
import { defaultPropNormalizer, PropNormalizer } from "../__utils/dom"
import { ToastGroupMachineContext } from "./toast-group.machine"
import { getToastsByPlacement, ToastMachineContext, ToastPlacement } from "./toast.machine"
import { getPlacementStyle } from "./toast.utils"

type ToastOptions = Partial<ToastMachineContext>

export function connectToastGroupMachine(
  state: S.State<ToastGroupMachineContext>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state

  return {
    count: ctx.toasts.length,

    toasts: ctx.toasts,

    toastsMap: getToastsByPlacement(ctx.toasts),

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

    dismissByPlacement(placement: ToastPlacement) {
      const toasts = this.toastsMap[placement]
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

    promise<T>(promise: Promise<T>, msgs: any, opts: ToastOptions) {
      const id = this.loading({ ...opts, type: "loading", title: msgs.loading })

      promise
        .then((response) => {
          const message = runIfFn(msgs.loading, response)
          this.success({ ...opts, id, title: message })
        })
        .catch((error) => {
          const message = runIfFn(msgs.error, error)
          this.error({ ...opts, id, title: message })
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

    getContainerProps(placement: ToastPlacement) {
      return normalize<WithDataAttr<DOMHTMLProps>>({
        id: `toast-group-${placement}`,
        "data-placement": placement,
        style: getPlacementStyle(placement),
      })
    },
  }
}
