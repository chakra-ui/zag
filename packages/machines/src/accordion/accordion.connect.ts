import { is } from "@core-foundation/utils/is"
import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
import type { ButtonProps, EventKeyMap, HTMLProps } from "../utils/types"
import { getElementIds } from "./accordion.dom"
import { AccordionMachineContext, AccordionMachineState } from "./accordion.machine"

export function connectAccordionMachine(
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

    getAccordionProps({ uid, disabled }: { uid: string; disabled?: boolean }) {
      const isOpen = is.array(ctx.activeId) ? ctx.activeId.includes(uid) : uid === ctx.activeId
      const isDisabled = disabled ?? ctx.disabled
      const isFocused = ctx.focusedId === uid

      return {
        isFocused,
        isOpen,
        groupProps: normalize<HTMLProps>({
          id: ids.getGroupId(uid),
          "data-expanded": isOpen,
        }),

        panelProps: normalize<HTMLProps>({
          role: "region",
          id: ids.getPanelId(uid),
          "aria-labelledby": ids.getTriggerId(uid),
          hidden: !isOpen,
          "data-disabled": dataAttr(isDisabled),
          "data-focus": dataAttr(isFocused),
          "data-expanded": dataAttr(isOpen),
        }),

        triggerProps: normalize<ButtonProps>({
          type: "button",
          id: ids.getTriggerId(uid),
          "aria-controls": ids.getPanelId(uid),
          "aria-expanded": isOpen,
          disabled: isDisabled,
          "data-ownedby": ids.root,
          onFocus() {
            send({ type: "FOCUS", id: uid })
          },
          onBlur() {
            send("BLUR")
          },
          onClick() {
            send({ type: "CLICK", id: uid })
          },
          onKeyDown(event) {
            const keyMap: EventKeyMap = {
              ArrowDown() {
                send({ type: "ARROW_DOWN", id: uid })
              },
              ArrowUp() {
                send({ type: "ARROW_UP", id: uid })
              },
              Enter() {
                send({ type: "CLICK", id: uid })
              },
              Home() {
                send({ type: "HOME", id: uid })
              },
              End() {
                send({ type: "END", id: uid })
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
