import { StateMachine as S } from "@ui-machines/core"
import { isArray } from "tiny-guard"
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

  function getItemState(props: AccordionItemProps) {
    const { id, disabled } = props
    return {
      isOpen: isArray(ctx.activeId) ? ctx.activeId.includes(id) : id === ctx.activeId,
      isFocused: ctx.focusedId === id,
      isDisabled: disabled ?? ctx.disabled,
    }
  }

  return {
    rootProps: normalize<Props.Element>({
      id: dom.getRootId(ctx),
    }),

    getItemState,

    getItemProps(props: AccordionItemProps) {
      const { isOpen } = getItemState(props)
      return normalize<Props.Element>({
        id: dom.getGroupId(ctx, props.id),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getPanelProps(props: AccordionItemProps) {
      const { isOpen, isFocused, isDisabled } = getItemState(props)
      return normalize<Props.Element>({
        role: "region",
        id: dom.getPanelId(ctx, props.id),
        "aria-labelledby": dom.getTriggerId(ctx, props.id),
        hidden: !isOpen,
        "data-disabled": dataAttr(isDisabled),
        "data-focus": dataAttr(isFocused),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getTriggerProps(props: AccordionItemProps) {
      const { id } = props
      const { isDisabled, isOpen } = getItemState(props)
      return normalize<Props.Button>({
        type: "button",
        id: dom.getTriggerId(ctx, id),
        "aria-controls": dom.getPanelId(ctx, id),
        "aria-expanded": isOpen,
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        "data-ownedby": dom.getRootId(ctx),
        onFocus() {
          if (isDisabled) return
          send({ type: "FOCUS", id })
        },
        onBlur() {
          if (isDisabled) return
          send("BLUR")
        },
        onClick() {
          if (isDisabled) return
          send({ type: "CLICK", id })
        },
        onKeyDown(event) {
          if (isDisabled) return

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
      })
    },
  }
}

export type AccordionItemProps = {
  id: string
  disabled?: boolean
}
