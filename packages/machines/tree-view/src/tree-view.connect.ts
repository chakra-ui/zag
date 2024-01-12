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
        if (isHTMLElement(node)) {
          nextSet.add(node.dataset.branch ?? node.id)
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
      const triggerEl = dom.getBranchTriggerEl(state.context, id)
      triggerEl?.focus()
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

        const itemOrBranch = target?.closest<HTMLElement>("[role=treeitem]")
        if (!itemOrBranch) return

        const isBranchTrigger = !!target?.dataset.branch

        const keyMap: EventKeyMap = {
          ArrowDown(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.ARROW_DOWN", id: itemOrBranch.id, shiftKey: event.shiftKey })
          },
          ArrowUp(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.ARROW_UP", id: itemOrBranch.id, shiftKey: event.shiftKey })
          },
          ArrowLeft(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: isBranchTrigger ? "BRANCH.ARROW_LEFT" : "ITEM.ARROW_LEFT", id: itemOrBranch.id })
          },
          ArrowRight(event) {
            if (!isBranchTrigger) return
            event.preventDefault()
            send({ type: "BRANCH.ARROW_RIGHT", id: itemOrBranch.id })
          },
          Home(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.HOME", id: itemOrBranch.id })
          },
          End(event) {
            if (isModifiedEvent(event)) return
            event.preventDefault()
            send({ type: "ITEM.END", id: itemOrBranch.id })
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
            send({ type: isBranchTrigger ? "BRANCH.CLICK" : "ITEM.CLICK", id: itemOrBranch.id })
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
        "data-depth": props.depth,
        style: {
          "--depth": props.depth,
        },
        onFocus(event) {
          event.stopPropagation()
          send({ type: "ITEM.FOCUS", id: itemState.id })
        },
        onClick(event) {
          send({ type: "ITEM.CLICK", id: itemState.id, shiftKey: event.shiftKey })
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
        dir: state.context.dir,
        tabIndex: branchState.isFocused ? 0 : -1,
        "data-selected": dataAttr(branchState.isSelected),
        "data-branch": branchState.id,
        "data-depth": props.depth,
        onFocus(event) {
          event.stopPropagation()
          send({ type: "ITEM.FOCUS", id: branchState.id })
        },
        onClick(event) {
          send({ type: "BRANCH.CLICK", id: branchState.id, shiftKey: event.shiftKey })
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
        dir: state.context.dir,
        "data-state": branchState.isExpanded ? "open" : "closed",
        hidden: !branchState.isExpanded,
      })
    },
  }
}
