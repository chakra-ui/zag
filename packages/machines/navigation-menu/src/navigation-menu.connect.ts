import {
  contains,
  dataAttr,
  getTabbables,
  getWindow,
  isSelfTarget,
  navigate,
  visuallyHiddenStyle,
} from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./navigation-menu.anatomy"
import * as dom from "./navigation-menu.dom"
import type { ItemProps, ItemState, NavigationMenuApi, NavigationMenuService } from "./navigation-menu.types"

export function connect<T extends PropTypes>(
  service: NavigationMenuService,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, send, prop, scope } = service

  const triggerRect = context.get("triggerRect")

  const viewportSize = context.get("viewportSize")
  const viewportPosition = context.get("viewportPosition")

  const value = context.get("value")
  const previousValue = context.get("previousValue")
  const open = Boolean(value)

  const isViewportRendered = context.get("isViewportRendered")
  const preventTransition = value && !previousValue

  function getItemState(props: ItemProps): ItemState {
    const selected = value === props.value
    const wasSelected = !value && previousValue === props.value
    return {
      itemId: dom.getItemId(scope, props.value),
      triggerId: dom.getTriggerId(scope, props.value),
      triggerProxyId: dom.getTriggerProxyId(scope, props.value),
      contentId: dom.getContentId(scope, props.value),
      selected,
      wasSelected,
      open: selected || wasSelected,
      disabled: !!props.disabled,
    }
  }

  return {
    open,
    value,
    orientation: prop("orientation"),
    isViewportRendered,
    getViewportNode() {
      return dom.getViewportEl(scope)
    },
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    reposition() {
      send({ type: "VIEWPORT.POSITION" })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "aria-label": "Main Navigation",
        "data-orientation": prop("orientation"),
        dir: prop("dir"),
        style: {
          "--trigger-width": toPx(triggerRect?.width),
          "--trigger-height": toPx(triggerRect?.height),
          "--trigger-x": toPx(triggerRect?.x),
          "--trigger-y": toPx(triggerRect?.y),
          "--viewport-width": toPx(viewportSize?.width),
          "--viewport-height": toPx(viewportSize?.height),
          "--viewport-x": toPx(viewportPosition?.x),
          "--viewport-y": toPx(viewportPosition?.y),
        },
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(scope),
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        style: { position: "relative" },
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        id: itemState.itemId,
        dir: prop("dir"),
        "data-value": props.value,
        "data-state": itemState.open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-disabled": dataAttr(itemState.disabled),
        onKeyDown(event) {
          switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
            case "ArrowLeft":
            case "ArrowRight":
            case "Home":
            case "End": {
              send({ type: "ITEM.NAVIGATE", value: props.value, key: event.key })
              event.preventDefault()
              event.stopPropagation()
              break
            }
            default:
              break
          }
        },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        style: {
          position: "absolute",
          transition: preventTransition ? "none" : undefined,
        },
      })
    },

    getArrowProps() {
      return normalize.element({
        ...parts.arrow.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
      })
    },

    getTriggerProps(props) {
      const itemState = getItemState(props)
      return normalize.button({
        ...parts.trigger.attrs,
        id: itemState.triggerId,
        "data-uid": prop("id"),
        "data-trigger-proxy-id": dom.getTriggerProxyId(scope, props.value),
        dir: prop("dir"),
        disabled: itemState.disabled,
        "data-value": props.value,
        "data-state": itemState.selected ? "open" : "closed",
        "data-disabled": dataAttr(itemState.disabled),
        "aria-controls": itemState.contentId,
        "aria-expanded": itemState.selected,
        onPointerEnter(event) {
          if (prop("disableHoverTrigger")) return
          if (event.pointerType !== "mouse") return
          if (itemState.disabled) return
          send({ type: "TRIGGER.POINTERENTER", value: props.value })
        },
        onPointerLeave(event) {
          if (prop("disableHoverTrigger")) return
          if (event.pointerType !== "mouse") return
          if (itemState.disabled) return
          send({ type: "TRIGGER.POINTERLEAVE", value: props.value })
        },
        onClick() {
          if (prop("disableClickTrigger")) return
          send({ type: "TRIGGER.CLICK", value: props.value })
        },
        onKeyDown(event) {
          const verticalEntryKey = prop("dir") === "rtl" ? "ArrowLeft" : "ArrowRight"
          const entryKey = {
            horizontal: "ArrowDown",
            vertical: verticalEntryKey,
          }[prop("orientation")]

          // Handle entry key (open menu and focus first link)
          if (open && event.key === entryKey) {
            send({ type: "CONTENT.FOCUS", side: "start" })
            event.preventDefault()
            event.stopPropagation()
            return
          }

          // Handle arrow key navigation between triggers
          const elements = dom.getElements(scope)
          const currentElement = event.currentTarget as HTMLElement

          const nextElement = navigate(elements, currentElement, {
            key: event.key,
            orientation: prop("orientation"),
            dir: prop("dir"),
            loop: false,
          })

          if (nextElement) {
            nextElement.focus()
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },

    getTriggerProxyProps(props) {
      const itemState = getItemState(props)

      return normalize.element({
        "aria-hidden": true,
        tabIndex: 0,
        "data-trigger-proxy": "",
        id: itemState.triggerProxyId,
        "data-trigger-id": itemState.triggerId,
        hidden: !itemState.selected,
        style: visuallyHiddenStyle,
        onFocus(event) {
          const contentEl = dom.getContentEl(scope, props.value)
          if (!contentEl) return
          const prevFocusedEl = event.relatedTarget as HTMLElement | null

          const wasTriggerFocused = prevFocusedEl === dom.getTriggerEl(scope, props.value)
          const wasFocusFromContent = contains(contentEl, prevFocusedEl)

          if (wasTriggerFocused || !wasFocusFromContent) {
            send({ type: "CONTENT.FOCUS", side: wasTriggerFocused ? "start" : "end" })
          }
        },
      })
    },

    getViewportProxyProps(props) {
      const itemState = getItemState(props)

      // Only render when item is open and viewport is used
      if (!itemState.selected || !isViewportRendered) {
        return { hidden: true }
      }

      return normalize.element({
        "aria-owns": dom.getContentId(scope, props.value),
      })
    },

    getLinkProps(props) {
      const { closeOnClick = true } = props
      return normalize.element({
        ...parts.link.attrs,
        dir: prop("dir"),
        "data-value": props.value,
        "data-current": dataAttr(props.current),
        "aria-current": props.current ? "page" : undefined,
        "data-ownedby": dom.getContentId(scope, props.value),
        onClick(event) {
          const target = event.currentTarget

          const win = getWindow(target)
          const onSelect = props.onSelect as EventListener
          target.addEventListener("link.select", onSelect, { once: true })

          const linkSelectEvent = new win.CustomEvent("link.select", {
            bubbles: true,
            cancelable: true,
            detail: { originalEvent: event },
          })

          target.dispatchEvent(linkSelectEvent)

          if (closeOnClick && !linkSelectEvent.defaultPrevented && !event.metaKey) {
            send({ type: "CLOSE" })
          }
        },
        onKeyDown(event) {
          // Handle arrow key navigation between triggers and links
          const currentElement = event.currentTarget as HTMLElement

          // Check if this link is inside a content element (vs. direct child of item)
          const contentEl = currentElement.closest('[data-scope="navigation-menu"][data-part="content"]')

          // If link is inside content, navigate among content links
          // Otherwise, navigate among top-level elements (triggers and direct child links)
          const elements = contentEl ? dom.getLinkEls(scope, props.value) : dom.getElements(scope)

          const nextElement = navigate(elements, currentElement, {
            key: event.key,
            orientation: prop("orientation"),
            dir: prop("dir"),
            loop: false,
          })

          if (nextElement) {
            nextElement.focus()
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },

    getContentProps(props) {
      const itemState = getItemState(props)

      const currentValue = context.get("value") || context.get("previousValue")
      const selected = isViewportRendered ? currentValue === props.value : itemState.selected

      return normalize.element({
        ...parts.content.attrs,
        id: itemState.contentId,
        dir: prop("dir"),
        hidden: !selected,
        "aria-labelledby": itemState.triggerId,
        "data-uid": prop("id"),
        "data-state": selected ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-value": props.value,
        onPointerEnter(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "CONTENT.POINTERENTER", value: props.value })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "CONTENT.POINTERLEAVE", value: props.value })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return

          // prevent parent menu triggering keydown event
          if (event.currentTarget.closest("[data-scope=navigation-menu][data-part=root]") !== dom.getRootEl(scope))
            return

          const isMetaKey = event.altKey || event.ctrlKey || event.metaKey
          const isTabKey = event.key === "Tab" && !isMetaKey
          const candidates = getTabbables(event.currentTarget)

          if (isTabKey) {
            const focusedElement = scope.getActiveElement()
            const index = candidates.findIndex((candidate) => candidate === focusedElement)
            const isMovingBackwards = event.shiftKey
            const nextCandidates = isMovingBackwards
              ? candidates.slice(0, index).reverse()
              : candidates.slice(index + 1, candidates.length)

            if (dom.focusFirst(scope, nextCandidates)) {
              // prevent browser tab keydown because we've handled focus
              event.preventDefault()
            } else {
              // If we can't focus that means we're at the edges
              // Focus the trigger proxy and let the browser's Tab continue
              // to move focus to the next element in natural tab order
              dom.getTriggerProxyEl(scope, props.value)?.focus()
              return
            }
          }

          if (!isSelfTarget(event)) return

          const el = navigate(candidates, scope.getActiveElement(), {
            key: event.key,
            dir: prop("dir"),
            loop: false,
          })

          if (el) {
            el.focus()
            event.preventDefault()
            event.stopPropagation()
          }
        },
      })
    },

    getViewportPositionerProps(props = {}) {
      const { align = "center" } = props
      return normalize.element({
        ...parts.viewportPositioner.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
        "data-align": align,
      })
    },

    getViewportProps(props = {}) {
      const { align = "center" } = props
      const open = Boolean(value)
      return normalize.element({
        ...parts.viewport.attrs,
        id: dom.getViewportId(scope),
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-align": align,
        style: {
          transition: preventTransition ? "none" : undefined,
          pointerEvents: !open ? "none" : undefined,
          "--viewport-width": toPx(viewportSize?.width),
          "--viewport-height": toPx(viewportSize?.height),
          "--viewport-x": toPx(viewportPosition?.x),
          "--viewport-y": toPx(viewportPosition?.y),
        },
        onPointerEnter() {
          send({ type: "CONTENT.POINTERENTER" })
        },
        onPointerLeave(event) {
          if (prop("disablePointerLeaveClose")) return
          if (event.pointerType !== "mouse") return
          send({ type: "CONTENT.POINTERLEAVE" })
        },
      })
    },

    getItemState,

    getItemIndicatorProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.itemIndicator.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        hidden: !itemState.selected,
        "data-state": itemState.selected ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-value": props.value,
      })
    },
  }
}
