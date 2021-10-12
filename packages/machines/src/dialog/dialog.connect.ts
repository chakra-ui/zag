import { StateMachine as S } from "@ui-machines/core"
import { Props, defaultPropNormalizer, ariaAttr } from "../utils"
import { dom } from "./dialog.dom"
import { DialogMachineContext, DialogMachineState } from "./dialog.machine"

export function dialogConnect(
  state: S.State<DialogMachineContext, DialogMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isOpen = state.matches("open")

  return {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    triggerProps: normalize<Props.Button>({
      id: dom.getTriggerId(ctx),
      "aria-haspopup": "dialog",
      type: "button",
      "aria-expanded": ariaAttr(isOpen),
      "aria-controls": dom.getContentId(ctx),
      onClick() {
        send(isOpen ? "CLOSE" : "OPEN")
      },
    }),
    overlayProps: normalize<Props.Element>({
      "aria-hidden": true,
      id: dom.getOverlayId(ctx),
      onClick(event) {
        event.preventDefault()
        event.stopPropagation()
        send("CLOSE")
      },
    }),
    contentProps: normalize<Props.Element>({
      role: "dialog",
      id: dom.getContentId(ctx),
      tabIndex: -1,
      "aria-modal": ctx.isTopMostDialog,
      "aria-labelledby": ctx.hasTitle ? dom.getTitleId(ctx) : undefined,
      "aria-describedby": ctx.hasDescription ? dom.getDescriptionId(ctx) : undefined,
      onClick(event) {
        event.stopPropagation()
      },
    }),
    titleProps: normalize<Props.Element>({
      id: dom.getTitleId(ctx),
    }),
    descriptionProps: normalize<Props.Element>({
      id: dom.getDescriptionId(ctx),
    }),
    closeButtonProps: normalize<Props.Button>({
      id: dom.getCloseButtonId(ctx),
      type: "button",
      onClick() {
        send("CLOSE")
      },
    }),
  }
}
