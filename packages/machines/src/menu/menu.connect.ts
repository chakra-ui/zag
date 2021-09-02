import { StateMachine as S } from "@ui-machines/core"
import { dataAttr, defaultPropNormalizer } from "../utils/dom-attr"
import { getEventKey } from "../utils/get-event-key"
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
        const disabled = event.currentTarget.disabled || event.currentTarget.dataset.disabled === ""
        if (disabled) return
        send({ type: "TRIGGER_POINTERMOVE", target: event.currentTarget })
      },
      onPointerLeave(event) {
        const disabled = event.currentTarget.disabled || event.currentTarget.dataset.disabled === ""
        if (disabled) return
        send({ type: "TRIGGER_POINTERLEAVE", target: event.currentTarget })
      },
      onPointerDown(event) {
        const disabled = event.currentTarget.disabled || event.currentTarget.dataset.disabled === ""
        if (event.button !== 0 || disabled) return
        event.preventDefault()
        send({ type: "TRIGGER_CLICK", target: event.currentTarget })
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
          Enter() {
            send("TRIGGER_CLICK")
          },
          " "() {
            send("TRIGGER_CLICK")
          },
        }

        const key = getEventKey(event, ctx)

        if (key in keyMap) {
          event.preventDefault()
          event.stopPropagation()
          const exec = keyMap[key]
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

        const childMenus = Object.values(ctx.children).map((child) => {
          const { menu } = getElements(child.state.context)
          return menu
        })

        const parentMenu = ctx.parent ? getElements(ctx.parent.state.context).menu : null

        const isValidBlur = validateBlur(event, {
          exclude: childMenus.concat(trigger, parentMenu),
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
          " "() {
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

    getItemProps({ id, disabled }: ItemProps = {}) {
      return normalize<HTMLProps>({
        id,
        role: "menuitem",
        "data-disabled": dataAttr(disabled),
        "data-ownedby": ids.menu,
        "data-selected": dataAttr(ctx.activeId === id),
        "data-orientation": ctx.orientation,
        onClick(event) {
          if (disabled) return
          send({ type: "ITEM_CLICK", target: event.currentTarget })
        },
        onPointerUp(event) {
          event.currentTarget.click()
        },
        onPointerLeave(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget })
        },
        onPointerMove(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
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
