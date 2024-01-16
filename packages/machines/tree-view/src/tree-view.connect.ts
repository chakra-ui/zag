import { getEventKey, getNativeEvent, isModifiedEvent, type EventKeyMap } from "@zag-js/dom-event"
import { contains, dataAttr, getEventTarget, isHTMLElement } from "@zag-js/dom-query"
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
    return {
      id: props.id,
      isDisabled: Boolean(props.disabled),
      isFocused: focusedId === props.id,
      isSelected: selectedIds.has(props.id),
    }
  }

  function getBranchState(props: BranchProps): BranchState {
    return {
      id: props.id,
      isDisabled: Boolean(props.disabled),
      isFocused: focusedId === props.id,
      isExpanded: expandedIds.has(props.id),
      isSelected: selectedIds.has(props.id),
    }
  }

  return {
    selectedIds,
    expand(ids: Set<string>) {
      const nextSet = new Set(expandedIds)
      ids.forEach((id) => nextSet.add(id))
      send({ type: "EXPANDED.SET", value: nextSet })
    },
    expandAll() {
      const nextSet = new Set<string>()
      const walker = dom.getTreeWalker(state.context, { skipHidden: false })
      while (walker.nextNode()) {
        const node = walker.currentNode
        const nodeId = dom.getNodeId(node)
        if (isHTMLElement(node) && node.dataset.part === "branch-control" && nodeId != null) {
          nextSet.add(nodeId)
        }
      }
      send({ type: "EXPANDED.SET", value: nextSet })
    },
    collapse(ids: Set<string>) {
      const nextSet = new Set(expandedIds)
      ids.forEach((id) => nextSet.delete(id))
      send({ type: "EXPANDED.SET", value: nextSet })
    },
    collapseAll() {
      send({ type: "EXPANDED.SET", value: new Set([]) })
    },
    selectAll() {
      send({ type: "ITEM.SELECT_ALL" })
    },
    select(ids: Set<string>) {
      send({ type: "SELECTED.SET", value: ids })
    },
    focusBranch(id: string) {
      dom.getBranchControlEl(state.context, id)?.focus()
    },

    focusItem(id: string) {
      const itemEl = dom.getItemEl(state.context, id)
      itemEl?.focus()
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      id: dom.getRootId(state.context),
      dir: state.context.dir,
    }),

    labelProps: normalize.element({
      ...parts.label.attrs,
      id: dom.getLabelId(state.context),
      dir: state.context.dir,
    }),

    treeProps: normalize.element({
      ...parts.tree.attrs,
      id: dom.getTreeId(state.context),
      dir: state.context.dir,
      role: "tree",
      "aria-label": "Tree View",
      "aria-labelledby": dom.getLabelId(state.context),
      "aria-multiselectable": state.context.selectionMode === "multiple" || undefined,
      onKeyDown(event) {
        const evt = getNativeEvent(event)
        const target = getEventTarget(evt) as HTMLElement | null

        const node = target?.closest<HTMLElement>("[role=treeitem]")
        if (!node) return

        const nodeId = dom.getNodeId(node)
        if (nodeId == null) {
          console.warn(`Node id not found for node`, node)
          return
        }

        const isBranchTrigger = !!target?.dataset.branch

        const keyMap: EventKeyMap = {
          ArrowDown(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.ARROW_DOWN", id: nodeId, shiftKey: event.shiftKey })
          },
          ArrowUp(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.ARROW_UP", id: nodeId, shiftKey: event.shiftKey })
          },
          ArrowLeft(event) {
            if (isModifiedEvent(event) || node.dataset.disabled) return
            event.preventDefault()
            send({ type: isBranchTrigger ? "BRANCH.ARROW_LEFT" : "ITEM.ARROW_LEFT", id: nodeId })
          },
          ArrowRight(event) {
            if (!isBranchTrigger || node.dataset.disabled) return
            event.preventDefault()
            send({ type: "BRANCH.ARROW_RIGHT", id: nodeId })
          },
          Home(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.HOME", id: nodeId, shiftKey: event.shiftKey })
          },
          End(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.END", id: nodeId, shiftKey: event.shiftKey })
          },
          Space(event) {
            if (node.dataset.disabled) return

            if (isTypingAhead) {
              send({ type: "TYPEAHEAD", key: event.key })
            } else {
              keyMap.Enter?.(event)
            }
          },
          Enter(event) {
            if (node.dataset.disabled) return

            event.preventDefault()
            send({ type: isBranchTrigger ? "BRANCH.CLICK" : "ITEM.CLICK", id: nodeId, src: "keyboard" })
          },
          "*"(event) {
            if (node.dataset.disabled) return
            event.preventDefault()
            send({ type: "BRANCH.EXPAND_LEVEL", id: nodeId })
          },
          a(event) {
            if (!event.metaKey || node.dataset.disabled) return
            event.preventDefault()
            send({ type: "ITEM.SELECT_ALL", preventScroll: true })
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
        dir: state.context.dir,
        "data-ownedby": dom.getTreeId(state.context),
        "data-item": itemState.id,
        tabIndex: itemState.isFocused ? 0 : -1,
        "data-focused": dataAttr(itemState.isFocused),
        role: "treeitem",
        "aria-current": itemState.isSelected ? "true" : undefined,
        "aria-selected": itemState.isDisabled ? undefined : itemState.isSelected,
        "data-selected": dataAttr(itemState.isSelected),
        "aria-disabled": itemState.isDisabled,
        "data-disabled": dataAttr(itemState.isDisabled),
        "aria-level": props.depth,
        "data-depth": props.depth,
        style: {
          "--depth": props.depth,
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "ITEM.FOCUS", id: itemState.id })
        },
        onClick(event) {
          if (itemState.isDisabled) return
          const isMetaKey = event.metaKey || event.ctrlKey
          send({ type: "ITEM.CLICK", id: itemState.id, shiftKey: event.shiftKey, ctrlKey: isMetaKey })
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
        "data-depth": props.depth,
        dir: state.context.dir,
        "data-branch": branchState.id,
        role: "treeitem",
        "data-ownedby": dom.getTreeId(state.context),
        "aria-level": props.depth,
        "aria-expanded": branchState.isExpanded,
        "data-state": branchState.isExpanded ? "open" : "closed",
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
        dir: state.context.dir,
        "data-disabled": dataAttr(branchState.isDisabled),
        "data-state": branchState.isExpanded ? "open" : "closed",
        onClick(event) {
          if (branchState.isDisabled) return
          send({ type: "BRANCH_TOGGLE.CLICK", id: branchState.id })
          event.stopPropagation()
        },
      })
    },

    getBranchControlProps(props: BranchProps) {
      const branchState = getBranchState(props)
      return normalize.element({
        ...parts.branchControl.attrs,
        role: "button",
        dir: state.context.dir,
        tabIndex: branchState.isFocused ? 0 : -1,
        "data-state": branchState.isExpanded ? "open" : "closed",
        "data-disabled": dataAttr(branchState.isDisabled),
        "data-selected": dataAttr(branchState.isSelected),
        "data-branch": branchState.id,
        "data-depth": props.depth,
        onFocus(event) {
          send({ type: "ITEM.FOCUS", id: branchState.id })
          event.stopPropagation()
        },
        onClick(event) {
          if (branchState.isDisabled) return

          const isMetaKey = event.metaKey || event.ctrlKey
          send({ type: "BRANCH.CLICK", id: branchState.id, shiftKey: event.shiftKey, ctrlKey: isMetaKey })

          event.stopPropagation()
        },
      })
    },

    getBranchTextProps(props: BranchProps) {
      const branchState = getBranchState(props)
      return normalize.element({
        ...parts.branchText.attrs,
        dir: state.context.dir,
        "data-branch": branchState.id,
        "data-disabled": dataAttr(branchState.isDisabled),
        "data-state": branchState.isExpanded ? "open" : "closed",
      })
    },

    getBranchContentProps(props: BranchProps) {
      const branchState = getBranchState(props)
      return normalize.element({
        ...parts.branchContent.attrs,
        role: "group",
        dir: state.context.dir,
        "data-branch": branchState.id,
        "data-state": branchState.isExpanded ? "open" : "closed",
        hidden: !branchState.isExpanded,
      })
    },
  }
}
