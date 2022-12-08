import { mergeProps } from "@zag-js/core"
import {
  dataAttr,
  EventKeyMap,
  getEventKey,
  getEventPoint,
  getNativeEvent,
  isContextMenuEvent,
  isElementEditable,
  isLeftClick,
  isModifiedEvent,
  isSelfEvent,
} from "@zag-js/dom-utils"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./menu.anatomy"
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
    highlightedId: state.context.highlightedId,
    setHighlightedId(id: string) {
      send({ type: "SET_HIGHLIGHTED_ID", id })
    },
    setParent(parent: Service) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.id })
    },
    setChild(child: Service) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.id })
    },
    value: values,
    setValue(name: string, value: any) {
      send({ type: "SET_VALUE", name, value })
    },
    isOptionChecked(opts: OptionItemProps) {
      return opts.type === "radio" ? values?.[opts.name] === opts.value : values?.[opts.name].includes(opts.value)
    },

    contextTriggerProps: normalize.element({
      ...parts.trigger.attrs,
      id: dom.getContextTriggerId(state.context),
      onPointerDown(event) {
        if (event.pointerType === "mouse") return
        const evt = getNativeEvent(event)
        send({ type: "CONTEXT_MENU_START", point: getEventPoint(evt) })
      },
      onPointerCancel(event) {
        if (event.pointerType === "mouse") return
        send("CONTEXT_MENU_CANCEL")
      },
      onPointerMove(event) {
        if (event.pointerType === "mouse") return
        send("CONTEXT_MENU_CANCEL")
      },
      onPointerUp(event) {
        if (event.pointerType === "mouse") return
        send("CONTEXT_MENU_CANCEL")
      },
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
      ...(isSubmenu ? parts.triggerItem.attrs : parts.trigger.attrs),
      "data-placement": state.context.currentPlacement,
      type: "button",
      dir: state.context.dir,
      id: dom.getTriggerId(state.context),
      "data-uid": state.context.id,
      "aria-haspopup": "menu",
      "aria-controls": dom.getContentId(state.context),
      "aria-expanded": isOpen || undefined,
      "data-expanded": dataAttr(isOpen),
      onPointerMove(event) {
        if (event.pointerType !== "mouse") return
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERMOVE",
          target: event.currentTarget,
        })
      },
      onPointerLeave(event) {
        if (event.pointerType !== "mouse") return
        const evt = getNativeEvent(event)
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({
          type: "TRIGGER_POINTERLEAVE",
          target: event.currentTarget,
          point: getEventPoint(evt),
        })
      },
      onClick(event) {
        if (dom.isTriggerItem(event.currentTarget)) {
          send({ type: "TRIGGER_CLICK", target: event.currentTarget })
        }
      },
      onPointerDown(event) {
        const disabled = dom.isTargetDisabled(event.currentTarget)
        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || disabled || isContextMenuEvent(event)) return
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
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      ...parts.arrow.attrs,
      style: popperStyles.arrow,
    }),

    arrowTipProps: normalize.element({
      ...parts.arrowTip.attrs,
      style: popperStyles.arrowTip,
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
      "aria-label": state.context["aria-label"],
      hidden: !isOpen,
      role: "menu",
      tabIndex: 0,
      dir: state.context.dir,
      "aria-activedescendant": state.context.highlightedId ?? undefined,
      "aria-labelledby": dom.getTriggerId(state.context),
      "data-placement": state.context.currentPlacement,
      onPointerEnter(event) {
        if (event.pointerType !== "mouse") return
        send("MENU_POINTERENTER")
      },
      onKeyDown(event) {
        if (!isSelfEvent(event)) return

        const item = dom.getFocusedItem(state.context)
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
          exec(event)
          if (!allow) event.preventDefault()
          //
        } else {
          //
          const isSingleKey = event.key.length === 1
          const isValidTypeahead = isSingleKey && !isModifiedEvent(event) && !isElementEditable(item)

          if (!isValidTypeahead) return

          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),

    separatorProps: normalize.element({
      ...parts.separator.attrs,
      role: "separator",
      "aria-orientation": "horizontal",
    }),

    getItemProps(options: ItemProps) {
      const { id, disabled, valueText } = options
      return normalize.element({
        ...parts.item.attrs,
        id,
        role: "menuitem",
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        "data-ownedby": dom.getContentId(state.context),
        "data-focus": dataAttr(state.context.highlightedId === id),
        "data-valuetext": valueText,
        onClick(event) {
          if (disabled) return
          send({ type: "ITEM_CLICK", target: event.currentTarget, id })
        },
        onPointerDown(event) {
          if (disabled) return
          send({ type: "ITEM_POINTERDOWN", target: event.currentTarget, id })
        },
        onPointerUp(event) {
          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || disabled || state.context.pointerdownNode === event.currentTarget) return
          event.currentTarget.click()
        },
        onPointerLeave(event) {
          if (disabled || event.pointerType !== "mouse") return
          send({ type: "ITEM_POINTERLEAVE", target: event.currentTarget })
        },
        onPointerMove(event) {
          if (disabled || event.pointerType !== "mouse") return
          send({ type: "ITEM_POINTERMOVE", id, target: event.currentTarget })
        },
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
          ...parts.optionItem.attrs,
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
        ...parts.label.attrs,
      })
    },

    getGroupProps(options: GroupProps) {
      return normalize.element({
        id: dom.getGroupId(state.context, options.id),
        ...parts.group.attrs,
        "aria-labelledby": options.id,
        role: "group",
      })
    },
  }

  return api
}
