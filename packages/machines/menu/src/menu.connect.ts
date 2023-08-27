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
import { dataAttr, isEditableElement, isSelfEvent } from "@zag-js/dom-query"
import { getPlacementStyles, type PositioningOptions } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./menu.anatomy"
import { dom } from "./menu.dom"
import type {
  Api,
  GroupProps,
  ItemProps,
  LabelProps,
  OptionItemProps,
  MachineApi,
  Send,
  Service,
  State,
} from "./menu.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isSubmenu = state.context.isSubmenu
  const values = state.context.value
  const isTypingAhead = state.context.isTypingAhead

  const isOpen = state.hasTag("visible")

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
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

    setPositioning(options: Partial<PositioningOptions> = {}) {
      send({ type: "SET_POSITIONING", options })
    },

    contextTriggerProps: normalize.element({
      ...parts.contextTrigger.attrs,
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
      "aria-orientation": "horizontal",
    }),

    getItemProps(options: ItemProps) {
      const { id, disabled, valueText, closeOnSelect } = options
      return normalize.element({
        ...parts.item.attrs,
        id,
        role: "menuitem",
        "aria-disabled": disabled,
        "data-disabled": dataAttr(disabled),
        "data-ownedby": dom.getContentId(state.context),
        "data-highlighted": dataAttr(state.context.highlightedId === id),
        "data-valuetext": valueText,
        onDragStart(event) {
          const isLink = event.currentTarget.matches("a[href]")
          if (isLink) event.preventDefault()
        },
        onPointerLeave(event) {
          if (disabled || event.pointerType !== "mouse") return
          const target = event.currentTarget
          send({ type: "ITEM_POINTERLEAVE", id, target, closeOnSelect })
        },
        onPointerMove(event) {
          if (disabled || event.pointerType !== "mouse") return
          const target = event.currentTarget
          send({ type: "ITEM_POINTERMOVE", id, target, closeOnSelect })
        },
        onPointerDown(event) {
          if (disabled) return
          const target = event.currentTarget
          send({ type: "ITEM_POINTERDOWN", target, id, closeOnSelect })
        },
        onPointerUp(event) {
          const evt = getNativeEvent(event)
          if (!isLeftClick(evt) || disabled) return
          const target = event.currentTarget
          send({ type: "ITEM_CLICK", src: "pointerup", target, id, closeOnSelect })
        },
        onAuxClick(event) {
          if (disabled) return
          event.preventDefault()
          const target = event.currentTarget
          send({ type: "ITEM_CLICK", src: "auxclick", target, id, closeOnSelect })
        },
      })
    },

    getOptionItemProps(option: OptionItemProps) {
      const { name, type, disabled, onCheckedChange, closeOnSelect } = option

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
          "data-state": checked ? "checked" : "unchecked",
          onPointerUp(event) {
            const evt = getNativeEvent(event)
            if (!isLeftClick(evt) || disabled) return
            const target = event.currentTarget
            send({ type: "ITEM_CLICK", src: "pointerup", target, option, closeOnSelect })
            onCheckedChange?.(!checked)
          },
          onAuxClick(event) {
            if (disabled) return
            event.preventDefault()
            const target = event.currentTarget
            send({ type: "ITEM_CLICK", src: "auxclick", target, option, closeOnSelect })
            onCheckedChange?.(!checked)
          },
        }),
      )
    },

    getItemGroupLabelProps(options: LabelProps) {
      return normalize.element({
        id: dom.getGroupLabelId(state.context, options.htmlFor),
        ...parts.itemGroupLabel.attrs,
      })
    },

    getItemGroupProps(options: GroupProps) {
      return normalize.element({
        id: dom.getGroupId(state.context, options.id),
        ...parts.itemGroup.attrs,
        "aria-labelledby": options.id,
        role: "group",
      })
    },
  }

  return api
}
