import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { getPlacementStyles } from "@zag-js/popper"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send, MachineApi } from "./nav-menu.types"
import { parts } from "./nav-menu.anatomy"
import { dom } from "./nav-menu.dom"
import { isSafari } from "@zag-js/dom-query"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const activeId = state.context.activeId

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  const dispatchArrowUpLeft = (id: string) => {
    send({ type: "ITEM_PREV", id })
  }
  const dispatchArrowDownRight = (id: string) => {
    send({ type: "ITEM_NEXT", id })
  }

  return {
    rootProps: normalize.element({
      ...parts.root.attrs,
      dir: state.context.dir,
      id: dom.getRootId(state.context),
      "data-orientation": state.context.orientation,
    }),
    indicatorProps: normalize.element({
      ...parts.indicator.attrs,
      dir: state.context.dir,
      "data-state": activeId ? "open" : "closed",
    }),
    separatorProps: normalize.element({
      ...parts.separator.attrs,
      role: "separator",
      dir: state.context.dir,
      "aria-orientation": "horizontal",
    }),
    getTriggerProps(props) {
      const { id } = props

      return normalize.element({
        ...parts.trigger.attrs,
        dir: state.context.dir,
        id: dom.getTriggerId(state.context, id),
        "data-placement": state.context.currentPlacement,
        "aria-expanded": activeId === id || undefined,
        "aria-controls": dom.getMenuContentId(state.context, id),
        "data-ownedby": dom.getRootId(state.context),
        onFocus() {
          send({ type: "TRIGGER_FOCUS", id })
        },
        onClick(event) {
          if (isSafari()) {
            event.currentTarget.focus()
          }
          send({ type: "TRIGGER_CLICK", id })
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowDown() {
              dispatchArrowDownRight(id)
            },
            ArrowUp() {
              dispatchArrowUpLeft(id)
            },
            ArrowLeft() {
              dispatchArrowUpLeft(id)
            },
            ArrowRight() {
              dispatchArrowDownRight(id)
            },
            Home() {
              send("HOME")
            },
            End() {
              send("END")
            },
          }

          const key = getEventKey(event, {
            dir: state.context.dir,
            orientation: state.context.orientation,
          })

          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },
    getPositionerProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.positioner.attrs,
        dir: state.context.dir,
        id: dom.getPositionerId(state.context, id),
        style: popperStyles.floating,
      })
    },
    getContentProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.content.attrs,
        dir: state.context.dir,
        id: dom.getMenuContentId(state.context, id),
        tabIndex: 0,
        "data-state": activeId === id ? "open" : "closed",
        hidden: activeId !== id,
        "aria-labelledby": dom.getTriggerId(state.context, id),
        "aria-activedescendant": state.context.highlightedItemId ?? undefined,
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowUp() {
              dispatchArrowUpLeft(id)
            },
            ArrowDown() {
              dispatchArrowDownRight(id)
            },
            ArrowLeft() {
              dispatchArrowUpLeft(id)
            },
            ArrowRight() {
              dispatchArrowDownRight(id)
            },
            Home() {
              send({ type: "HOME", id })
            },
            End() {
              send({ type: "END", id })
            },
          }

          const key = getEventKey(event, {
            dir: state.context.dir,
            orientation: state.context.orientation,
          })

          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },
    getMenuItemProps(props) {
      const { id } = props
      return normalize.element({
        ...parts["menu-item"].attrs,
        id,
        "data-ownedby": state.context.activeContentId ?? undefined,
      })
    },
  }
}
