import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/utils"
import { dom } from "./dialog.dom"
import { DialogMachineContext, DialogMachineState } from "./dialog.machine"

export function dialogConnect<T extends PropTypes = ReactPropTypes>(
  state: S.State<DialogMachineContext, DialogMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = normalizeProp,
) {
  const { context: ctx } = state
  const { "aria-label": ariaLabel } = ctx

  const isOpen = state.matches("open")

  return {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    triggerProps: normalize.button<T>({
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      type: "button",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send(isOpen ? "CLOSE" : "OPEN")
      },
    }),
    overlayProps: normalize.element<T>({
      "aria-hidden": true,
      id: dom.getOverlayId(ctx),
      onClick(event) {
        event.preventDefault()
        event.stopPropagation()
        if (!ctx.isTopMostDialog || !ctx.closeOnOverlayClick) return
        send("CLOSE")
      },
    }),
    contentProps: normalize.element<T>({
      role: ctx.role,
      id: dom.getContentId(ctx),
      tabIndex: -1,
      "aria-modal": ariaAttr(ctx.isTopMostDialog),
      "aria-label": ariaLabel || undefined,
      "aria-labelledby": ariaLabel ? undefined : ctx.hasTitle ? dom.getTitleId(ctx) : undefined,
      "aria-describedby": ctx.hasDescription ? dom.getDescriptionId(ctx) : undefined,
      onClick(event) {
        event.stopPropagation()
      },
    }),
    titleProps: normalize.element<T>({
      id: dom.getTitleId(ctx),
    }),
    descriptionProps: normalize.element<T>({
      id: dom.getDescriptionId(ctx),
    }),
    closeButtonProps: normalize.button<T>({
      id: dom.getCloseButtonId(ctx),
      type: "button",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
