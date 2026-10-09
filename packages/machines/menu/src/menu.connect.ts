import type { Service } from "@zag-js/core"
import { mergeProps } from "@zag-js/core"
import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import {
  ariaAttr,
  dataAttr,
  getEventKey,
  getEventPoint,
  getEventTarget,
  isContextMenuEvent,
  isDownloadingEvent,
  isComposingEvent,
  isEditableElement,
  isModifierKey,
  isOpeningInNewTab,
  isPrintableKey,
  contains,
  isValidTabEvent,
} from "@zag-js/dom-query"
import { getInteractionModality } from "@zag-js/focus-visible"
import { getPlacementSide, getPlacementStyles } from "@zag-js/popper"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { cast, hasProp } from "@zag-js/utils"
import { parts } from "./menu.anatomy"
import * as dom from "./menu.dom"
import { getTreeMenubar, setParentRoutingLock } from "./menu.utils"
import type {
  ContentState,
  ItemProps,
  ItemState,
  MenuApi,
  MenuSchema,
  OptionItemProps,
  OptionItemState,
  PositionerState,
  TriggerProps,
  TriggerState,
} from "./menu.types"

export function connect<T extends PropTypes>(service: Service<MenuSchema>, normalize: NormalizeProps<T>): MenuApi<T> {
  const { context, send, state, computed, prop, scope, refs } = service
  const layer = context.get("layer")

  const open = state.hasTag("open")

  const isSubmenu = context.get("isSubmenu")
  const isInMenubar = computed("isInMenubar")
  const instant = context.get("instant")
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
  const labelledBy = anchorPoint
    ? dom.getContextTriggerId(scope, triggerValue ?? undefined)
    : dom.getTriggerId(scope, triggerValue ?? undefined)

  const popperStyles = getPlacementStyles({
    ...prop("positioning"),
    placement: currentPlacement,
  })

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getItemState(props: ItemProps): ItemState {
    return {
      id: dom.getItemId(scope, props.value),
      disabled: !!props.disabled,
      highlighted: highlightedValue === props.value,
    }
  }

  function getTriggerState(props: TriggerProps = {}): TriggerState {
    const { value } = props
    const current = value == null ? false : triggerValue === value
    return {
      value,
      current,
      open: value == null ? open : open && current,
      disabled: !!menubarDisabled,
    }
  }

  function getPositionerState(): PositionerState {
    return { nested: !!layer?.nested, hasNested: !!layer?.hasNested }
  }

  function getContentState(): ContentState {
    return {
      open,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
      placement: currentPlacement,
      side: currentPlacementSide,
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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
      // WebKit only announces an `aria-activedescendant` change from a filter input when the item is also selected
      "aria-selected": !composite && itemState.highlighted && context.get("isWebKit") ? true : undefined,
      "data-value": value,
      "data-valuetext": valueText,
      onDragStart(event) {
        const isLink = event.currentTarget.matches("a[href]")
        if (isLink) event.preventDefault()
      },
      onPointerMove(event) {
        if (itemState.disabled) return
        if (event.pointerType !== "mouse") return
        // keyboard-driven scroll fires pointermove on the item that slid under the cursor
        if (getInteractionModality() !== "pointer") return
        const target = event.currentTarget
        if (itemState.highlighted) return
        const point = getEventPoint(event)
        send({ type: "ITEM_POINTERMOVE", id, target, closeOnSelect, point })
      },
      onPointerLeave(event) {
        if (itemState.disabled) return
        if (event.pointerType !== "mouse") return

        // keyboard-driven scroll fires pointerleave without any pointer input
        if (getInteractionModality() !== "pointer") return

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
        send({ type: "ITEM_CLICK", target, id, value, closeOnSelect })
      },
    })
  }

  return {
    highlightedValue,
    open,
    setOpen(nextOpen) {
      send({ type: nextOpen ? "OPEN" : "CLOSE", replaces: "open" })
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

    getTriggerState,
    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const triggerState = getTriggerState(props)
      const { current } = triggerState
      const triggerId = dom.getTriggerId(scope, value)
      return normalize.button({
        ...(isSubmenu ? parts.triggerItem.attrs(scope.id) : parts.trigger.attrs(scope.id)),
        // Inside a menubar, the trigger owns its tabIndex from the menubar's active id.
        role: isInMenubar ? "menuitem" : undefined,
        tabIndex: isInMenubar ? (menubarActiveId === triggerId ? 0 : -1) : undefined,
        disabled: triggerState.disabled || undefined,
        "aria-disabled": triggerState.disabled || undefined,
        "data-disabled": triggerState.disabled ? "" : undefined,
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
        "aria-expanded": triggerState.open,
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
          refs.set("pointerType", event.pointerType)
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
            pointerType: getPointerType(event),
          })
        },
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return
          if (!isInMenubar || open) return
          if (dom.isTargetDisabled(event.currentTarget)) return
          // Hover-to-open: once a sibling menu is open, hovering this trigger switches to it.
          if (dom.getMenubarEl(scope, menubarRootId)?.dataset.hasOpenMenu === "true") {
            send({ type: "OPEN", instant: true })
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
          // A character typed on the trigger of an open filterable menu lands in its input
          if (open && !isSubmenu && isPrintableKey(event) && event.key !== " " && !isModifierKey(event)) {
            dom.getInputEl(scope)?.focus({ preventScroll: true })
            return
          }
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

    getPositionerState,
    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        "data-instant": dataAttr(instant),
        ...getDismissableLayerAttrs(layer),
        style: {
          ...popperStyles.floating,
          ...getDismissableLayerStyle(layer, { zIndex: true }),
        },
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

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope),
        "aria-label": prop("aria-label"),
        hidden: !contentState.open,
        "data-state": contentState.open ? "open" : "closed",
        "data-instant": dataAttr(instant),
        role: composite ? "menu" : "dialog",
        tabIndex: 0,
        dir: prop("dir"),
        "aria-activedescendant": computed("highlightedId") || undefined,
        "aria-labelledby": labelledBy,
        "data-placement": contentState.placement,
        "data-side": contentState.side,
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer, { pointerEvents: true }),
        },
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "MENU_POINTERENTER" })
        },
        onPointerDown(event) {
          refs.set("pointerType", event.pointerType)
        },
        // A filter input owns focus while the menu is open: presses in the content keep it there
        onMouseDown(event) {
          const inputEl = dom.getInputEl(scope)
          const target = getEventTarget(event)
          if (!inputEl || target === inputEl || scope.getActiveElement() !== inputEl) return
          // Portaled submenus bubble through the framework tree, so only handle presses in this content
          if (!contains(event.currentTarget, target)) return
          event.preventDefault()
        },
        // ...and focus that lands in the content (a scrollbar press, a screen reader following the
        // active descendant) returns to it, unless a touch or pen press put it there
        onFocus(event) {
          const inputEl = dom.getInputEl(scope)
          const target = getEventTarget(event)
          if (!inputEl || target === inputEl || !open) return
          if (!contains(event.currentTarget, target)) return
          const pointerType = refs.get("pointerType")
          if (pointerType === "touch" || pointerType === "pen") return
          inputEl.focus({ preventScroll: true })
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

    getInputProps() {
      const highlightedId = computed("highlightedId")
      return normalize.input({
        ...parts.input.attrs(scope.id),
        id: dom.getInputId(scope),
        type: "text",
        role: "searchbox",
        autoComplete: "off",
        autoCorrect: "off",
        spellCheck: "false",
        dir: prop("dir"),
        "aria-autocomplete": "list",
        "aria-controls": dom.getListId(scope),
        "aria-activedescendant": highlightedId || undefined,
        "data-highlighted": dataAttr(!highlightedId),
        onChange() {
          send({ type: "INPUT.CHANGE" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented || isComposingEvent(event)) return
          // Escape stays with the dismissable layer
          if (event.key === "Escape") return
          // Keys typed in the input never reach the content's list navigation or typeahead
          event.stopPropagation()

          const hasValue = event.currentTarget.value !== ""
          const highlightedEl = highlightedId ? scope.getById(highlightedId) : null
          const opensSubmenu = !!highlightedEl?.hasAttribute("aria-haspopup")
          const modified = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey

          const keyMap: Record<string, (() => boolean) | undefined> = {
            ArrowDown() {
              if (modified) return false
              send({ type: "INPUT.NAVIGATE", key: "next" })
              return true
            },
            ArrowUp() {
              if (modified) return false
              send({ type: "INPUT.NAVIGATE", key: "prev" })
              return true
            },
            // Home and End move the caret unless the input is empty and an item is highlighted
            Home() {
              if (modified || !highlightedEl || hasValue) return false
              send({ type: "INPUT.NAVIGATE", key: "first" })
              return true
            },
            End() {
              if (modified || !highlightedEl || hasValue) return false
              send({ type: "INPUT.NAVIGATE", key: "last" })
              return true
            },
            ArrowRight() {
              if (modified || !opensSubmenu) return false
              send({ type: "ARROW_RIGHT" })
              return true
            },
            ArrowLeft() {
              if (modified || !isSubmenu || hasValue) return false
              send({ type: "ARROW_LEFT" })
              return true
            },
            Enter() {
              if (!highlightedEl) return true
              if (opensSubmenu || !modified) {
                send({ type: "ENTER" })
                return true
              }
              // Keep the modifiers so a link item can open in a new tab or window
              dom.dispatchClickWithModifiers(highlightedEl, event)
              return true
            },
            Tab() {
              if (event.shiftKey) {
                send({ type: isSubmenu ? "ARROW_LEFT" : "CLOSE" })
              } else {
                send({ type: "INPUT.TAB" })
              }
              return true
            },
          }

          const exec = keyMap[getEventKey(event, { dir: prop("dir") })]
          if (exec?.()) event.preventDefault()
        },
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs(scope.id),
        id: dom.getListId(scope),
        dir: prop("dir"),
        // A dialog popup holds the input, so the list takes the menu role
        role: composite ? "presentation" : "menu",
        "aria-labelledby": composite ? undefined : labelledBy,
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
            send({ type: "ITEM_CLICK", target, option, value: option.value, closeOnSelect })
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

const getPointerType = (event: { nativeEvent?: Event } | Event): string | undefined => {
  const nativeEvent = "nativeEvent" in event && event.nativeEvent ? event.nativeEvent : event
  return "pointerType" in nativeEvent ? (nativeEvent as PointerEvent).pointerType : undefined
}
