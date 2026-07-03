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
import { getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { cast, hasProp } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import * as dom from "./menu.dom"
import { getTreeMenubar, setParentRoutingLock } from "./menu.utils"
import type {
  ItemProps,
  ItemState,
  MenuApi,
  MenuSchema,
  OptionItemProps,
  OptionItemState,
  TriggerProps,
} from "./menu.types"

export function connect<T extends PropTypes>(service: Service<MenuSchema>, normalize: NormalizeProps<T>): MenuApi<T> {
  const { context, send, state, computed, prop, scope } = service

  const open = state.hasTag("open")

  const isSubmenu = context.get("isSubmenu")
  const isInMenubar = computed("isInMenubar")
  const menubarDisabled = computed("menubarDisabled")
  const menubarActiveId = prop("menubar")?.activeId
  const menubarRootId = prop("menubar")?.rootId
  // In a vertical menubar, triggers stack and menus fly out sideways, so the cross-axis
  // keys change: the menu opens on ArrowRight and closes (not switches) on ArrowLeft.
  const isVerticalMenubar = isInMenubar && prop("menubar")?.orientation === "vertical"
  const isTypingAhead = computed("isTypingAhead")
  const composite = prop("composite")

  const currentPlacement = context.get("currentPlacement")
  const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : undefined
  const anchorPoint = context.get("anchorPoint")
  const highlightedValue = context.get("highlightedValue")
  const triggerValue = context.get("triggerValue")

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
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
      ...parts.item.attrs(scope.id),
      id,
      role: "menuitem",
      "aria-disabled": ariaAttr(itemState.disabled),
      "data-disabled": dataAttr(itemState.disabled),
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
        const point = getEventPoint(event)
        send({ type: "ITEM_POINTERMOVE", id, target, closeOnSelect, point })
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
    triggerValue,
    setTriggerValue(value) {
      send({ type: "TRIGGER_VALUE.SET", value })
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

    getContextTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const current = value == null ? false : triggerValue === value
      const contextTriggerId = dom.getContextTriggerId(scope, value)
      return normalize.element({
        ...parts.contextTrigger.attrs(scope.id),
        dir: prop("dir"),
        id: contextTriggerId,
        "data-value": value,
        "data-current": dataAttr(current),
        "data-state": open ? "open" : "closed",
        onPointerDown(event) {
          if (event.pointerType === "mouse") return
          const point = getEventPoint(event)
          send({ type: "CONTEXT_MENU_START", point, value })
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
          const shouldSwitch = open && value != null && !current
          send({
            type: shouldSwitch ? "TRIGGER_VALUE.SET" : "CONTEXT_MENU",
            point,
            value,
          })
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

    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const current = value == null ? false : triggerValue === value
      const triggerId = dom.getTriggerId(scope, value)
      return normalize.button({
        ...(isSubmenu ? parts.triggerItem.attrs(scope.id) : parts.trigger.attrs(scope.id)),
        // Inside a menubar, the trigger owns its tabIndex from the menubar's active id.
        role: isInMenubar ? "menuitem" : undefined,
        tabIndex: isInMenubar ? (menubarActiveId === triggerId ? 0 : -1) : undefined,
        disabled: menubarDisabled || undefined,
        "aria-disabled": menubarDisabled || undefined,
        "data-disabled": menubarDisabled ? "" : undefined,
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
        type: "button",
        dir: prop("dir"),
        id: triggerId,
        // Multi-trigger attributes - only included when value is provided
        ...(value != null && {
          "data-value": value,
          "data-current": dataAttr(current),
        }),
        "aria-haspopup": composite ? "menu" : "dialog",
        "aria-controls": dom.getContentId(scope),
        "data-controls": dom.getContentId(scope),
        "aria-expanded": value == null ? open : open && current,
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
          // Refs update synchronously; `send` may be deferred (e.g. React).
          setParentRoutingLock(service.refs.get("parent"), true)

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
          const shouldSwitch = open && value != null && !current
          send({
            type: shouldSwitch ? "TRIGGER_VALUE.SET" : "TRIGGER_CLICK",
            target: event.currentTarget,
            value,
          })
        },
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return
          if (!isInMenubar || open) return
          if (dom.isTargetDisabled(event.currentTarget)) return
          // Hover-to-open: once a sibling menu is open, hovering this trigger switches to it.
          if (dom.getMenubarEl(scope, menubarRootId)?.dataset.hasOpenMenu === "true") {
            send({ type: "OPEN" })
          }
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
            Enter() {
              send({ type: "ARROW_DOWN", src: "enter", value })
            },
            Space() {
              send({ type: "ARROW_DOWN", src: "space", value })
            },
          }

          if (isVerticalMenubar) {
            // Up/Down move between triggers (handled by the menubar), so the menu opens
            // on the cross-axis key (fly-out to the side).
            keyMap.ArrowRight = () => send({ type: "ARROW_DOWN", value })
          } else {
            keyMap.ArrowDown = () => send({ type: "ARROW_DOWN", value })
            keyMap.ArrowUp = () => send({ type: "ARROW_UP", value })
          }

          const key = getEventKey(event, {
            orientation: isVerticalMenubar ? "horizontal" : "vertical",
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
        ...parts.indicator.attrs(scope.id),
        dir: prop("dir"),
        "data-state": open ? "open" : "closed",
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.floating,
      })
    },

    getArrowProps() {
      return normalize.element({
        ...parts.arrow.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.arrow,
      })
    },

    getArrowTipProps() {
      return normalize.element({
        ...parts.arrowTip.attrs(scope.id),
        dir: prop("dir"),
        style: popperStyles.arrowTip,
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope),
        "aria-label": prop("aria-label"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        role: composite ? "menu" : "dialog",
        tabIndex: 0,
        dir: prop("dir"),
        "aria-activedescendant": computed("highlightedId") || undefined,
        "aria-labelledby": anchorPoint
          ? dom.getContextTriggerId(scope, triggerValue ?? undefined)
          : dom.getTriggerId(scope, triggerValue ?? undefined),
        "data-placement": currentPlacement,
        "data-side": currentPlacementSide,
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
              const menubar = getTreeMenubar(service)
              if (menubar.orientation === "vertical") {
                // Menus fly out to the right, so Left collapses one level: a submenu returns
                // to its parent; a top-level menubar menu closes back to its trigger.
                send({ type: isSubmenu ? "ARROW_LEFT" : "CLOSE" })
                return
              }
              // Horizontal: a top-level menubar menu hops to the previous sibling (stays open).
              if (isInMenubar && menubar.rootEl) {
                service.refs.set("menubarCloseReason", "list-navigation")
                dom.dispatchMenubarEvent(menubar.rootEl, "menu:focus-prev")
                return
              }
              send({ type: "ARROW_LEFT" })
            },
            ArrowRight() {
              const hv = context.get("highlightedValue")
              const isSubmenuTrigger =
                (hv != null ? dom.getItemEl(scope, hv) : null)?.getAttribute("aria-haspopup") === "menu"
              // A submenu trigger always opens its submenu (both orientations).
              if (isSubmenuTrigger) {
                send({ type: "ARROW_RIGHT" })
                return
              }
              // On a leaf, only a horizontal menubar hops to the next sibling (incl. from a
              // nested submenu). Vertical switches siblings via the trigger's Up/Down instead.
              const menubar = getTreeMenubar(service)
              if (menubar.orientation === "horizontal" && menubar.rootEl) {
                service.refs.set("menubarCloseReason", "list-navigation")
                dom.dispatchMenubarEvent(menubar.rootEl, "menu:focus-next")
                return
              }
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
        ...parts.separator.attrs(scope.id),
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
          ...parts.item.attrs(scope.id),
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
        ...parts.itemIndicator.attrs(scope.id),
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
        ...parts.itemText.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(itemState.disabled),
        "data-highlighted": dataAttr(itemState.highlighted),
        "data-state": hasProp(props, "checked") ? dataState : undefined,
      })
    },

    getItemGroupLabelProps(props) {
      return normalize.element({
        ...parts.itemGroupLabel.attrs(scope.id),
        id: dom.getGroupLabelId(scope, props.htmlFor),
        dir: prop("dir"),
      })
    },

    getItemGroupProps(props) {
      return normalize.element({
        id: dom.getGroupId(scope, props.id),
        ...parts.itemGroup.attrs(scope.id),
        dir: prop("dir"),
        "aria-labelledby": dom.getGroupLabelId(scope, props.id),
        role: "group",
      })
    },
  }
}
