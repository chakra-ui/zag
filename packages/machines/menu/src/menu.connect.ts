import { contains, dataAttr, EventKeyMap, getEventKey, getNativeEvent, validateBlur } from "@ui-machines/dom-utils"
import { getArrowStyle, getFloatingStyle, getInnerArrowStyle } from "@ui-machines/popper"
import { getEventPoint } from "@ui-machines/rect-utils"
import { normalizeProp, PropTypes, ReactPropTypes } from "@ui-machines/types"
import { isLeftClick } from "@ui-machines/utils"
import { dom } from "./menu.dom"
import { ItemProps, OptionItemProps, Send, Service, State } from "./menu.types"

export function connect<T extends PropTypes = ReactPropTypes>(state: State, send: Send, normalize = normalizeProp) {
  const { context: ctx } = state
  const isOpen = state.matches("open", "closing")

  function getItemProps(opts: ItemProps) {
    const { id, disabled, valueText } = opts
    return normalize.element<T>({
      "data-part": "menuitem",
      id,
      role: "menuitem",
      "aria-disabled": disabled,
      "data-disabled": dataAttr(disabled),
      "data-ownedby": dom.getMenuId(ctx),
      "data-selected": dataAttr(ctx.activeId === id),
      "data-valuetext": valueText,
      onClick(event) {
        if (disabled) return
        send({ type: "ITEM_CLICK", target: event.currentTarget })
      },
      onPointerUp(event) {
        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || disabled) return
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
      onDragStart(event) {
        const isLink = event.currentTarget.matches("a[href]")
        if (isLink) event.preventDefault()
      },
    })
  }

  return {
    isOpen,

    setParent(parent: Service) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.uid })
    },

    setChild(child: Service) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.uid })
    },

    open() {
      send({ type: "OPEN" })
    },

    contextTriggerProps: normalize.element<T>({
      "data-part": "trigger",
      onPointerDown(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_START")
        }
      },
      onPointerCancel(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_CANCEL")
        }
      },
      onPointerMove(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_CANCEL")
        }
      },
      onPointerUp(event) {
        if (event.pointerType !== "mouse") {
          send("CONTEXT_MENU_CANCEL")
        }
      },
      onContextMenu(event) {
        const evt = getNativeEvent(event)
        send({ type: "CONTEXT_MENU", point: getEventPoint(evt) })
        event.preventDefault()
      },
      style: {
        WebkitTouchCallout: "none",
      },
    }),

    arrowProps: normalize.element<T>({
      id: dom.getArrowId(ctx),
      "data-part": "arrow",
      style: getArrowStyle(),
    }),

    innerArrowProps: normalize.element<T>({
      "data-part": "arrow--inner",
      style: getInnerArrowStyle(),
    }),

    triggerProps: normalize.button<T>({
      "data-part": "trigger",
      "data-placement": ctx.__placement,
      type: "button",
      id: dom.getTriggerId(ctx),
      "data-uid": ctx.uid,
      "aria-haspopup": "menu",
      "aria-controls": dom.getMenuId(ctx),
      "aria-expanded": isOpen ? true : undefined,
      onPointerMove(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !ctx.isSubmenu) return
        send({
          type: "TRIGGER_POINTERMOVE",
          target: event.currentTarget,
        })
      },
      onPointerLeave(event) {
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !ctx.isSubmenu) return
        send({
          type: "TRIGGER_POINTERLEAVE",
          target: event.currentTarget,
          point: getEventPoint(evt),
        })
      },
      onPointerDown(event) {
        if (dom.isTriggerItem(event.currentTarget)) {
          event.preventDefault()
          return
        }
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

    contentProps: normalize.element<T>({
      "data-part": "content",
      id: dom.getMenuId(ctx),
      hidden: !isOpen,
      role: "menu",
      tabIndex: 0,
      dir: ctx.dir,
      "aria-activedescendant": ctx.activeId ?? undefined,
      "aria-labelledby": dom.getTriggerId(ctx),
      "data-placement": ctx.__placement,
      style: getFloatingStyle(!!ctx.__placement),
      onBlur(event) {
        const menu = dom.getMenuEl(ctx)
        const trigger = dom.getTriggerEl(ctx)

        const exclude = dom.getChildMenus(ctx).concat(dom.getParentMenus(ctx))

        if (trigger && !ctx.isSubmenu) {
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

        const key = getEventKey(event, { dir: ctx.dir })
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
      "data-part": "separator",
      role: "separator",
      "aria-orientation": "horizontal",
    }),

    getItemProps,

    getItemOptionProps(opts: OptionItemProps) {
      const { type, checked, disabled, onCheckedChange } = opts
      return Object.assign(
        getItemProps(opts),
        normalize.element<T>({
          "data-part": "menu-option",
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
