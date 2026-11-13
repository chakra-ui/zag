import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
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
import type {
  ContentProps,
  ContentMotion,
  ContentState,
  ItemProps,
  ItemState,
  NavigationMenuApi,
  NavigationMenuService,
  RootState,
  TriggerState,
  ViewportState,
} from "./navigation-menu.types"

export function connect<T extends PropTypes>(
  service: NavigationMenuService,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, send, prop, scope } = service
  const layer = context.get("layer")
  const translations = prop("translations")

  const triggerRect = context.get("triggerRect")

  const viewportSize = context.get("viewportSize")
  const viewportPosition = context.get("viewportPosition")

  const value = context.get("value")
  const previousValue = context.get("previousValue")
  const open = Boolean(value)

  const isViewportRendered = context.get("isViewportRendered")
  const direction = context.get("activationDirection")
  const activationDirection = direction === "none" ? null : direction
  const preventTransition = value && !previousValue

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getRootState(): RootState {
    return { open, orientation: prop("orientation") }
  }

  function getViewportState(): ViewportState {
    return { ...getRootState(), activationDirection }
  }

  function getItemState(props: ItemProps): ItemState {
    const selected = value === props.value
    const wasSelected = !value && previousValue === props.value
    return { selected, wasSelected, open: selected || wasSelected, disabled: !!props.disabled }
  }

  function getTriggerState(props: ItemProps): TriggerState {
    const itemState = getItemState(props)
    return { disabled: itemState.disabled, open: itemState.selected }
  }

  function getContentState(props: ContentProps): ContentState {
    const itemState = getItemState(props)
    const currentValue = context.get("value") || context.get("previousValue")
    const selected = isViewportRendered ? currentValue === props.value : itemState.selected
    const contentLayer = !isViewportRendered && selected ? layer : null
    return {
      open: selected,
      nested: !!contentLayer?.nested,
      hasNested: !!contentLayer?.hasNested,
      activationDirection,
      motion: isViewportRendered
        ? getContentMotion({ value: props.value, selectedValue: value, previousValue, activationDirection })
        : null,
    }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  return {
    open,
    value,
    orientation: prop("orientation"),
    isViewportRendered,
    activationDirection,
    getViewportNode() {
      return dom.getViewportEl(scope)
    },
    setValue(value, reason = "script") {
      send({ type: "VALUE.SET", value, src: reason })
    },
    reposition() {
      send({ type: "VIEWPORT.POSITION" })
    },

    getRootState,
    getRootProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.root.attrs(scope.id),
        "aria-label": translations?.rootLabel,
        "data-orientation": rootState.orientation,
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
      const rootState = getRootState()
      return normalize.element({
        ...parts.list.attrs(scope.id),
        dir: prop("dir"),
        "data-orientation": rootState.orientation,
        style: { position: "relative" },
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs(scope.id),
        id: dom.getItemId(scope, props.value),
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
      const rootState = getRootState()
      return normalize.element({
        ...parts.indicator.attrs(scope.id),
        "aria-hidden": true,
        dir: prop("dir"),
        hidden: !rootState.open,
        "data-state": rootState.open ? "open" : "closed",
        "data-orientation": rootState.orientation,
        style: {
          position: "absolute",
          transition: preventTransition ? "none" : undefined,
        },
      })
    },

    getArrowProps() {
      const rootState = getRootState()
      return normalize.element({
        ...parts.arrow.attrs(scope.id),
        "aria-hidden": true,
        dir: prop("dir"),
        "data-orientation": rootState.orientation,
      })
    },

    getTriggerState,
    getTriggerProps(props) {
      const itemState = getItemState(props)
      const triggerState = getTriggerState(props)
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        id: dom.getTriggerId(scope, props.value),
        type: "button",
        "data-uid": prop("id"),
        "data-trigger-proxy-id": dom.getTriggerProxyId(scope, props.value),
        dir: prop("dir"),
        disabled: triggerState.disabled,
        "data-value": props.value,
        "data-state": triggerState.open ? "open" : "closed",
        "data-disabled": dataAttr(triggerState.disabled),
        "aria-controls": dom.getContentId(scope, props.value),
        "aria-expanded": triggerState.open,
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
          send({ type: "TRIGGER.CLICK", value: props.value, src: "trigger-click" })
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
        id: dom.getTriggerProxyId(scope, props.value),
        "data-trigger-id": dom.getTriggerId(scope, props.value),
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
        ...parts.link.attrs(scope.id),
        dir: prop("dir"),
        "data-value": props.value,
        "data-current": dataAttr(props.current),
        "aria-current": props.current ? "page" : undefined,
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
            send({ type: "CLOSE", src: "item-select" })
          }
        },
        onKeyDown(event) {
          // Handle arrow key navigation between triggers and links
          const currentElement = event.currentTarget as HTMLElement

          // Check if this link is inside a content element (vs. direct child of item)
          const contentEl = currentElement.closest("[data-navigation-menu-content]")

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

    getContentState,
    getContentProps(props) {
      const contentState = getContentState(props)

      const contentLayer = !isViewportRendered && contentState.open ? layer : null

      return normalize.element({
        ...parts.content.attrs(scope.id),
        id: dom.getContentId(scope, props.value),
        dir: prop("dir"),
        hidden: !contentState.open,
        "aria-labelledby": dom.getTriggerId(scope, props.value),
        "data-state": contentState.open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-activation-direction": contentState.activationDirection ?? undefined,
        "data-motion": contentState.motion ?? undefined,
        "data-value": props.value,
        ...getDismissableLayerAttrs(contentLayer),
        style: getDismissableLayerStyle(contentLayer, { pointerEvents: true }),
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
          if (event.currentTarget.closest("[data-navigation-menu-root]") !== dom.getRootEl(scope)) return

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
      const rootState = getRootState()
      return normalize.element({
        ...parts.viewportPositioner.attrs(scope.id),
        dir: prop("dir"),
        "data-orientation": rootState.orientation,
        "data-align": align,
      })
    },

    getViewportState,
    getViewportProps(props = {}) {
      const { align = "center" } = props
      const viewportState = getViewportState()
      const viewportLayer = isViewportRendered ? layer : null
      return normalize.element({
        ...parts.viewport.attrs(scope.id),
        dir: prop("dir"),
        hidden: !viewportState.open,
        "data-state": viewportState.open ? "open" : "closed",
        "data-orientation": viewportState.orientation,
        "data-activation-direction": viewportState.activationDirection ?? undefined,
        "data-align": align,
        ...getDismissableLayerAttrs(viewportLayer),
        style: {
          ...getDismissableLayerStyle(viewportLayer),
          transition: preventTransition ? "none" : undefined,
          "--viewport-width": toPx(viewportSize?.width),
          "--viewport-height": toPx(viewportSize?.height),
          "--viewport-x": toPx(viewportPosition?.x),
          "--viewport-y": toPx(viewportPosition?.y),
          pointerEvents: !viewportState.open
            ? "none"
            : viewportLayer?.active
              ? viewportLayer.blocked
                ? "none"
                : "auto"
              : undefined,
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
        ...parts.itemIndicator.attrs(scope.id),
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

interface ContentMotionParams {
  value: string
  selectedValue: string | null
  previousValue: string | null
  activationDirection: ContentState["activationDirection"]
}

function getContentMotion(params: ContentMotionParams): ContentMotion | null {
  const { value, selectedValue, previousValue, activationDirection } = params
  if (!activationDirection) return null
  const forward = activationDirection === "right" || activationDirection === "down"
  if (value === selectedValue) return forward ? "from-end" : "from-start"
  if (value === previousValue) return forward ? "to-start" : "to-end"
  return null
}
