import { dataAttr, getEventKey, getWindow } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./navigation-menu.anatomy"
import * as dom from "./navigation-menu.dom"
import type { ItemProps, NavigationMenuApi, NavigationMenuService } from "./navigation-menu.types"

export function connect<T extends PropTypes>(
  service: NavigationMenuService,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, send, prop, scope, computed } = service

  const activeTriggerRect = context.get("triggerRect")
  const viewportSize = context.get("viewportSize")

  const value = context.get("value")
  const open = Boolean(value)

  const previousValue = context.get("previousValue")
  const isViewportRendered = context.get("isViewportRendered")
  const preventTransition = value && !previousValue

  function getItemState(props: ItemProps) {
    const selected = value === props.value
    const wasSelected = !value && previousValue === props.value
    return {
      triggerId: dom.getTriggerId(scope, props.value),
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
    orientation: prop("orientation")!,
    setValue(value) {
      send({ type: "VALUE.SET", value })
    },
    setParent(parent) {
      send({ type: "PARENT.SET", parent })
    },
    setChild(child) {
      send({ type: "CHILD.SET", value: child, id: child.prop("id")! })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        "aria-label": "Main",
        "data-orientation": prop("orientation")!,
        "data-type": computed("isSubmenu") ? "submenu" : "root",
        dir: prop("dir"),
        style: {
          "--trigger-width": activeTriggerRect != null ? activeTriggerRect.width + "px" : undefined,
          "--trigger-height": activeTriggerRect != null ? activeTriggerRect.height + "px" : undefined,
          "--trigger-x": activeTriggerRect != null ? activeTriggerRect.x + "px" : undefined,
          "--trigger-y": activeTriggerRect != null ? activeTriggerRect.y + "px" : undefined,
          "--viewport-width": viewportSize != null ? viewportSize.width + "px" : undefined,
          "--viewport-height": viewportSize != null ? viewportSize.height + "px" : undefined,
        },
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        id: dom.getListId(scope),
        dir: prop("dir"),
        "data-orientation": prop("orientation")!,
        "data-type": computed("isSubmenu") ? "submenu" : "root",
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: prop("dir"),
        "data-value": props.value,
        "data-state": itemState.open ? "open" : "closed",
        "data-orientation": prop("orientation")!,
        "data-disabled": dataAttr(itemState.disabled),
      })
    },

    getIndicatorTrackProps() {
      return normalize.element({
        ...parts.indicatorTrack.attrs,
        id: dom.getIndicatorTrackId(scope),
        dir: prop("dir"),
        "data-orientation": prop("orientation")!,
        style: { position: "relative" },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": prop("orientation")!,
        "data-type": computed("isSubmenu") ? "submenu" : "root",
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
        "data-orientation": prop("orientation")!,
      })
    },

    getTriggerProps(props) {
      const itemState = getItemState(props)
      return normalize.button({
        ...parts.trigger.attrs,
        id: itemState.triggerId,
        "data-uid": prop("id")!,
        dir: prop("dir"),
        disabled: props.disabled,
        "data-value": props.value,
        "data-state": itemState.selected ? "open" : "closed",
        "data-type": computed("isSubmenu") ? "submenu" : "root",
        "data-disabled": dataAttr(props.disabled),
        "aria-controls": itemState.contentId,
        "aria-expanded": itemState.selected,
        onPointerEnter() {
          send({ type: "TRIGGER.ENTER", value: props.value })
        },
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          if (itemState.disabled) return
          if (context.get("hasPointerMoveOpened") === props.value) return
          if (context.get("wasClickClose") === props.value) return
          if (context.get("wasEscapeClose")) return
          send({ type: "TRIGGER.MOVE", value: props.value })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          if (props.disabled) return
          if (computed("isSubmenu")) return
          send({ type: "TRIGGER.LEAVE", value: props.value })
        },
        onClick() {
          send({ type: "TRIGGER.CLICK", value: props.value })
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send({ type: "TRIGGER.FOCUS", target: "prev", value: props.value })
            },
            ArrowRight() {
              send({ type: "TRIGGER.FOCUS", target: "next", value: props.value })
            },
            Home() {
              send({ type: "TRIGGER.FOCUS", target: "first" })
            },
            End() {
              send({ type: "TRIGGER.FOCUS", target: "last" })
            },
            Enter() {
              send({ type: "TRIGGER.CLICK", value: props.value })
            },
            ArrowDown() {
              if (!itemState.selected) return
              send({ type: "CONTENT.FOCUS", value })
            },
          }

          const action = keyMap[getEventKey(event)]

          if (action) {
            action(event)
            event.preventDefault()
          }
        },
      })
    },

    getLinkProps(props) {
      return normalize.element({
        ...parts.link.attrs,
        dir: prop("dir"),
        "data-value": props.value,
        "data-current": dataAttr(props.current),
        "aria-current": props.current ? "page" : undefined,
        "data-ownedby": dom.getContentId(scope, props.value),
        onClick(event) {
          const { currentTarget } = event

          const win = getWindow(currentTarget)
          currentTarget.addEventListener("link.select", (event: any) => props.onSelect?.(event), { once: true })

          const selectEvent = new win.CustomEvent("link.select", { bubbles: true, cancelable: true })
          currentTarget.dispatchEvent(selectEvent)

          if (!selectEvent.defaultPrevented && !event.metaKey) {
            send({ type: "CONTENT.DISMISS" })
          }
        },
        onKeyDown(event) {
          const contentMenu = event.currentTarget.closest("[data-scope=navigation-menu][data-part=content]")
          const isWithinContent = !!contentMenu

          const keyMap: EventKeyMap = {
            ArrowLeft(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER.FOCUS", target: "prev", value: props.value })
              event.preventDefault()
            },
            ArrowRight(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER.FOCUS", target: "next", value: props.value })
              event.preventDefault()
            },
            Home(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER.FOCUS", target: "first" })
              event.preventDefault()
            },
            End(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER.FOCUS", target: "last" })
              event.preventDefault()
            },
            ArrowDown(event) {
              if (!isWithinContent) return
              send({ type: "LINK.FOCUS", target: "next", node: event.currentTarget, value: props.value })
              event.preventDefault()
            },
            ArrowUp(event) {
              if (!isWithinContent) return
              send({ type: "LINK.FOCUS", target: "prev", node: event.currentTarget, value: props.value })
              event.preventDefault()
            },
          }

          const action =
            keyMap[
              getEventKey(event, {
                orientation: prop("orientation"),
                dir: prop("dir"),
              })
            ]

          if (action) {
            action(event)
          }
        },
      })
    },

    getContentProps(props) {
      const itemState = getItemState(props)

      const currentValue = context.get("value") ?? context.get("previousValue")
      const selected = isViewportRendered ? currentValue === props.value : itemState.selected

      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope, props.value),
        dir: prop("dir"),
        hidden: !selected,
        "aria-labelledby": itemState.triggerId,
        "data-uid": prop("id")!,
        "data-state": selected ? "open" : "closed",
        "data-type": computed("isSubmenu") ? "submenu" : "root",
        "data-value": props.value,
        onPointerEnter() {
          if (computed("isSubmenu")) return
          send({ type: "CONTENT.ENTER", value: props.value })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          if (computed("isSubmenu")) return
          send({ type: "CONTENT.LEAVE", value: props.value })
        },
      })
    },

    getViewportPositionerProps() {
      return normalize.element({
        ...parts.viewportPositioner.attrs,
        dir: prop("dir"),
        "data-orientation": prop("orientation"),
      })
    },

    getViewportProps() {
      const open = Boolean(value)
      return normalize.element({
        ...parts.viewport.attrs,
        id: dom.getViewportId(scope),
        dir: prop("dir"),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": prop("orientation"),
        "data-type": computed("isSubmenu") ? "submenu" : "root",
        style: {
          transition: preventTransition ? "none" : undefined,
          pointerEvents: !open ? "none" : undefined,
        },
        onPointerEnter() {
          if (computed("isSubmenu")) return
          send({ type: "CONTENT.ENTER", src: "viewport" })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          if (computed("isSubmenu")) return
          send({ type: "CONTENT.LEAVE", src: "viewport" })
        },
      })
    },
  }
}
