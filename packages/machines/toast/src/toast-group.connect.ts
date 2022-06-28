import { subscribe } from "@zag-js/core"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { runIfFn, uuid } from "@zag-js/utils"
import { dom } from "./toast.dom"
import {
  GroupMachineContext,
  GroupProps,
  GroupSend,
  GroupState,
  Placement,
  PromiseOptions,
  Toaster,
  Options,
} from "./toast.types"
import { getGroupPlacementStyle, getToastsByPlacement } from "./toast.utils"

export let toaster: Toaster = {} as any

export function groupConnect<T extends PropTypes>(state: GroupState, send: GroupSend, normalize: NormalizeProps<T>) {
  const group = {
    count: state.context.count,
    toasts: state.context.toasts,
    toastsByPlacement: getToastsByPlacement(state.context.toasts),

    isVisible(id: string) {
      if (!state.context.toasts.length) return false
      return !!state.context.toasts.find((toast) => toast.id == id)
    },

    create(options: Options) {
      const uid = `toast:${uuid()}`
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

    promise<T>(promise: Promise<T>, options: PromiseOptions<T>, shared: Options = {}) {
      const id = group.loading({ ...shared, ...options.loading })

      promise
        .then((response) => {
          const successOptions = runIfFn(options.success, response)
          group.success({ ...shared, ...successOptions, id })
        })
        .catch((error) => {
          const errorOptions = runIfFn(options.error, error)
          group.error({ ...shared, ...errorOptions, id })
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
      return normalize.element({
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
    Object.assign(toaster, group)
  }

  return group
}
