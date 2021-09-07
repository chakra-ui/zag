import { is } from "@core-foundation/utils/is"
import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import type { ButtonProps, EventKeyMap, HTMLProps } from "../utils/types"
import { getElementIds } from "./accordion.dom"
import { AccordionMachineContext, AccordionMachineState } from "./accordion.machine"

export function accordionConnect(
  state: S.State<AccordionMachineContext, AccordionMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  return {
    rootProps: normalize<HTMLProps>({
      id: ids.root,
    }),

    getAccordionItem(props: AccordionItemProps) {
      const { id, disabled } = props

      const isOpen = is.array(ctx.activeId) ? ctx.activeId.includes(id) : id === ctx.activeId

      const isDisabled = disabled ?? ctx.disabled
      const isFocused = ctx.focusedId === id

      return {
        isFocused,
        isOpen,

        groupProps: normalize<HTMLProps>({
          id: ids.getGroupId(id),
          "data-expanded": dataAttr(isOpen),
        }),

        panelProps: normalize<HTMLProps>({
          role: "region",
          id: ids.getPanelId(id),
          "aria-labelledby": ids.getTriggerId(id),
          hidden: !isOpen,
          "data-disabled": dataAttr(isDisabled),
          "data-focus": dataAttr(isFocused),
          "data-expanded": dataAttr(isOpen),
        }),

        triggerProps: normalize<ButtonProps>({
          type: "button",
          id: ids.getTriggerId(id),
          "aria-controls": ids.getPanelId(id),
          "aria-expanded": isOpen,
          disabled: isDisabled,
          "aria-disabled": isDisabled,
          "data-ownedby": ids.root,
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

            const keyMap: EventKeyMap = {
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
              direction: ctx.direction,
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
