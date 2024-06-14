import { mergeProps } from "@zag-js/core"
import {
  clickIfLink,
  getEventKey,
  getEventPoint,
  isContextMenuEvent,
  isModifierKey,
  isPrintableKey,
  type EventKeyMap,
} from "@zag-js/dom-event"
import {
  dataAttr,
  getEventTarget,
  isDownloadingEvent,
  isEditableElement,
  isOpeningInNewTab,
  isSelfTarget,
  isValidTabEvent,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./menu.anatomy"
import { dom } from "./menu.dom"
import type { ItemProps, ItemState, MachineApi, OptionItemProps, OptionItemState, Send, State } from "./menu.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isSubmenu = state.context.isSubmenu
  const isTypingAhead = state.context.isTypingAhead
  const composite = state.context.composite

  const open = state.hasTag("open")

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.anchorPoint ? "bottom" : state.context.currentPlacement,
  })

  function getItemState(props: ItemProps): ItemState {
    return {
      disabled: !!props.disabled,
      highlighted: state.context.highlightedValue === props.value,
    }
  }

  function getOptionItemProps(props: OptionItemProps) {
    const valueText = props.valueText ?? props.value
    return { ...props, id: props.value, valueText }
  }

  function getOptionItemState(props: OptionItemProps): OptionItemState {
    const itemState = getItemState(getOptionItemProps(props))
    return {
      ...itemState,
      checked: !!props.checked,
    }
  }

  function getItemProps(props: ItemProps) {
    const { value: id, closeOnSelect, valueText } = props
    const itemState = getItemState(props)
    return normalize.element({
      ...parts.item.attrs,
      id,
      role: "menuitem",
      "aria-disabled": itemState.disabled,
      "data-disabled": dataAttr(itemState.disabled),
      "data-ownedby": dom.getContentId(state.context),
      "data-highlighted": dataAttr(itemState.highlighted),
      "data-valuetext": valueText,
      onDragStart(event) {
        const isLink = event.currentTarget.matches("a[href]")
        if (isLink) event.preventDefault()
      },
      onPointerMove(event) {
        if (itemState.disabled) return
        if (event.pointerType !== "mouse") return
        const target = event.currentTarget
        if (itemState.highlighted) return
        send({ type: "ITEM_POINTERMOVE", id, target, closeOnSelect })
      },
      onPointerLeave(event) {
        if (itemState.disabled) return
        if (event.pointerType !== "mouse") return

        const pointerMoved = state.previousEvent.type.includes("POINTER")
        if (!pointerMoved) return

        const target = event.currentTarget
        send({ type: "ITEM_POINTERLEAVE", id, target, closeOnSelect })
      },
      onPointerDown(event) {
        if (itemState.disabled) return
        const target = event.currentTarget
        send({ type: "ITEM_POINTERDOWN", target, id, closeOnSelect })
      },
      onClick(event) {
        if (isDownloadingEvent(event)) return
        if (isOpeningInNewTab(event)) return
        if (itemState.disabled) return

        const target = event.currentTarget
        send({ type: "ITEM_CLICK", target, id, closeOnSelect })
      },
    })
  }

  return {
    highlightedValue: state.context.highlightedValue,
    open: open,
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },
    setHighlightedValue(value) {
      send({ type: "HIGHLIGHTED.SET", id: value })
    },
    setParent(parent) {
      send({ type: "PARENT.SET", value: parent, id: parent.state.context.id })
    },
    setChild(child) {
      send({ type: "CHILD.SET", value: child, id: child.state.context.id })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },

    getContextTriggerProps() {
      return normalize.element({
        ...parts.contextTrigger.attrs,
        dir: state.context.dir,
        id: dom.getContextTriggerId(state.context),
        onPointerDown(event) {
          if (event.pointerType === "mouse") return
          const point = getEventPoint(event)
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
          const point = getEventPoint(event)
          send({ type: "CONTEXT_MENU", point })
          event.preventDefault()
        },
        style: {
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        },
      })
    },

    getTriggerItemProps(childApi) {
      return mergeProps(
        getItemProps({ value: childApi.getTriggerProps().id }),
        childApi.getTriggerProps(),
      ) as T["element"]
    },

    getTriggerProps() {
      return normalize.button({
        ...(isSubmenu ? parts.triggerItem.attrs : parts.trigger.attrs),
        "data-placement": state.context.currentPlacement,
        type: "button",
        dir: state.context.dir,
        id: dom.getTriggerId(state.context),
        "data-uid": state.context.id,
        "aria-haspopup": composite ? "menu" : "dialog",
        "aria-controls": dom.getContentId(state.context),
        "aria-expanded": open || undefined,
        "data-state": open ? "open" : "closed",
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          const disabled = dom.isTargetDisabled(event.currentTarget)
          if (disabled || !isSubmenu) return
          send({ type: "TRIGGER_POINTERMOVE", target: event.currentTarget })
        },
        onPointerLeave(event) {
          if (dom.isTargetDisabled(event.currentTarget)) return
          if (event.pointerType !== "mouse") return
          if (!isSubmenu) return
          const point = getEventPoint(event)
          send({ type: "TRIGGER_POINTERLEAVE", target: event.currentTarget, point })
        },
        onPointerDown(event) {
          if (dom.isTargetDisabled(event.currentTarget)) return
          if (isContextMenuEvent(event)) return
          event.preventDefault()
        },
        onClick(event) {
          if (event.defaultPrevented) return
          if (dom.isTargetDisabled(event.currentTarget)) return
          send({ type: "TRIGGER_CLICK", target: event.currentTarget })
        },
        onBlur() {
          send("TRIGGER_BLUR")
        },
        onFocus() {
          send("TRIGGER_FOCUS")
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          const keyMap: EventKeyMap = {
            ArrowDown() {
              send("ARROW_DOWN")
            },
            ArrowUp() {
              send("ARROW_UP")
            },
            Enter() {
              send({ type: "ARROW_DOWN", src: "enter" })
            },
            Space() {
              send({ type: "ARROW_DOWN", src: "space" })
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            event.preventDefault()
            exec(event)
          }
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        dir: state.context.dir,
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context),
        style: popperStyles.floating,
      })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(state.context),
        ...parts.arrow.attrs,
        dir: state.context.dir,
        style: popperStyles.arrow,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: state.context.dir,
        style: popperStyles.arrowTip,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(state.context),
        "aria-label": state.context["aria-label"],
        hidden: !open,
        "data-state": open ? "open" : "closed",
        role: composite ? "menu" : "dialog",
        tabIndex: 0,
        dir: state.context.dir,
        "aria-activedescendant": state.context.highlightedValue ?? undefined,
        "aria-labelledby": dom.getTriggerId(state.context),
        "data-placement": state.context.currentPlacement,
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return
          send("MENU_POINTERENTER")
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!isSelfTarget(event)) return

          const target = getEventTarget<Element>(event)

          const sameMenu = target?.closest("[role=menu]") === event.currentTarget || target === event.currentTarget
          if (!sameMenu) return

          if (event.key === "Tab") {
            const valid = isValidTabEvent(event)
            if (!valid) {
              event.preventDefault()
              return
            }
          }

          const item = dom.getHighlightedItemEl(state.context)
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
              send("ENTER")
              clickIfLink(item)
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
          }

          const key = getEventKey(event, { dir: state.context.dir })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.stopPropagation()
            event.preventDefault()
            return
          }

          // typeahead
          if (!state.context.typeahead) return
          if (!isPrintableKey(event)) return
          if (isModifierKey(event)) return
          if (isEditableElement(target)) return

          send({ type: "TYPEAHEAD", key: event.key })
          event.preventDefault()
        },
      })
    },

    getSeparatorProps() {
      return normalize.element({
        ...parts.separator.attrs,
        role: "separator",
        dir: state.context.dir,
        "aria-orientation": "horizontal",
      })
    },

    getItemState,

    getItemProps,

    getOptionItemState,

    getOptionItemProps(props) {
      const { type, disabled, onCheckedChange, closeOnSelect } = props

      const option = getOptionItemProps(props)
      const itemState = getOptionItemState(props)

      return {
        ...getItemProps(option),
        ...normalize.element({
          "data-type": type,
          ...parts.item.attrs,
          dir: state.context.dir,
          "data-value": option.value,
          role: `menuitem${type}`,
          "aria-checked": !!itemState.checked,
          "data-state": itemState.checked ? "checked" : "unchecked",
          onClick(event) {
            if (disabled) return
            if (isDownloadingEvent(event)) return
            if (isOpeningInNewTab(event)) return
            const target = event.currentTarget
            send({ type: "ITEM_CLICK", target, option, closeOnSelect })
            onCheckedChange?.(!itemState.checked)
          },
        }),
      }
    },

    getItemIndicatorProps(props) {
      const itemState = getOptionItemState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": itemState.checked ? "checked" : "unchecked",
        hidden: !itemState.checked,
      })
    },

    getItemTextProps(props) {
      const itemState = getOptionItemState(props)
      return normalize.element({
        ...parts.itemText.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": itemState.checked ? "checked" : "unchecked",
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
