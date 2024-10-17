import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, getWindow } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./navigation-menu.anatomy"
import { dom } from "./navigation-menu.dom"
import type { ItemProps, MachineApi, Send, State } from "./navigation-menu.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const open = Boolean(state.context.value)

  const activeTriggerRect = state.context.activeTriggerRect
  const viewportSize = state.context.viewportSize

  const value = state.context.value
  const previousValue = state.context.previousValue
  const isViewportRendered = state.context.isViewportRendered
  const preventTransition = state.context.value && !state.context.previousValue

  function getItemState(props: ItemProps) {
    const selected = value === props.value
    const wasSelected = !value && previousValue === props.value
    return {
      triggerId: dom.getTriggerId(state.context, props.value),
      contentId: dom.getContentId(state.context, props.value),
      selected,
      wasSelected,
      open: selected || wasSelected,
      disabled: !!props.disabled,
    }
  }

  return {
    open,
    value,
    orientation: state.context.orientation!,
    setValue(value) {
      send({ type: "SET_VALUE", value })
    },
    setParent(parent) {
      send({ type: "SET_PARENT", parent })
    },
    setChild(child) {
      send({ type: "SET_CHILD", value: child, id: child.state.context.id })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(state.context),
        "aria-label": "Main",
        "data-orientation": state.context.orientation,
        "data-type": state.context.isSubmenu ? "submenu" : "root",
        dir: state.context.dir,
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
        id: dom.getListId(state.context),
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        "data-type": state.context.isSubmenu ? "submenu" : "root",
      })
    },

    getItemProps(props) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-value": props.value,
        "data-state": itemState.open ? "open" : "closed",
        "data-orientation": state.context.orientation,
        "data-disabled": dataAttr(itemState.disabled),
      })
    },

    getIndicatorTrackProps() {
      return normalize.element({
        ...parts.indicatorTrack.attrs,
        id: dom.getIndicatorTrackId(state.context),
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
        style: { position: "relative" },
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        dir: state.context.dir,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": state.context.orientation,
        "data-type": state.context.isSubmenu ? "submenu" : "root",
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
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
      })
    },

    getTriggerProps(props) {
      const itemState = getItemState(props)
      return normalize.button({
        ...parts.trigger.attrs,
        id: itemState.triggerId,
        "data-uid": state.context.id,
        dir: state.context.dir,
        disabled: props.disabled,
        "data-value": props.value,
        "data-state": itemState.selected ? "open" : "closed",
        "data-type": state.context.isSubmenu ? "submenu" : "root",
        "data-disabled": dataAttr(props.disabled),
        "aria-controls": itemState.contentId,
        "aria-expanded": itemState.selected,
        onPointerEnter() {
          send({ type: "TRIGGER_ENTER", value: props.value })
        },
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          if (itemState.disabled) return
          if (state.context.hasPointerMoveOpenedRef === props.value) return
          if (state.context.wasClickCloseRef === props.value) return
          if (state.context.wasEscapeCloseRef) return
          send({ type: "TRIGGER_MOVE", value: props.value })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          if (props.disabled) return
          if (state.context.isSubmenu) return
          send({ type: "TRIGGER_LEAVE", value: props.value })
        },
        onClick() {
          send({ type: "TRIGGER_CLICK", value: props.value })
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowLeft() {
              send({ type: "TRIGGER_FOCUS", target: "prev", value: props.value })
            },
            ArrowRight() {
              send({ type: "TRIGGER_FOCUS", target: "next", value: props.value })
            },
            Home() {
              send({ type: "TRIGGER_FOCUS", target: "first" })
            },
            End() {
              send({ type: "TRIGGER_FOCUS", target: "last" })
            },
            Enter() {
              send({ type: "TRIGGER_CLICK", value: props.value })
            },
            ArrowDown() {
              if (!itemState.selected) return
              send({ type: "CONTENT_FOCUS", value })
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
        dir: state.context.dir,
        "data-value": props.value,
        "data-current": dataAttr(props.current),
        "aria-current": props.current ? "page" : undefined,
        "data-ownedby": dom.getContentId(state.context, props.value),
        onClick(event) {
          const { currentTarget } = event

          const win = getWindow(currentTarget)
          currentTarget.addEventListener("link.select", (event: any) => props.onSelect?.(event), { once: true })

          const selectEvent = new win.CustomEvent("link.select", { bubbles: true, cancelable: true })
          currentTarget.dispatchEvent(selectEvent)

          if (!selectEvent.defaultPrevented && !event.metaKey) {
            send({ type: "CONTENT_DISMISS" })
          }
        },
        onKeyDown(event) {
          const contentMenu = event.currentTarget.closest("[data-scope=navigation-menu][data-part=content]")
          const isWithinContent = !!contentMenu

          const keyMap: EventKeyMap = {
            ArrowLeft(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER_FOCUS", target: "prev", value: props.value })
              event.preventDefault()
            },
            ArrowRight(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER_FOCUS", target: "next", value: props.value })
              event.preventDefault()
            },
            Home(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER_FOCUS", target: "first" })
              event.preventDefault()
            },
            End(event) {
              if (isWithinContent) return
              send({ type: "TRIGGER_FOCUS", target: "last" })
              event.preventDefault()
            },
            ArrowDown(event) {
              if (!isWithinContent) return
              send({ type: "LINK_FOCUS", target: "next", node: event.currentTarget, value: props.value })
              event.preventDefault()
            },
            ArrowUp(event) {
              if (!isWithinContent) return
              send({ type: "LINK_FOCUS", target: "prev", node: event.currentTarget, value: props.value })
              event.preventDefault()
            },
          }

          const action = keyMap[getEventKey(event, state.context)]

          if (action) {
            action(event)
          }
        },
      })
    },

    getContentProps(props) {
      const itemState = getItemState(props)

      const activeContentValue = state.context.value ?? state.context.previousValue
      const selected = isViewportRendered ? activeContentValue === props.value : itemState.selected

      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(state.context, props.value),
        dir: state.context.dir,
        hidden: !selected,
        "aria-labelledby": itemState.triggerId,
        "data-uid": state.context.id,
        "data-state": selected ? "open" : "closed",
        "data-type": state.context.isSubmenu ? "submenu" : "root",
        "data-value": props.value,
        onPointerEnter() {
          if (state.context.isSubmenu) return
          send({ type: "CONTENT_ENTER", value: props.value })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          if (state.context.isSubmenu) return
          send({ type: "CONTENT_LEAVE", value: props.value })
        },
      })
    },

    getViewportPositionerProps() {
      return normalize.element({
        ...parts.viewportPositioner.attrs,
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
      })
    },

    getViewportProps() {
      const open = Boolean(value)
      return normalize.element({
        ...parts.viewport.attrs,
        id: dom.getViewportId(state.context),
        dir: state.context.dir,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-orientation": state.context.orientation,
        "data-type": state.context.isSubmenu ? "submenu" : "root",
        style: {
          transition: preventTransition ? "none" : undefined,
          pointerEvents: !open ? "none" : undefined,
        },
        onPointerEnter() {
          if (state.context.isSubmenu) return
          send({ type: "CONTENT_ENTER", src: "viewport" })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          if (state.context.isSubmenu) return
          send({ type: "CONTENT_LEAVE", src: "viewport" })
        },
      })
    },
  }
}
