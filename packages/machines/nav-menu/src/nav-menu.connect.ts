import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { getPlacementStyles } from "@zag-js/popper"
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import type { State, Send, MachineApi, ItemProps } from "./nav-menu.types"
import { parts } from "./nav-menu.anatomy"
import { dom } from "./nav-menu.dom"
import { dataAttr, isSafari } from "@zag-js/dom-query"
import { mergeProps } from "@zag-js/core"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const activeId = state.context.activeId
  const isSubmenu = state.context.isSubmenu
  const activeContentId = state.context.activeContentId

  const popperStyles = getPlacementStyles({
    ...state.context.positioning,
    placement: state.context.currentPlacement,
  })

  function getTriggerProps(props: ItemProps) {
    const { id } = props

    const isActiveId = state.context.activeId === id

    const dispatchArrowUpLeft = (id: string) => {
      send({ type: "ARROW_LEFT", id })
    }
    const dispatchArrowDownRight = (id: string) => {
      send({ type: "ARROW_RIGHT", id })
    }

    return normalize.button({
      ...(isSubmenu ? parts.triggerMenuItem.attrs : parts.trigger.attrs),
      dir: state.context.dir,
      id: dom.getTriggerId(state.context, id),
      "data-placement": state.context.currentPlacement,
      "aria-expanded": activeId === id,
      "aria-controls": dom.getMenuContentId(state.context, id),
      "data-ownedby": isSubmenu ? activeContentId ?? undefined : dom.getRootId(state.context),
      onFocus() {
        send({ type: "TRIGGER_FOCUS", id })
      },
      onBlur() {
        send({ type: "TRIGGER_BLUR", id: null })
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
            if (isActiveId && !state.context.isVertical) {
              return send({ type: "TO_FIRST_ITEM", id })
            }
            dispatchArrowDownRight(id)
          },
          ArrowUp() {
            dispatchArrowUpLeft(id)
          },
          ArrowLeft() {
            dispatchArrowUpLeft(id)
          },
          ArrowRight() {
            if (isActiveId && state.context.isVertical) {
              return send({ type: "TO_FIRST_ITEM", id })
            }
            dispatchArrowDownRight(id)
          },
          Home() {
            send("HOME")
          },
          End() {
            send("END")
          },
          Enter() {
            if (isSafari()) {
              event.currentTarget.focus()
            }
            send({ type: "TRIGGER_CLICK", id })
          },
          Space() {
            if (isSafari()) {
              event.currentTarget.focus()
            }
            send({ type: "TRIGGER_CLICK", id })
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
  }

  function getMenuItemProps(props: ItemProps & { href?: string }) {
    const { id, href } = props
    const ownedId = state.context.activeId ? dom.getMenuContentId(state.context, state.context.activeId) : undefined

    const dispatchArrowUpLeft = (id: string | null) => {
      if (!id) return
      send({ type: "ITEM_PREV", id })
    }
    const dispatchArrowDownRight = (id: string | null) => {
      if (!id) return
      send({ type: "ITEM_NEXT", id })
    }

    const isTriggerItem = (evt: JSX.BaseSyntheticEvent) => {
      return dom.isTriggerItem(evt.currentTarget)
    }

    return normalize.element({
      ...parts["menu-item"].attrs,
      href,
      id,
      "aria-current": href === state.context.activeLink ? "page" : undefined,
      "data-ownedby": ownedId,
      "data-highlighted": dataAttr(state.context.highlightedItemId === id),
      onPointerEnter() {
        send({ type: "ITEM_POINTER_ENTER", id })
      },
      onPointerLeave() {
        send({ type: "ITEM_POINTER_LEAVE", id })
      },
      onPointerDown(event) {
        if (!isTriggerItem(event)) {
          send({ type: "LINK_ACTIVE", href })
        }
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          ArrowUp() {
            dispatchArrowUpLeft(state.context.activeId)
          },
          ArrowDown() {
            dispatchArrowDownRight(state.context.activeId)
          },
          ArrowLeft() {
            dispatchArrowUpLeft(state.context.activeId)
          },
          ArrowRight() {
            dispatchArrowDownRight(state.context.activeId)
          },
          Home() {
            send({ type: "HOME", id: state.context.activeId })
          },
          End() {
            send({ type: "END", id: state.context.activeId })
          },
          Enter() {
            if (!isTriggerItem(event)) {
              send({ type: "LINK_ACTIVE", href })
            }
          },
          Space() {
            if (!isTriggerItem(event)) {
              send({ type: "LINK_ACTIVE", href })
            }
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
  }

  return {
    setParent(parent) {
      send({ type: "PARENT.SET", value: parent, id: parent.state.context.id })
    },
    setChild(child) {
      send({ type: "CHILD.SET", value: child, id: child.state.context.id })
    },
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
    getTriggerProps,
    getTriggerMenuItemProps(childApi, id) {
      return mergeProps(
        {
          ...getMenuItemProps({ id: childApi.getTriggerProps({ id }).id }),
          // Because a trigger button is not a link that defines an active page
          "aria-current": null,
        },
        childApi.getTriggerProps({ id }),
      )
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
      })
    },
    getMenuItemProps,
  }
}