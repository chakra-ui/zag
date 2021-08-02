import {
  defaultPropNormalizer,
  PropNormalizer,
  StateMachine as S,
} from "@ui-machines/core"
import { validateBlur } from "@core-dom/event"
import { DOMHTMLProps } from "../type-utils"
import { getElementIds, getElements } from "./popover.dom"
import { PopoverMachineContext, PopoverMachineState } from "./popover.machine"

export function connectPopoverMachine(
  state: S.State<PopoverMachineContext, PopoverMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)
  const isOpen = state.matches("open")

  return {
    triggerProps: normalize<DOMHTMLProps>({
      id: ids.trigger,
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": ids.content,
      onClick() {
        send("CLICK")
      },
    }),

    popoverProps: normalize<DOMHTMLProps>({
      id: ids.content,
      tabIndex: -1,
      role: "dialog",
      hidden: !isOpen,
      "aria-labelledby": ids.header,
      "aria-describedby": ids.body,
      onKeyDown(event) {
        if (event.key === "Escape") {
          send("ESCAPE")
        }
      },
      onBlur(event) {
        const { trigger } = getElements(ctx)
        const isValidBlur = validateBlur(event, {
          exclude: trigger,
          fallback: ctx.pointerdownNode,
        })
        if (isValidBlur) {
          send("CLICK_OUTSIDE")
        }
      },
    }),

    headerProps: normalize<DOMHTMLProps>({
      id: ids.header,
    }),

    bodyProps: normalize<DOMHTMLProps>({
      id: ids.body,
    }),
  }
}
