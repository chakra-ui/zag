import { mergeProps } from "@zag-js/core"
import {
  dataAttr,
  EventKeyMap,
  getEventKey,
  getEventPoint,
  getNativeEvent,
  isContextMenuEvent,
  isElementEditable,
  isModifiedEvent,
  isSelfEvent,
  whenMouse,
  whenTouchOrPen,
} from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { dom } from "./menu.dom"
import type { Api, GroupProps, ItemProps, LabelProps, OptionItemProps, Send, Service, State } from "./menu.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isSubmenu = state.context.isSubmenu
  const values = state.context.value
  const isTypingAhead = state.context.isTypingAhead

  const isOpen = state.hasTag("visible")

  const popperStyles = getPlacementStyles({
    measured: !!state.context.anchorPoint || !!state.context.currentPlacement,
    placement: state.context.currentPlacement,
  })

  const api = {
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    activeId: state.context.activeId,
    setActiveId(id: string) {
      send({ type: "SET_ACTIVE_ID", id })
    },
    setParent(parent: Service) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.uid })
    },
    setChild(child: Service) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.uid })
    },
    value: values,
    setValue(name: string, value: any) {
      send({ type: "SET_VALUE", name, value })
    },
    isOptionChecked(opts: OptionItemProps) {
      return opts.type === "radio" ? values?.[opts.name] === opts.value : values?.[opts.name].includes(opts.value)
    },

    contextTriggerProps: normalize.element({
      "data-part": "trigger",
      id: dom.getContextTriggerId(state.context),
      onPointerDown: whenTouchOrPen((event) => {
        const evt = getNativeEvent(event)
        send({ type: "CONTEXT_MENU_START", point: getEventPoint(evt) })
      }),
      onPointerCancel: whenTouchOrPen(() => {
        send("CONTEXT_MENU_CANCEL")
      }),
      onPointerMove: whenTouchOrPen(() => {
        send("CONTEXT_MENU_CANCEL")
      }),
      onPointerUp: whenTouchOrPen(() => {
        send("CONTEXT_MENU_CANCEL")
      }),
      onContextMenu(event) {
        const evt = getNativeEvent(event)
        send({ type: "CONTEXT_MENU", point: getEventPoint(evt) })
        event.preventDefault()
      },
      style: {
        WebkitTouchCallout: "none",
        userSelect: "none",
      },
    }),

    getTriggerItemProps<A extends Api>(childApi: A) {
      return mergeProps(api.getItemProps({ id: childApi.triggerProps.id }), childApi.triggerProps) as T["element"]
    },

    triggerProps: normalize.button({
      "data-part": isSubmenu ? "trigger-item" : "trigger",
      "data-placement": state.context.currentPlacement,
      type: "button",
      dir: state.context.dir,
      id: dom.getTriggerId(state.context),
      "data-uid": state.context.uid,
      "aria-haspopup": "menu",
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen || undefined,
      "data-expanded": dataAttr(isOpen),
      onPointerMove: whenMouse((event) => {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERMOVE",
          target: event.currentTarget,
        })
      }),
      onPointerLeave: whenMouse((event) => {
        if (event.pointerType !== "mouse") return
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERLEAVE",
          target: event.currentTarget,
          point: getEventPoint(evt),
        })
      }),
      onClick(event) {
        if (dom.isTriggerItem(event.currentTarget)) {
          send({ type: "TRIGGER_CLICK", target: event.currentTarget })
        }
      },
      onPointerDown(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        const evt = getNativeEvent(event)
        if (!evt.isPrimary || disabled || isContextMenuEvent(event)) return
        event.preventDefault()
        if (!dom.isTriggerItem(event.currentTarget)) {
          send({ type: "TRIGGER_CLICK", target: event.currentTarget })
        }
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
            send({ type: "ARROW_DOWN" })
          },
          Space() {
            send({ type: "ARROW_DOWN" })
          },
        }

        const key = getEventKey(event, state.context)
        const exec = keyMap[key]

        if (exec) {
          event.preventDefault()
          exec(event)
        }
      },
    }),

    positionerProps: normalize.element({
      "data-part": "positioner",
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      "data-part": "arrow",
      style: popperStyles.arrow,
    }),

    innerArrowProps: normalize.element({
      "data-part": "arrow-inner",
      style: popperStyles.innerArrow,
    }),

    contentProps: normalize.element({
      "data-part": "content",
      id: dom.getContentId(state.context),
      "aria-label": state.context["aria-label"],
      hidden: !isOpen,
      role: "menu",
      tabIndex: 0,
      dir: state.context.dir,
      "aria-activedescendant": state.context.activeId ?? undefined,
      "aria-labelledby": dom.getTriggerId(state.context),
      "data-placement": state.context.currentPlacement,
      onPointerEnter: whenMouse(() => {
        send("MENU_POINTERENTER")
      }),
      onKeyDown(event) {
        if (!isSelfEvent(event)) return

        const item = dom.getActiveItemEl(state.context)
        const isLink = !!item?.matches("a[href]")

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
          Enter() {
            if (isLink) item?.click()
            send("ENTER")
          },
          Space(event) {
            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
            } else {
              keyMap.Enter?.(event)
            }
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
          Tab() {},
        }

        const key = getEventKey(event, { dir: state.context.dir })
        const exec = keyMap[key]

        if (exec) {
          const allow = isLink && key === "Enter"
          if (!allow) event.preventDefault()
          event.stopPropagation()
          exec(event)
          //
        } else {
          //
          const isSingleKey = event.key.length === 1
          const isValidTypeahead = isSingleKey && !isModifiedEvent(event) && !isElementEditable(item)

          if (!isValidTypeahead) return

          event.preventDefault()
          event.stopPropagation()
          send({ type: "TYPEAHEAD", key: event.key })
        }
      },
    }),

    separatorProps: normalize.element({
      "data-part": "separator",
      role: "separator",
      "aria-orientation": "horizontal",
    }),

    getItemProps(options: ItemProps) {
      const { id, disabled, valueText } = options
      return normalize.element({
        "data-part": "item",
        id,
        role: "menuitem",
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        "data-ownedby": dom.getContentId(state.context),
        "data-focus": dataAttr(state.context.activeId === id),
        "data-valuetext": valueText,
        onClick(event) {
          if (disabled) return
          send({ type: "ITEM_CLICK", target: event.currentTarget, id })
        },
        onPointerUp(event) {
          const evt = getNativeEvent(event)
          if (!evt.isPrimary || disabled) return
          event.currentTarget.click()
        },
        onPointerLeave: whenMouse((event) => {
          if (disabled) return
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget })
        }),
        onPointerMove: whenMouse((event) => {
          if (disabled) return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
        }),
        onDragStart(event) {
          const isLink = event.currentTarget.matches("a[href]")
          if (isLink) event.preventDefault()
        },
        onAuxClick(event) {
          if (disabled) return
          event.preventDefault()
          event.currentTarget.click()
        },
      })
    },

    getOptionItemProps(option: OptionItemProps) {
      const { name, type, disabled, onCheckedChange } = option

      option.id ??= option.value
      option.valueText ??= option.value

      const checked = api.isOptionChecked(option)

      return Object.assign(
        api.getItemProps(option as ItemProps),
        normalize.element({
          "data-type": type,
          "data-name": name,
          "data-part": "option-item",
          "data-value": option.value,
          role: `menuitem${type}`,
          "aria-checked": !!checked,
          "data-checked": dataAttr(checked),
          onClick(event) {
            if (disabled) return
            send({ type: "ITEM_CLICK", target: event.currentTarget, option })
            onCheckedChange?.(!checked)
          },
        }),
      )
    },

    getLabelProps(options: LabelProps) {
      return normalize.element({
        id: dom.getLabelId(state.context, options.htmlFor),
        "data-part": "label",
      })
    },

    getGroupProps(options: GroupProps) {
      return normalize.element({
        id: dom.getGroupId(state.context, options.id),
        "data-part": "group",
        "aria-labelledby": options.id,
        role: "group",
      })
    },
  }

  return api
}
