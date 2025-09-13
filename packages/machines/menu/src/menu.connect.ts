import type { Service } from "@zag-js/core"
import { mergeProps } from "@zag-js/core"
import {
  ariaAttr,
  dataAttr,
  getEventKey,
  getEventPoint,
  getEventTarget,
  isContextMenuEvent,
  isDownloadingEvent,
  isEditableElement,
  isModifierKey,
  isOpeningInNewTab,
  isPrintableKey,
  contains,
  isValidTabEvent,
} from "@zag-js/dom-query"
import { getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { cast, hasProp } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import * as dom from "./menu.dom"
import type { ItemProps, ItemState, MenuApi, MenuSchema, OptionItemProps, OptionItemState } from "./menu.types"

export function connect<T extends PropTypes>(service: Service<MenuSchema>, normalize: NormalizeProps<T>): MenuApi<T> {
  const { context, send, state, computed, prop, scope } = service

  const open = state.hasTag("open")

  const isSubmenu = context.get("isSubmenu")
  const isTypingAhead = computed("isTypingAhead")
  const composite = prop("composite")

  const currentPlacement = context.get("currentPlacement")
  const anchorPoint = context.get("anchorPoint")
  const highlightedValue = context.get("highlightedValue")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: anchorPoint ? "bottom" : currentPlacement,
  })

  function getItemState(props: ItemProps): ItemState {
    return {
      id: dom.getItemId(scope, props.value),
      disabled: !!props.disabled,
      highlighted: highlightedValue === props.value,
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
    const { closeOnSelect, valueText, value } = props
    const itemState = getItemState(props)
    const id = dom.getItemId(scope, value)
    return normalize.element({
      ...parts.item.attrs,
      id,
      role: "menuitem",
      "aria-disabled": ariaAttr(itemState.disabled),
      "data-disabled": dataAttr(itemState.disabled),
      "data-ownedby": dom.getContentId(scope),
      "data-highlighted": dataAttr(itemState.highlighted),
      "data-value": value,
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

        const pointerMoved = service.event.previous()?.type.includes("POINTER")
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
    highlightedValue,
    open,
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    setHighlightedValue(value) {
      send({ type: "HIGHLIGHTED.SET", value })
    },
    setParent(parent) {
      send({ type: "PARENT.SET", value: parent, id: parent.prop("id") })
    },
    setChild(child) {
      send({ type: "CHILD.SET", value: child, id: child.prop("id") })
    },
    reposition(options = {}) {
      send({ type: "POSITIONING.SET", options })
    },
    addItemListener(props) {
      const node = scope.getById(props.id)
      if (!node) return
      const listener = () => props.onSelect?.()
      node.addEventListener(dom.itemSelectEvent, listener)
      return () => node.removeEventListener(dom.itemSelectEvent, listener)
    },

    getContextTriggerProps() {
      return normalize.element({
        ...parts.contextTrigger.attrs,
        dir: prop("dir"),
        id: dom.getContextTriggerId(scope),
        "data-state": open ? "open" : "closed",
        onPointerDown(event) {
          if (event.pointerType === "mouse") return
          const point = getEventPoint(event)
          send({ type: "CONTEXT_MENU_START", point })
        },
        onPointerCancel(event) {
          if (event.pointerType === "mouse") return
          send({ type: "CONTEXT_MENU_CANCEL" })
        },
        onPointerMove(event) {
          if (event.pointerType === "mouse") return
          send({ type: "CONTEXT_MENU_CANCEL" })
        },
        onPointerUp(event) {
          if (event.pointerType === "mouse") return
          send({ type: "CONTEXT_MENU_CANCEL" })
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
      const triggerProps = childApi.getTriggerProps()
      return mergeProps(getItemProps({ value: triggerProps.id }), triggerProps) as T["element"]
    },

    getTriggerProps() {
      return normalize.button({
        ...(isSubmenu ? parts.triggerItem.attrs : parts.trigger.attrs),
        "data-placement": context.get("currentPlacement"),
        type: "button",
        dir: prop("dir"),
        id: dom.getTriggerId(scope),
        "data-uid": prop("id"),
        "aria-haspopup": composite ? "menu" : "dialog",
        "aria-controls": dom.getContentId(scope),
        "aria-expanded": open || undefined,
        "data-state": open ? "open" : "closed",
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          const disabled = dom.isTargetDisabled(event.currentTarget)
          if (disabled || !isSubmenu) return
          const point = getEventPoint(event)
          send({ type: "TRIGGER_POINTERMOVE", target: event.currentTarget, point })
        },
        onPointerLeave(event) {
          if (dom.isTargetDisabled(event.currentTarget)) return
          if (event.pointerType !== "mouse") return
          if (!isSubmenu) return
          const point = getEventPoint(event)
          send({
            type: "TRIGGER_POINTERLEAVE",
            target: event.currentTarget,
            point,
          })
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
          send({ type: "TRIGGER_BLUR" })
        },
        onFocus() {
          send({ type: "TRIGGER_FOCUS" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          const keyMap: EventKeyMap = {
            ArrowDown() {
              send({ type: "ARROW_DOWN" })
            },
            ArrowUp() {
              send({ type: "ARROW_UP" })
            },
            Enter() {
              send({ type: "ARROW_DOWN", src: "enter" })
            },
            Space() {
              send({ type: "ARROW_DOWN", src: "space" })
            },
          }

          const key = getEventKey(event, {
            orientation: "vertical",
            dir: prop("dir"),
          })
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
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        dir: prop("dir"),
        id: dom.getPositionerId(scope),
        style: popperStyles.floating,
      })
    },

    getArrowProps() {
      return normalize.element({
        id: dom.getArrowId(scope),
        ...parts.arrow.attrs,
        dir: prop("dir"),
        style: popperStyles.arrow,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs,
        dir: prop("dir"),
        style: popperStyles.arrowTip,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        "aria-label": prop("aria-label"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        role: composite ? "menu" : "dialog",
        tabIndex: 0,
        dir: prop("dir"),
        "aria-activedescendant": computed("highlightedId") || undefined,
        "aria-labelledby": dom.getTriggerId(scope),
        "data-placement": currentPlacement,
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "MENU_POINTERENTER" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!contains(event.currentTarget, getEventTarget(event))) return

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

          const keyMap: EventKeyMap = {
            ArrowDown() {
              send({ type: "ARROW_DOWN" })
            },
            ArrowUp() {
              send({ type: "ARROW_UP" })
            },
            ArrowLeft() {
              send({ type: "ARROW_LEFT" })
            },
            ArrowRight() {
              send({ type: "ARROW_RIGHT" })
            },
            Enter() {
              send({ type: "ENTER" })
            },
            Space(event) {
              if (isTypingAhead) {
                send({ type: "TYPEAHEAD", key: event.key })
              } else {
                keyMap.Enter?.(event)
              }
            },
            Home() {
              send({ type: "HOME" })
            },
            End() {
              send({ type: "END" })
            },
          }

          const key = getEventKey(event, { dir: prop("dir") })
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.stopPropagation()
            event.preventDefault()
            return
          }

          // typeahead
          if (!prop("typeahead")) return
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
        dir: prop("dir"),
        "aria-orientation": "horizontal",
      })
    },

    getItemState,

    getItemProps,

    getOptionItemState,

    getOptionItemProps(props) {
      const { type, disabled, closeOnSelect } = props

      const option = getOptionItemProps(props)
      const itemState = getOptionItemState(props)

      return {
        ...getItemProps(option),
        ...normalize.element({
          "data-type": type,
          ...parts.item.attrs,
          dir: prop("dir"),
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
          },
        }),
      }
    },

    getItemIndicatorProps(props) {
      const itemState = getOptionItemState(cast(props))
      const dataState = itemState.checked ? "checked" : "unchecked"
      return normalize.element({
        ...parts.itemIndicator.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": hasProp(props, "checked") ? dataState : undefined,
        hidden: hasProp(props, "checked") ? !itemState.checked : undefined,
      })
    },

    getItemTextProps(props) {
      const itemState = getOptionItemState(cast(props))
      const dataState = itemState.checked ? "checked" : "unchecked"
      return normalize.element({
        ...parts.itemText.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": hasProp(props, "checked") ? dataState : undefined,
      })
    },

    getItemGroupLabelProps(props) {
      return normalize.element({
        ...parts.itemGroupLabel.attrs,
        id: dom.getGroupLabelId(scope, props.htmlFor),
        dir: prop("dir"),
      })
    },

    getItemGroupProps(props) {
      return normalize.element({
        id: dom.getGroupId(scope, props.id),
        ...parts.itemGroup.attrs,
        dir: prop("dir"),
        "aria-labelledby": dom.getGroupLabelId(scope, props.id),
        role: "group",
      })
    },
  }
}
