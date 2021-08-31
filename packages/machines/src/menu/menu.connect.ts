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
        send({ type: "TRIGGER_POINTERMOVE", target: event.currentTarget })
      },
      onPointerLeave() {
        send({ type: "TRIGGER_POINTERLEAVE" })
      },
      onClick() {
        send("TRIGGER_CLICK")
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
      tabIndex: 0,
      dir: ctx.direction,
      "aria-activedescendant": ctx.activeId ?? undefined,
      "aria-orientation": ctx.orientation,
      "data-orientation": ctx.orientation,
      onBlur(event) {
        const { trigger } = getElements(ctx)
        const childMenus = Object.values(ctx.children).map((child) => getElements(child.state.context).menu)
        const parentMenu = ctx.parent ? getElements(ctx.parent.state.context).menu : null

        const isValidBlur = validateBlur(event, {
          exclude: [trigger, ...childMenus, parentMenu],
          fallback: ctx.pointerdownNode,
        })

        if (isValidBlur) {
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
        onClick() {
          send("ITEM_CLICK")
          onCheckedChange?.(!checked)
        },
      })
    },

    getItemProps({ id, disabled }: ItemProps) {
      return normalize<HTMLProps>({
        id,
        role: "menuitem",
        "data-disabled": disabled,
        "data-ownedby": ids.menu,
        "data-selected": dataAttr(ctx.activeId === id),
        "data-orientation": ctx.orientation,
        onClick() {
          send("ITEM_CLICK")
        },
        onPointerLeave(event) {
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget })
        },
        onPointerMove() {
          send({ type: "ITEM_POINTERMOVE", id })
        },
      })
    },
  }
}

type ItemProps = {
  id?: string
  disabled?: boolean
}

type RadioItemProps = ItemProps & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
