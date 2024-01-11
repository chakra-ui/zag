import { getEventKey, isModifiedEvent, type EventKeyMap } from "@zag-js/dom-event"
import { contains, dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./tree-view.anatomy"
import { dom } from "./tree-view.dom"
import type { BranchProps, BranchState, ItemProps, ItemState, Send, State } from "./tree-view.types"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const expandedIds = state.context.expandedIds
  const selectedIds = state.context.selectedIds
  const isTypingAhead = state.context.isTypingAhead
  const focusedId = state.context.focusedId

  function getItemState(props: ItemProps): ItemState {
    const id = dom.getItemId(state.context, props.id)
    return {
      id,
      isDisabled: Boolean(props.disabled),
      isFocused: focusedId === id,
      isSelected: selectedIds.has(id),
    }
  }

  function getBranchState(props: BranchProps): BranchState {
    const id = dom.getBranchId(state.context, props.id)
    return {
      id,
      isDisabled: Boolean(props.disabled),
      isFocused: focusedId === id,
      isExpanded: expandedIds.has(id),
      isSelected: selectedIds.has(id),
    }
  }

  return {
    open(ids: Set<number>) {
      send({ type: "OPEN.ITEMS", ids })
    },

    close(id: number) {
      send({ type: "ITEM.CLOSE", id })
    },

    closeAll() {
      send({ type: "EXPANDED.SET", value: new Set([]) })
    },

    toggle(id: number) {
      send({ type: "ITEM.TOGGLE", id })
    },

    selectAll() {
      send({ type: "ITEM.SELECT_ALL" })
    },

    deselect(ids?: Set<number>) {
      if (ids) {
        send({ type: "DESELECT.ITEMS", value: ids })
      } else {
        send({ type: "DESELECT.ALL" })
      }
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
    }),

    treeProps: normalize.element({
      ...parts.tree.attrs,
      id: dom.getTreeId(state.context),
      role: "tree",
      "aria-label": "Tree View",
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-multiselectable": state.context.selectionMode === "multiple" || undefined,
      onBlur(event) {
        if (contains(event.currentTarget, event.relatedTarget)) return
        send({ type: "TREE.BLUR" })
      },
    }),

    getItemState,
    getItemProps(props: ItemProps) {
      const itemState = getItemState(props)
      return normalize.element({
        ...parts.item.attrs,
        "data-ownedby": dom.getTreeId(state.context),
        id: itemState.id,
        tabIndex: itemState.isFocused ? 0 : -1,
        "data-focused": dataAttr(itemState.isFocused),
        role: "treeitem",
        "aria-current": itemState.isSelected ? "true" : undefined,
        "aria-selected": itemState.isDisabled ? undefined : itemState.isSelected,
        "data-selected": dataAttr(itemState.isSelected),
        "aria-disabled": itemState.isDisabled,
        "data-disabled": dataAttr(itemState.isDisabled),
        "aria-level": props.depth,
        style: {
          "--depth": props.depth,
        },
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowDown(event) {
              event.preventDefault()
              send({ type: "ITEM.ARROW_DOWN", id: itemState.id })
            },
            ArrowUp(event) {
              event.preventDefault()
              send({ type: "ITEM.ARROW_UP", id: itemState.id })
            },
            ArrowLeft(event) {
              event.preventDefault()
              send({ type: "ITEM.ARROW_LEFT", id: itemState.id })
            },
            Home(event) {
              event.preventDefault()
              send({ type: "ITEM.HOME", id: itemState.id })
            },
            End(event) {
              event.preventDefault()
              send({ type: "ITEM.END", id: itemState.id })
            },
            Space(event) {
              if (isTypingAhead) {
                send({ type: "TYPEAHEAD", key: event.key })
              } else {
                keyMap.Enter?.(event)
              }
            },
            Enter(event) {
              event.preventDefault()
              send({ type: "ITEM.CLICK", id: itemState.id })
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            exec(event)
          } else {
            const isValidTypeahead = event.key.length === 1 && !isModifiedEvent(event)
            if (!isValidTypeahead) return

            send({ type: "TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "ITEM.FOCUS", id: itemState.id })
        },
        onClick(event) {
          send({ type: "ITEM.CLICK", id: itemState.id })
          event.stopPropagation()
          event.preventDefault()
        },
      })
    },

    getBranchState,
    getBranchProps(props: BranchProps) {
      const branchState = getBranchState(props)
      return normalize.element({
        ...parts.branch.attrs,
        id: dom.getBranchId(state.context, props.id),
        role: "treeitem",
        "data-ownedby": dom.getTreeId(state.context),
        "aria-level": props.depth,
        "aria-expanded": branchState.isExpanded,
        "data-expanded": dataAttr(branchState.isExpanded),
        "aria-disabled": branchState.isDisabled,
        "data-disabled": dataAttr(branchState.isDisabled),
        style: {
          "--depth": props.depth,
        },
      })
    },

    getBranchTriggerProps(props: BranchProps) {
      const branchState = getBranchState(props)
      return normalize.element({
        ...parts.branchTrigger.attrs,
        role: "button",
        tabIndex: branchState.isFocused ? 0 : -1,
        "data-selected": dataAttr(branchState.isSelected),
        "data-branch": branchState.id,
        onKeyDown(event) {
          const keyMap: EventKeyMap = {
            ArrowDown(event) {
              event.preventDefault()
              send({ type: "ITEM.ARROW_DOWN", id: branchState.id })
            },
            ArrowUp(event) {
              event.preventDefault()
              send({ type: "ITEM.ARROW_UP", id: branchState.id })
            },
            ArrowLeft(event) {
              event.preventDefault()
              send({ type: "ITEM.ARROW_LEFT", id: branchState.id })
            },
            Home(event) {
              event.preventDefault()
              send({ type: "ITEM.HOME", id: branchState.id })
            },
            End(event) {
              event.preventDefault()
              send({ type: "ITEM.END", id: branchState.id })
            },
            ArrowRight(event) {
              event.preventDefault()
              send({ type: "BRANCH.ARROW_RIGHT", id: branchState.id })
            },
            Space(event) {
              event.preventDefault()
              send({ type: "BRANCH.TOGGLE", id: branchState.id })
            },
            Enter(event) {
              event.preventDefault()
              send({ type: "BRANCH.CLICK", id: branchState.id })
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            exec(event)
          } else {
            const isValidTypeahead = event.key.length === 1 && !isModifiedEvent(event)
            if (!isValidTypeahead) return

            send({ type: "TYPEAHEAD", key: event.key })
            event.preventDefault()
          }
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "ITEM.FOCUS", id: branchState.id })
        },
        onClick(event) {
          send({ type: "BRANCH.CLICK", id: branchState.id })
          event.stopPropagation()
          event.preventDefault()
        },
      })
    },

    getBranchContentProps(props: BranchProps) {
      const branchState = getBranchState(props)
      return normalize.element({
        ...parts.branchContent.attrs,
        role: "group",
        "data-state": branchState.isExpanded ? "open" : "closed",
        hidden: !branchState.isExpanded,
      })
    },
  }
}
