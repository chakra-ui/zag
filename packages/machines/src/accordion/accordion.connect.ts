import { isArray } from "tiny-guard"
import type { DOM, Props } from "../utils"
import { dataAttr, defaultPropNormalizer, getEventKey } from "../utils"
import { dom } from "./accordion.dom"
import { AccordionItemProps, AccordionSend, AccordionState } from "./accordion.types"

export function accordionConnect(state: AccordionState, send: AccordionSend, normalize = defaultPropNormalizer) {
  const { context: ctx } = state

  function getItemState(props: AccordionItemProps) {
    const { value, disabled } = props
    return {
      isOpen: isArray(ctx.value) ? ctx.value.includes(value) : value === ctx.value,
      isFocused: ctx.focusedValue === value,
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
        id: dom.getGroupId(ctx, props.value),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getContentProps(props: AccordionItemProps) {
      const { isOpen, isFocused, isDisabled } = getItemState(props)
      return normalize<Props.Element>({
        role: "region",
        id: dom.getPanelId(ctx, props.value),
        "aria-labelledby": dom.getTriggerId(ctx, props.value),
        hidden: !isOpen,
        "data-disabled": dataAttr(isDisabled),
        "data-focus": dataAttr(isFocused),
        "data-expanded": dataAttr(isOpen),
      })
    },

    getTriggerProps(props: AccordionItemProps) {
      const { value } = props
      const { isDisabled, isOpen } = getItemState(props)
      return normalize<Props.Button>({
        type: "button",
        id: dom.getTriggerId(ctx, value),
        "aria-controls": dom.getPanelId(ctx, value),
        "aria-expanded": isOpen,
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        "data-ownedby": dom.getRootId(ctx),
        onFocus() {
          if (isDisabled) return
          send({ type: "FOCUS", value })
        },
        onBlur() {
          if (isDisabled) return
          send("BLUR")
        },
        onClick() {
          if (isDisabled) return
          send({ type: "CLICK", value })
        },
        onKeyDown(event) {
          if (isDisabled) return

          const keyMap: DOM.EventKeyMap = {
            ArrowDown() {
              send({ type: "ARROW_DOWN", value })
            },
            ArrowUp() {
              send({ type: "ARROW_UP", value })
            },
            Enter() {
              send({ type: "CLICK", value })
            },
            Home() {
              send({ type: "HOME", value })
            },
            End() {
              send({ type: "END", value })
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
