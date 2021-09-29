import { StateMachine as S } from "@ui-machines/core"
import { contains } from "tiny-dom-query"
import { cast } from "tiny-fn"
import { fromPointerEvent } from "tiny-point/dom"
import type { DOM, Props } from "../utils"
import { dataAttr, defaultPropNormalizer, getEventKey, validateBlur } from "../utils"
import { dom } from "./menu.dom"
import { MenuMachine, MenuMachineContext, MenuMachineState } from "./menu.machine"

export function menuConnect(
  state: S.State<MenuMachineContext, MenuMachineState>,
  send: (event: S.Event<S.AnyEventObject>) => void,
  normalize = defaultPropNormalizer,
) {
  const { context: ctx } = state
  const isOpen = state.matches("open", "closing")
  const isSubmenu = ctx.parent != null

  return {
    isOpen,

    setParent(parent: MenuMachine) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.uid })
    },

    setChild(child: MenuMachine) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.uid })
    },

    triggerProps: normalize<Props.Button>({
      type: "button",
      id: dom.getTriggerId(ctx),
      "data-uid": ctx.uid,
      "aria-haspopup": "menu",
      "aria-controls": dom.getMenuId(ctx),
      "aria-expanded": isOpen ? true : undefined,
      onPointerMove(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERMOVE",
          target: event.currentTarget,
        })
      },
      onPointerLeave(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERLEAVE",
          target: event.currentTarget,
          point: fromPointerEvent(cast(event)),
        })
      },
      onPointerDown(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (event.button !== 0 || disabled) return
        send({ type: "TRIGGER_CLICK", target: event.currentTarget })
      },
      onBlur() {
        send("TRIGGER_BLUR")
      },
      onFocus() {
        send("TRIGGER_FOCUS")
      },
      onKeyDown(event) {
        const keyMap: DOM.EventKeyMap = {
          ArrowDown() {
            send("ARROW_DOWN")
          },
          ArrowUp() {
            send("ARROW_UP")
          },
          Enter() {
            send("TRIGGER_CLICK")
          },
          Space() {
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

    menuProps: normalize<Props.Element>({
      id: dom.getMenuId(ctx),
      hidden: !isOpen,
      role: "menu",
      tabIndex: 0,
      dir: ctx.dir,
      "aria-activedescendant": ctx.activeId ?? undefined,
      "aria-orientation": ctx.orientation,
      "data-orientation": ctx.orientation,
      onBlur(event) {
        const menu = dom.getMenuEl(ctx)
        const trigger = dom.getTriggerEl(ctx)

        const exclude = dom.getChildMenus(ctx).concat(dom.getParentMenus(ctx))

        if (trigger && !isSubmenu) {
          exclude.push(trigger)
        }
        const isValidBlur = validateBlur(event, {
          exclude,
          fallback: ctx.pointerdownNode,
        })
        if (isValidBlur && !contains(menu, event.relatedTarget)) {
          send("BLUR")
        }
      },
      onPointerEnter() {
        send("MENU_POINTERENTER")
      },
      onKeyDown(event) {
        const activeItem = dom.getActiveItemEl(ctx)
        const isLink = !!activeItem?.matches("a[href]")

        const keyMap: DOM.EventKeyMap = {
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
            if (isLink) activeItem?.click()
            send("ENTER")
          },
          Space() {
            send("ENTER")
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
        }

        const key = getEventKey(event, ctx)
        const exec = keyMap[key]

        if (exec) {
          const allow = isLink && key === "Enter"
          if (!allow) event.preventDefault()
          exec(event)
        } else if (event.key.length === 1) {
          const selector = "input, textarea, [contenteditable], select"
          const editable = activeItem?.matches(selector)

          if (!editable) {
            event.preventDefault()
            send({ type: "TYPEAHEAD", key: event.key })
          }
        }
      },
    }),

    dividerProps: normalize<Props.Element>({
      role: "separator",
      "aria-orientation": ctx.orientation === "horizontal" ? "vertical" : "horizontal",
    }),

    getItemOptionProps(opts: OptionItemProps) {
      const { type, checked, disabled, id, onCheckedChange, valueText } = opts
      return normalize<Props.Element>({
        id,
        role: `menuitem${type}`,
        "data-disabled": dataAttr(disabled),
        "data-ownedby": dom.getMenuId(ctx),
        "aria-checked": !!checked,
        "aria-disabled": disabled,
        "data-selected": dataAttr(ctx.activeId === id),
        "data-orientation": ctx.orientation,
        "data-valuetext": valueText,
        onClick(event) {
          if (disabled) return
          send({ type: "ITEM_CLICK", target: event.currentTarget })
          onCheckedChange?.(!checked)
        },
        onPointerUp(event) {
          event.currentTarget.click()
        },
        onPointerLeave(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget })
        },
        onPointerEnter(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
        },
        onPointerMove(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
        },
      })
    },

    getItemProps(opts: ItemProps = {}) {
      const { id, disabled, valueText } = opts
      return normalize<Props.Element>({
        id,
        role: "menuitem",
        "data-disabled": dataAttr(disabled),
        "data-ownedby": dom.getMenuId(ctx),
        "data-selected": dataAttr(ctx.activeId === id),
        "data-orientation": ctx.orientation,
        "data-valuetext": valueText,
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
        onPointerEnter(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
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
  valueText?: string
}

type OptionItemProps = ItemProps & {
  type: "radio" | "checkbox"
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
