import { mergeProps } from "@zag-js/core"
import {
  getEventKey,
  getEventPoint,
  getNativeEvent,
  isContextMenuEvent,
  isLeftClick,
  isModifiedEvent,
  type EventKeyMap,
} from "@zag-js/dom-event"
import { dataAttr, getEventTarget, isEditableElement, isSelfEvent } from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { match } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import { dom } from "./menu.dom"
import type { ItemProps, ItemState, MachineApi, OptionItemProps, OptionItemState, Send, State } from "./menu.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isSubmenu = state.context.isSubmenu
  const values = state.context.value
  const isTypingAhead = state.context.isTypingAhead

  const isOpen = state.hasTag("visible")

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  function getItemState(props: ItemProps): ItemState {
    return {
      isDisabled: !!props.disabled,
      isHighlighted: state.context.highlightedId === props.id,
    }
  }

  function getOptionItemProps(props: OptionItemProps) {
    const id = props.id ?? props.value
    const valueText = props.valueText ?? props.value
    return { ...props, id, valueText }
  }

  function getOptionItemState(props: OptionItemProps): OptionItemState {
    const itemState = getItemState(getOptionItemProps(props))
    return {
      ...itemState,
      isChecked: !!match(props.type, {
        radio: () => values?.[props.name] === props.value,
        checkbox: () => values?.[props.name].includes(props.value),
      }),
    }
  }

  function getItemProps(props: ItemProps) {
    const { id, closeOnSelect, valueText } = props
    const itemState = getItemState(props)
    return normalize.element({
      ...parts.item.attrs,
      id,
      role: "menuitem",
      "aria-disabled": itemState.isDisabled,
      "data-disabled": dataAttr(itemState.isDisabled),
      "data-ownedby": dom.getContentId(state.context),
      "data-highlighted": dataAttr(itemState.isHighlighted),
      "data-valuetext": valueText,
      onDragStart(event) {
        const isLink = event.currentTarget.matches("a[href]")
        if (isLink) event.preventDefault()
      },
      onPointerLeave(event) {
        if (itemState.isDisabled || event.pointerType !== "mouse") return
        const target = event.currentTarget
        send({ type: "ITEM_POINTERLEAVE", id, target, closeOnSelect })
      },
      onPointerMove(event) {
        if (itemState.isDisabled || event.pointerType !== "mouse") return
        const target = event.currentTarget
        send({ type: "ITEM_POINTERMOVE", id, target, closeOnSelect })
      },
      onPointerDown(event) {
        if (itemState.isDisabled) return
        const target = event.currentTarget
        send({ type: "ITEM_POINTERDOWN", target, id, closeOnSelect })
      },
      onPointerUp(event) {
        const evt = getNativeEvent(event)
        if (!isLeftClick(evt) || itemState.isDisabled) return
        const target = event.currentTarget
        send({ type: "ITEM_CLICK", src: "pointerup", target, id, closeOnSelect })
        // Fix issue where links don't get clicked in pointerup on touch devices
        if (target.matches("a[href]") && event.pointerType === "touch") {
          target.click()
        }
      },
      onTouchEnd(event) {
        // prevent clicking elements behind content
        event.preventDefault()
        event.stopPropagation()
      },
    })
  }

  return {
    highlightedId: state.context.highlightedId,
    isOpen,
    open() {
      send("OPEN")
    },
    close() {
      send("CLOSE")
    },
    setHighlightedId(id) {
      send({ type: "SET_HIGHLIGHTED_ID", id })
    },
    setParent(parent) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.id })
    },
    setChild(child) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.id })
    },
    value: values,
    setValue(name, value) {
      send({ type: "SET_VALUE", name, value })
    },
    reposition(options = {}) {
      send({ type: "SET_POSITIONING", options })
    },

    contextTriggerProps: normalize.element({
      ...parts.contextTrigger.attrs,
      dir: state.context.dir,
      id: dom.getContextTriggerId(state.context),
      onPointerDown(event) {
        if (event.pointerType === "mouse") return
        const evt = getNativeEvent(event)
        const point = getEventPoint(evt)
        send({ type: "CONTEXT_MENU_START", point })
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
        const point = getEventPoint(evt)
        send({ type: "CONTEXT_MENU", point })
        event.preventDefault()
      },
      style: {
        WebkitTouchCallout: "none",
        userSelect: "none",
      },
    }),

    getTriggerItemProps(childApi) {
      return mergeProps(getItemProps({ id: childApi.triggerProps.id }), childApi.triggerProps) as T["element"]
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
      "data-state": isOpen ? "open" : "closed",
      onPointerMove(event) {
        if (event.pointerType !== "mouse") return
        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return
        send({ type: "TRIGGER_POINTERMOVE", target: event.currentTarget })
      },
      onPointerLeave(event) {
        if (event.pointerType !== "mouse") return
        const evt = getNativeEvent(event)

        const disabled = dom.isTargetDisabled(event.currentTarget)
        if (disabled || !isSubmenu) return

        const point = getEventPoint(evt)
        send({ type: "TRIGGER_POINTERLEAVE", target: event.currentTarget, point })
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

    indicatorProps: normalize.element({
      ...parts.indicator.attrs,
      dir: state.context.dir,
      "data-state": isOpen ? "open" : "closed",
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      dir: state.context.dir,
      id: dom.getPositionerId(state.context),
      style: popperStyles.floating,
    }),

    arrowProps: normalize.element({
      id: dom.getArrowId(state.context),
      ...parts.arrow.attrs,
      dir: state.context.dir,
      style: popperStyles.arrow,
    }),

    arrowTipProps: normalize.element({
      ...parts.arrowTip.attrs,
      dir: state.context.dir,
      style: popperStyles.arrowTip,
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      id: dom.getContentId(state.context),
      "aria-label": state.context["aria-label"],
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
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
        const target = getEventTarget<HTMLElement>(getNativeEvent(event))
        const isKeyDownInside = target?.closest("[role=menu]") === event.currentTarget

        if (!isSelfEvent(event) || !isKeyDownInside) return

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
          Tab(event) {
            send({ type: "TAB", shiftKey: event.shiftKey, loop: false })
          },
        }

        const key = getEventKey(event, { dir: state.context.dir })
        const exec = keyMap[key]

        if (exec) {
          const allow = isLink && key === "Enter"
          exec(event)
          if (!allow) {
            event.preventDefault()
          }
          //
        } else {
          //
          const isSingleKey = event.key.length === 1
          const isValidTypeahead = isSingleKey && !isModifiedEvent(event) && !isEditableElement(item)

          if (!isValidTypeahead) return

          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        }
      },
    }),

    separatorProps: normalize.element({
      ...parts.separator.attrs,
      role: "separator",
      dir: state.context.dir,
      "aria-orientation": "horizontal",
    }),
    getItemState,
    getItemProps,

    getOptionItemState,
    getOptionItemProps(props) {
      const { name, type, disabled, onCheckedChange, closeOnSelect } = props

      const option = getOptionItemProps(props)
      const itemState = getOptionItemState(props)

      return {
        ...getItemProps(option),
        ...normalize.element({
          "data-type": type,
          "data-name": name,
          ...parts.optionItem.attrs,
          dir: state.context.dir,
          "data-value": option.value,
          role: `menuitem${type}`,
          "aria-checked": !!itemState.isChecked,
          "data-state": itemState.isChecked ? "checked" : "unchecked",
          onPointerUp(event) {
            const evt = getNativeEvent(event)
            if (!isLeftClick(evt) || disabled) return
            const target = event.currentTarget
            send({ type: "ITEM_CLICK", src: "pointerup", target, option, closeOnSelect })
            onCheckedChange?.(!itemState.isChecked)
          },
        }),
      }
    },

    getOptionItemIndicatorProps(props) {
      const itemState = getOptionItemState(props)
      return normalize.element({
        ...parts.optionItemIndicator.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-highlighted": dataAttr(itemState.isHighlighted),
        "data-state": itemState.isChecked ? "checked" : "unchecked",
        hidden: !itemState.isChecked,
      })
    },

    getOptionItemTextProps(props) {
      const itemState = getOptionItemState(props)
      return normalize.element({
        ...parts.optionItemText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(itemState.isDisabled),
        "data-highlighted": dataAttr(itemState.isHighlighted),
        "data-state": itemState.isChecked ? "checked" : "unchecked",
      })
    },

    getItemGroupLabelProps(props) {
      return normalize.element({
        id: dom.getGroupLabelId(state.context, props.htmlFor),
        dir: state.context.dir,
        ...parts.itemGroupLabel.attrs,
      })
    },

    getItemGroupProps(props) {
      return normalize.element({
        id: dom.getGroupId(state.context, props.id),
        ...parts.itemGroup.attrs,
        dir: state.context.dir,
        "aria-labelledby": dom.getGroupLabelId(state.context, props.id),
        role: "group",
      })
    },
  }
}
