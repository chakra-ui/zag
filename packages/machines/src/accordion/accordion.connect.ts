import { is } from "@core-foundation/utils/is"
import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, determineEventKey, defaultPropNormalizer, PropNormalizer } from "../__utils/dom"
import { DOMButtonProps, DOMHTMLProps, EventKeyMap, WithDataAttr } from "../__utils/types"
import { getElementIds } from "./accordion.dom"
import { AccordionMachineContext, AccordionMachineState } from "./accordion.machine"

export function connectAccordionMachine(
  state: S.State<AccordionMachineContext, AccordionMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize: PropNormalizer = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const ids = getElementIds(ctx.uid)

  return {
    rootProps: normalize<WithDataAttr<DOMHTMLProps>>({
      id: ids.root,
    }),

    getAccordionProps({ uid, disabled }: { uid: string; disabled?: boolean }) {
      const isVisible = is.array(ctx.activeId) ? ctx.activeId.includes(uid) : uid === ctx.activeId

      const isDisabled = disabled ?? ctx.disabled
      const isFocused = ctx.focusedId === uid

      return {
        groupProps: normalize<DOMHTMLProps>({
          id: ids.getGroupId(uid),
          "data-expanded": isVisible,
        }),

        panelProps: normalize<DOMHTMLProps>({
          role: "region",
          id: ids.getPanelId(uid),
          "aria-labelledby": ids.getTriggerId(uid),
          hidden: !isVisible,
          "data-disabled": dataAttr(isDisabled),
          "data-focus": dataAttr(isFocused),
          "data-expanded": dataAttr(isVisible),
        }),

        triggerProps: normalize<DOMButtonProps>({
          type: "button",
          id: ids.getTriggerId(uid),
          "aria-controls": ids.getPanelId(uid),
          "aria-expanded": isVisible,
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

            const key = determineEventKey(event, {
              direction: "ltr",
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
