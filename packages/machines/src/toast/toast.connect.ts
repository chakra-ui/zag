import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { DOMHTMLProps, WithDataAttr } from "../type-utils"
import { ToastGroupMachineContext } from "./toast-group.machine"
import { ToastMachineContext, ToastPlacement } from "./toast.machine"

export function connectToastMachine(
  state: S.State<ToastGroupMachineContext>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state

  return {
    isToastVisible(id: string) {
      if (!ctx.toasts.length) return false
      return !!ctx.toasts.find((toast) => toast.id == id)
    },

    addToast(options: Partial<ToastMachineContext>) {
      const uid = "toast-" + Math.random().toString(36).substr(2, 9)
      const id = options.id ? options.id : uid

      if (this.isToastVisible(id)) return
      send({ type: "ADD_TOAST", toast: { ...options, id } })

      return id
    },

    dismissToast(id: string) {
      if (!this.isToastVisible(id)) return
      send({ type: "DISMISS_TOAST", id })
    },

    dismissAll() {
      send("DISMISS_ALL")
    },

    updateToast(id: string, options: Partial<ToastMachineContext>) {
      if (!this.isToastVisible(id)) return
      send({ type: "UPDATE_TOAST", id, toast: options })
    },

    // promise<T>(promise: Promise<T>, messages: any, options: any) {
    //   promise.then((res) => {}).catch((err) => {})
    //   return promise
    // },

    getContainerProps(placement: ToastPlacement) {
      return normalize<WithDataAttr<DOMHTMLProps>>({
        id: `toast-group-${placement}`,
        "data-placement": placement,
        style: getPlacementStyle(placement),
      })
    },
  }
}

const placementMap = {
  top: "calc(env(safe-area-inset-top) + 1rem)",
  left: "calc(env(safe-area-inset-left) + 1rem)",
  right: "calc(env(safe-area-inset-right) + 1rem)",
  bottom: "calc(env(safe-area-inset-bottom) + 1rem)",
}

function getPlacementStyle(placement: ToastPlacement): DOMHTMLProps["style"] {
  const isTopOrBottom = placement === "top" || placement === "bottom"

  const styles = Object.fromEntries(
    Object.entries(placementMap).filter(([key]) => placement.includes(key)),
  )

  return {
    ...styles,
    position: "fixed",
    zIndex: 9999,
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    margin: isTopOrBottom ? "0 auto" : undefined,
  }
}
