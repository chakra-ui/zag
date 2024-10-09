import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send } from "./navigation-menu.types"
import { parts } from "./navigation-menu.anatomy"
import { dom } from "./navigation-menu.dom"
import { dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const open = Boolean(state.context.value)
  const isHorizontal = state.context.orientation === "horizontal"

  const activeTriggerRect = state.context.activeTriggerRect
  const viewportRect = state.context.viewportRect

  const value = state.context.value
  const previousValue = state.context.previousValue

  return {
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "aria-label": "main navigation",
        dir: state.context.dir,
      })
    },

    getListProps() {
      return normalize.element({
        ...parts.list.attrs,
        dir: state.context.dir,
        "data-orientation": state.context.orientation,
      })
    },

    getIndicatorProps() {
      return normalize.element({
        ...parts.indicator.attrs,
        "aria-hidden": true,
        dir: state.context.dir,
        "data-state": open ? "open" : "closed",
        "data-orientation": state.context.orientation,
        style: {
          position: "absolute",
          ...(isHorizontal
            ? {
                left: 0,
                width: activeTriggerRect != null ? activeTriggerRect.width + "px" : undefined,
                transform: activeTriggerRect != null ? `translateX(${activeTriggerRect.left}px)` : undefined,
                "--indicator-translate-x": activeTriggerRect != null ? `${activeTriggerRect.left}px` : undefined,
              }
            : {
                top: 0,
                height: activeTriggerRect != null ? activeTriggerRect.height + "px" : undefined,
                transform: activeTriggerRect != null ? `translateY(${activeTriggerRect.top}px)` : undefined,
                "--indicator-translate-y": activeTriggerRect != null ? `${activeTriggerRect.top}px` : undefined,
              }),
        },
      })
    },

    getTriggerProps(props: { value: string; disabled?: boolean }) {
      const open = state.value === props.value
      return normalize.button({
        ...parts.trigger.attrs,
        "data-uid": state.context.id,
        dir: state.context.dir,
        disabled: props.disabled,
        "data-disabled": dataAttr(props.disabled),
        id: dom.getTriggerId(state.context, props.value),
        "aria-controls": dom.getContentId(state.context, props.value),
        "aria-expanded": open,
        onPointerEnter() {
          send({ type: "trigger.pointer.enter", value: props.value })
        },
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          if (props.disabled) return
        },
        onPointerCancel(event) {
          if (event.pointerType !== "mouse") return
          if (props.disabled) return
        },
        onClick() {
          send({ type: "trigger.click", value: props.value })
        },
        onKeyDown(event) {
          const verticalEntryKey = state.context.dir === "rtl" ? "ArrowLeft" : "ArrowRight"
          //@ts-expect-error
          const entryKey = { horizontal: "ArrowDown", vertical: verticalEntryKey }[state.context.orientation]
          if (open && event.key === entryKey) {
            send({ type: "trigger.keydown", value: props.value })
            event.preventDefault()
          }
        },
      })
    },

    getLinkProps(props: { active: boolean }) {
      return normalize.element({
        ...parts.link.attrs,
        dir: state.context.dir,
        "data-active": dataAttr(props.active),
        "aria-current": props.active ? "page" : undefined,
        onClick(event) {
          const { metaKey, defaultPrevented } = event
          send({ type: "link.select", metaKey, defaultPrevented })
        },
      })
    },

    getContentProps(props: { value: string }) {
      const open = value === props.value
      const wasOpen = (() => {
        if (!value && previousValue) return previousValue === props.value
        return false
      })()
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        hidden: !(open || wasOpen),
        "data-state": open || wasOpen ? "open" : "closed",
        onPointerEnter() {
          send({ type: "content.enter", value: props.value })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "content.leave", value: props.value })
        },
      })
    },

    getViewportProps() {
      const open = Boolean(value)
      return normalize.element({
        ...parts.viewport.attrs,
        dir: state.context.dir,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          pointerEvents: !open ? "none" : undefined,
          "--viewport-width": viewportRect != null ? viewportRect.width + "px" : undefined,
          "--viewport-height": viewportRect != null ? viewportRect.height + "px" : undefined,
        },
      })
    },
  }
}
