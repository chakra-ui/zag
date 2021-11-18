import { contains, dataAttr, getEventKey } from "@ui-machines/dom-utils"
import { validateBlur } from "@ui-machines/dom-utils/focus-event"
import { isLeftClick } from "@ui-machines/utils/guard"
import { EventKeyMap, getNativeEvent, normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { fromPointerEvent } from "tiny-point/dom"
import { dom } from "./menu.dom"
import { MenuItemProps, MenuMachine, MenuOptionItemProps, MenuSend, MenuState } from "./menu.types"

export function menuConnect<T extends PropTypes = ReactPropTypes>(state: MenuState, send: MenuSend, normalize = normalizeProp) {
  const { context: ctx } = state
  const isOpen = state.matches("open", "closing")
  const isSubmenu = ctx.parent != null

  function getItemProps(opts: MenuItemProps) {
    const { id, disabled, valueText } = opts
    return normalize.element<T>({
      id,
      role: "menuitem",
      "aria-disabled": disabled,
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
        const evt = (event.nativeEvent ?? event) as PointerEvent
        if (!isLeftClick(evt) || disabled) return
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
      onDragStart(event) {
        const isLink = event.currentTarget.matches("a[href]")
        if (isLink) event.preventDefault()
      },
    })
  }

  return {
    isOpen,

    setParent(parent: MenuMachine) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.uid })
    },

    setChild(child: MenuMachine) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.uid })
    },

    open() {
      send({ type: "OPEN" })
    },

    triggerProps: normalize.button<T>({
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
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERLEAVE",
          target: event.currentTarget,
          point: fromPointerEvent(evt),
        })
      },
      onPointerDown(event) {
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (!isLeftClick(evt) || disabled) return
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
          Space() {
            send("TRIGGER_CLICK")
          },
        }

        const key = getEventKey(event, ctx)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          event.stopPropagation()
          exec(event)
        }
      },
    }),

    menuProps: normalize.element<T>({
      id: dom.getMenuId(ctx),
      hidden: !isOpen,
      role: "menu",
      tabIndex: 0,
      dir: ctx.dir,
      "aria-activedescendant": ctx.activeId ?? undefined,
      "aria-labelledby": dom.getTriggerId(ctx),
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
            if (isLink) activeItem?.click()
            send("ENTER")
          },
          Space(event) {
            keyMap.Enter?.(event)
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
          Tab() {},
        }

        const key = getEventKey(event, ctx)
        const exec = keyMap[key]

        if (exec) {
          const allow = isLink && key === "Enter"
          if (!allow) event.preventDefault()
          exec(event)
        } else {
          const editable = activeItem?.matches("input, textarea, [contenteditable], select")
          const isKeyDownInside = event.currentTarget.contains(event.target as HTMLElement)
          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
          const isSingleKey = event.key.length === 1

          if (isSingleKey && !isModifierKey && isKeyDownInside && !editable) {
            event.preventDefault()
            send({ type: "TYPEAHEAD", key: event.key })
          }
        }
      },
    }),

    separatorProps: normalize.element<T>({
      role: "separator",
      "aria-orientation": ctx.orientation === "horizontal" ? "vertical" : "horizontal",
    }),

    getItemProps,

    getItemOptionProps(opts: MenuOptionItemProps) {
      const { type, checked, disabled, onCheckedChange } = opts
      return Object.assign(
        getItemProps(opts),
        normalize.element<T>({
          role: `menuitem${type}`,
          "aria-checked": !!checked,
          onClick(event) {
            if (disabled) return
            send({ type: "ITEM_CLICK", target: event.currentTarget })
            onCheckedChange?.(!checked)
          },
        }),
      )
    },
  }
}
