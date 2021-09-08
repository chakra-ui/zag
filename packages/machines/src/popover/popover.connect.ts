import { StateMachine as S } from "@ui-machines/core"
import { defaultPropNormalizer } from "../utils/dom-attr"
import type { HTMLProps } from "../utils/types"
import { validateBlur } from "../utils/validate-blur"
import { getElementIds, getElements } from "./popover.dom"
import { PopoverMachineContext, PopoverMachineState } from "./popover.machine"

export function popoverConnect(
  state: S.State<PopoverMachineContext, PopoverMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)
  const isOpen = state.matches("open")

  return {
    triggerProps: normalize<HTMLProps>({
      id: ids.trigger,
      "aria-haspopup": "dialog",
      "aria-expanded": isOpen,
      "aria-controls": ids.content,
      onClick() {
        send("CLICK")
      },
    }),

    popoverProps: normalize<HTMLProps>({
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
        const { trigger, content } = getElements(ctx)
        const isValidBlur = validateBlur(event, {
          exclude: [trigger, content],
          fallback: ctx.pointerdownNode,
        })
        if (isValidBlur) {
          send("CLICK_OUTSIDE")
        }
      },
    }),

    headerProps: normalize<HTMLProps>({
      id: ids.header,
    }),

    bodyProps: normalize<HTMLProps>({
      id: ids.body,
    }),
  }
}
