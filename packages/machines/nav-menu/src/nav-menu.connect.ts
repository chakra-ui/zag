import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send } from "./nav-menu.types"
import { parts } from "./nav-menu.anatomy"
import { dom } from "./nav-menu.dom"
import { dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  return {
    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      "data-orientation": state.context.orientation,
    }),
    listProps: normalize.element({
      ...parts.list.attrs,
      id: dom.getListId(state.context),
      "data-orientation": state.context.orientation,
      onKeyDown(event) {
        // Do not fire events when interacting with menu links
        if (state.context.highlightedLinkId) return

        const keyMap: EventKeyMap = {
          ArrowRight() {
            if (state.hasTag("expanded") && state.context.orientation === "vertical") {
              return send({ type: "LINK_FIRST", id: state.context.activeId })
            }
            send("ITEM_NEXT")
          },
          ArrowLeft() {
            send("ITEM_PREV")
          },
          ArrowDown() {
            if (state.hasTag("expanded") && state.context.orientation === "horizontal") {
              return send({ type: "LINK_FIRST", id: state.context.activeId })
            }
            send("ITEM_NEXT")
          },
          ArrowUp() {
            send("ITEM_PREV")
          },
          Home() {
            send("ITEM_FIRST")
          },
          End() {
            send("ITEM_LAST")
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
    itemProps: normalize.element({
      ...parts.item.attrs,
      "data-ownedby": dom.getListId(state.context),
    }),
    getTriggerProps(props: { id: string }) {
      const { id } = props

      const triggerId = dom.getTriggerId(state.context, id)

      return normalize.button({
        ...parts.trigger.attrs,
        type: "button",
        id: triggerId,
        "aria-expanded": id === state.context.activeId,
        "aria-controls": dom.getContentId(state.context, id),
        "data-focus": dataAttr(state.context.focusedId === triggerId),
        onFocus() {
          send({ type: "ITEM_FOCUS", id: triggerId })
        },
        onBlur() {
          send("ITEM_BLUR")
        },
        onClick() {
          send({ type: "ITEM_CLICK", id })
        },
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "ITEM_POINTERMOVE", id: triggerId })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "ITEM_POINTERLEAVE", id: triggerId })
        },
      })
    },
    indicatorProps: normalize.element({
      ...parts.indicator.attrs,
    }),
    getContentProps(props: { id: string }) {
      const { id } = props

      return normalize.element({
        id: dom.getContentId(state.context, id),
        hidden: id !== state.context.activeId,
      })
    },
    linkContentGroupProps: normalize.element({
      ...parts.linkContentGroup.attrs,
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowDown() {
            send({ type: "LINK_NEXT", id: state.context.activeId })
          },
          ArrowUp() {
            send({ type: "LINK_PREV", id: state.context.activeId })
          },
          ArrowLeft() {
            send({ type: "LINK_PREV", id: state.context.activeId })
          },
          ArrowRight() {
            send({ type: "LINK_NEXT", id: state.context.activeId })
          },
          Home() {
            send({ type: "LINK_FIRST", id: state.context.activeId })
          },
          End() {
            send({ type: "LINK_LAST", id: state.context.activeId })
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
    getLinkProps(props: { id: string }) {
      const { id } = props

      const isActiveLink = state.context.activeLinkId === id

      const linkId = dom.getLinkId(state.context, id)

      return normalize.a({
        ...parts.link.attrs,
        id: linkId,
        "data-highlighted": dataAttr(!isActiveLink && state.context.highlightedLinkId === linkId),
        "data-focus": dataAttr(!isActiveLink && state.context.focusedId === linkId),
        "aria-current": isActiveLink ? "page" : undefined,
        onFocus(event) {
          if (dom.isItemEl(event.target)) {
            return send({ type: "ITEM_FOCUS", id: linkId })
          }
          send({ type: "LINK_FOCUS", id: linkId })
        },
        onPointerMove(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "LINK_POINTERMOVE", id: linkId, target: event.target })
        },
        onPointerLeave(event) {
          if (event.pointerType !== "mouse") return
          send({ type: "LINK_POINTERLEAVE", id: linkId, target: event.target })
        },
        onBlur(event) {
          if (dom.isItemEl(event.target)) {
            send("ITEM_BLUR")
          }
        },
        onClick() {
          send({ type: "LINK_CLICK", id })
        },
      })
    },
  }
}
