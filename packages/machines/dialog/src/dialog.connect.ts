import { StateMachine as S } from "@ui-machines/core"
import { ariaAttr } from "@ui-machines/dom-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { dom } from "./dialog.dom"
import { MachineContext, MachineState } from "./dialog.types"

export function connect<T extends PropTypes = ReactPropTypes>(
  state: S.State<MachineContext, MachineState>,
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
      "data-part": "trigger",
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      type: "button",
      "aria-expanded": isOpen,
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send("TRIGGER_CLICK")
      },
    }),
    overlayProps: normalize.element<T>({
      "data-part": "overlay",
      "aria-hidden": true,
      id: dom.getOverlayId(ctx),
      onClick(event) {
        if (event.target !== ctx.pointerdownNode) return
        send("OVERLAY_CLICK")
        event.preventDefault()
        event.stopPropagation()
      },
    }),
    contentProps: normalize.element<T>({
      "data-part": "content",
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
      "data-part": "title",
      id: dom.getTitleId(ctx),
    }),
    descriptionProps: normalize.element<T>({
      "data-part": "description",
      id: dom.getDescriptionId(ctx),
    }),
    closeButtonProps: normalize.button<T>({
      "data-part": "close-button",
      id: dom.getCloseButtonId(ctx),
      type: "button",
      onClick(event) {
        event.stopPropagation()
        send("CLOSE")
      },
    }),
  }
}
