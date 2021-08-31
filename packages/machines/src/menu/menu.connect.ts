import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { ButtonProps, EventKeyMap, HTMLProps } from "../utils/types"
import { validateBlur } from "../utils/validate-blur"
import { getElementIds, getElements } from "./menu.dom"
import { MenuMachine, MenuMachineContext, MenuMachineState } from "./menu.machine"

export function connectMenuMachine(
  state: S.State<MenuMachineContext, MenuMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isOpen = state.matches("open")
  const ids = getElementIds(ctx.uid)

  return {
    isOpen,

    setParent(parent: MenuMachine) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.uid })
    },

    setChild(child: MenuMachine) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.uid })
    },

    triggerProps: normalize<ButtonProps>({
      type: "button",
      id: ids.trigger,
      "data-uid": ctx.uid,
      "aria-haspopup": "menu",
      "aria-controls": ids.menu,
      "aria-expanded": isOpen ? true : undefined,
      onPointerMove(event) {
        send({ type: "TRIGGER_POINTEROVER", target: event.currentTarget })
      },
      onPointerLeave(event) {
        send({ type: "TRIGGER_POINTERLEAVE", target: event.currentTarget, relatedTarget: event.relatedTarget })
      },
      onClick(event) {
        send({ type: "TRIGGER_CLICK", target: event.currentTarget })
      },
      onPointerDown(event) {
        event.preventDefault()
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
        }

        if (event.key in keyMap) {
          event.preventDefault()
          const exec = keyMap[event.key]
          exec(event)
        }
      },
    }),

    menuProps: normalize<HTMLProps>({
      id: ids.menu,
      hidden: !isOpen,
      role: "menu",
      tabIndex: -1,
      dir: ctx.direction,
      "aria-labelledby": ids.trigger,
      "aria-activedescendant": ctx.activeId ?? "",
      "aria-orientation": ctx.orientation,
      onBlur(event) {
        const { trigger } = getElements(ctx)

        const isValidBlur = validateBlur(event, {
          exclude: trigger,
          fallback: ctx.pointerdownNode,
        })

        if (isValidBlur && event.target.getAttribute("role") !== "menu") {
          send("BLUR")
        }
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          ArrowLeft() {
            send("ARROW_LEFT")
          },
          ArrowRight() {
            send("ARROW_RIGHT")
          },
          Escape() {
            send("ESCAPE")
          },
          Enter() {
            send("ENTER")
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
        }

        const exec = keyMap[event.key]

        if (exec) {
          event.preventDefault()
          exec(event)
        } else if (event.key.length === 1) {
          event.preventDefault()
          send({ type: "TYPEAHEAD", key: event.key })
        }
      },
    }),

    dividerProps: normalize<HTMLProps>({
      role: "separator",
      "aria-orientation": ctx.orientation === "horizontal" ? "vertical" : "horizontal",
    }),

    getRadioItemProps({ checked, disabled, id, onCheckedChange }: RadioItemProps) {
      return normalize<HTMLProps>({
        id,
        role: "menuitemradio",
        "aria-checked": !!checked,
        "aria-disabled": disabled,
        onClick(event) {
          send({ type: "ITEM_CLICK", target: event.currentTarget })
          onCheckedChange?.(!checked)
        },
      })
    },

    getItemProps({ id, disabled, value }: ItemProps) {
      return normalize<HTMLProps>({
        id,
        role: "menuitem",
        "data-disabled": disabled,
        "data-ownedby": ids.menu,
        "data-selected": dataAttr(ctx.activeId === id),
        "data-value": value,
        "data-orientation": ctx.orientation,
        onClick(event) {
          send({ type: "ITEM_CLICK", target: event.currentTarget })
        },
        onPointerLeave(event) {
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget, relatedTarget: event.relatedTarget })
        },
        onPointerMove(event) {
          send({ type: "ITEM_POINTERMOVE", target: event.currentTarget })
        },
      })
    },
  }
}

type ItemProps = {
  id?: string
  disabled?: boolean
  value?: string
}

type RadioItemProps = ItemProps & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
