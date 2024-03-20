import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send, MachineApi } from "./nav-menu.types"
import { parts } from "./nav-menu.anatomy"
import { dom } from "./nav-menu.dom"
import { dataAttr } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  return {
    setParent(parent) {
      send({ type: "SET_PARENT", value: parent, id: parent.state.context.id })
    },
    setChild(child, parentTriggerId) {
      send({ type: "SET_CHILD", value: child, id: [parentTriggerId, child.state.context.id].join("") })
    },
    listProps: normalize.element({
      ...parts.list.attrs,
      id: dom.getListId(state.context),
      "data-orientation": state.context.orientation,
      onKeyDown(event) {
        const matchingChildId = state.context.childrenIds.find((id) => id.includes(state.context.activeId!))
        const matchingChild = !!matchingChildId ? state.context.children[matchingChildId] : null

        // Do not fire events when interacting with menu links or a submenu has focus
        if (state.context.highlightedLinkId || !!matchingChild?.state.context.focusedId) return

        const keyMap: EventKeyMap = {
          ArrowRight() {
            send({ type: "ITEM_ARROWRIGHT", id: state.context.activeId })
          },
          ArrowLeft() {
            send("ITEM_ARROWLEFT")
          },
          ArrowDown() {
            send({ type: "ITEM_ARROWDOWN", id: state.context.activeId })
          },
          ArrowUp() {
            send("ITEM_ARROWLEFT")
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
    getTriggerProps(props) {
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
    getContentProps(props) {
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
    getLinkProps(props) {
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
