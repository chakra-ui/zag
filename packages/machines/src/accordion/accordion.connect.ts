import { StateMachine as S } from "@ui-machines/core"
import { is } from "tiny-guard"
import type { DOM, Props } from "../utils"
import { dataAttr, defaultPropNormalizer, getEventKey } from "../utils"
import { dom } from "./accordion.dom"
import { AccordionMachineContext, AccordionMachineState } from "./accordion.machine"

export function accordionConnect(
  state: S.State<AccordionMachineContext, AccordionMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state

  return {
    rootProps: normalize<Props.Element>({
      id: dom.getRootId(ctx),
    }),

    getAccordionItem(props: AccordionItemProps) {
      const { id, disabled } = props

      const isOpen = is.arr(ctx.activeId) ? ctx.activeId.includes(id) : id === ctx.activeId
      const isDisabled = disabled ?? ctx.disabled
      const isFocused = ctx.focusedId === id

      return {
        isFocused,
        isOpen,

        groupProps: normalize<Props.Element>({
          id: dom.getGroupId(ctx, id),
          "data-expanded": dataAttr(isOpen),
        }),

        panelProps: normalize<Props.Element>({
          role: "region",
          id: dom.getPanelId(ctx, id),
          "aria-labelledby": dom.getTriggerId(ctx, id),
          hidden: !isOpen,
          "data-disabled": dataAttr(isDisabled),
          "data-focus": dataAttr(isFocused),
          "data-expanded": dataAttr(isOpen),
        }),

        triggerProps: normalize<Props.Button>({
          type: "button",
          id: dom.getTriggerId(ctx, id),
          "aria-controls": dom.getPanelId(ctx, id),
          "aria-expanded": isOpen,
          disabled: isDisabled,
          "aria-disabled": isDisabled,
          "data-ownedby": dom.getRootId(ctx),
          onFocus() {
            if (disabled) return
            send({ type: "FOCUS", id })
          },
          onBlur() {
            if (disabled) return
            send("BLUR")
          },
          onClick() {
            if (disabled) return
            send({ type: "CLICK", id })
          },
          onKeyDown(event) {
            if (disabled) return

            const keyMap: DOM.EventKeyMap = {
              ArrowDown() {
                send({ type: "ARROW_DOWN", id })
              },
              ArrowUp() {
                send({ type: "ARROW_UP", id })
              },
              Enter() {
                send({ type: "CLICK", id })
              },
              Home() {
                send({ type: "HOME", id })
              },
              End() {
                send({ type: "END", id })
              },
            }

            const key = getEventKey(event, {
              dir: ctx.dir,
              orientation: "vertical",
            })

            const exec = keyMap[key]

            if (exec) {
              event.preventDefault()
              exec(event)
            }
          },
        }),
      }
    },
  }
}

export type AccordionItemProps = {
  id: string
  disabled?: boolean
}
